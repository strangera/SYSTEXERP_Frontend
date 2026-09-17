import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DetailFIN23050Response, Fin23050Service, PostFIN23050DetailInput, QueryFIN23050Response } from '@service/api/fin/fin23050.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { formatAmount } from '@shared/components/table-report/table-report.model';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { firstValueFrom, forkJoin } from 'rxjs';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

/** 查詢頁勾選多筆核銷單號後帶進本頁的最小資料 */
interface Fin23050CruState {
  items: QueryFIN23050Response[];
  /** 查詢頁選的傳票日期，目前 SP_FIN23050Posting 沒有 @VouDate 參數可以接，先保留欄位、尚未真的送進後端 */
  VouDate?: string | null;
}

/**
 * 傳票明細列：SP 回傳的欄位 + app-table-edit 用來標記列狀態的內部欄位。
 * SP 回傳的既有列不會帶 _dataStatus，交給 app-table-edit 的 initializeData 自動補 'original'；
 * 使用者自行新增的列在 onAddAccountingLine() 明確標成 'new'，藉此跟既有列區分(唯讀/可刪除等規則都靠這個欄位判斷)。
 */
interface Fin23050DetailLine extends DetailFIN23050Response {
  _dataStatus?: 'original' | 'new' | 'modified' | 'deleted';
}

/**
 * 1.2.3.5 暫付款核銷傳票拋轉作業 - 拋轉預覽頁
 *
 * 查詢頁勾選多筆核銷單號後按「預覽傳票」導進這頁，這頁把整批勾選的核銷單號一次送進
 * SP_FIN23050Detail(@ItemList TVP)，SP 內部會把所有項目的明細合併＋統一重新編序號(10,20,30...)，
 * 回傳一張扁平表(每列自帶 REDEEM_NO/PREP_NO/VouNo 等表頭欄位)，前端直接當成表格資料用。
 * 最後按「確定拋轉」時再依每列自帶的 REDEEM_NO/PREP_NO 分組，對每一組各自呼叫一次
 * SP_FIN23050Posting —— 比照 FIN23020-cru 的 forkJoin 做法。
 *
 * 注意：SP 回傳的明細列會多一筆虛擬列(Detail_ID=999999999，AccNo=123304，SerNo固定排最後)，那是
 * SP_FIN23050Detail 算出來給畫面看的「暫付款核銷轉列」貸方沖銷分錄(CreditAmt=同一張傳票所有真實明細的
 * 借方合計，DebitAmt=0)，GLS6002 沒有對應的實體列——不要自己在前端硬吃掉這筆虛擬列，少了它畫面上的
 * 借貸小計會不平衡(見下方 validateBeforePosting() 的借貸平衡檢查)。
 *
 * 2026-08-20 已用 sqlcmd 讀取 DB 端 SP_FIN23050Posting 最新定義(OBJECT_DEFINITION)查證：SP 人員已把它
 * 從舊版(只 UPDATE 既有列)升級成完整 A.刪除(GLS6002 有、@DetailTable 沒有的 SerNo)/B.更新(SerNo 相同)/
 * C.新增(@DetailTable 有、GLS6002 沒有的 SerNo) 三段式、依 SerNo 對照差異的邏輯，新增列可以正常 INSERT。
 * INSERT 時 ORG_ID 是 SP 內部寫死 '100310'、DetailNo 是 SP 自動帶 APS3010.VEN_No(廠商編號)，前端完全不用送
 * 這兩欄；前端只需要送 SerNo/AccDC/AccNo/AccAmt/NoteDesc 五欄(見 postFIN23050Details)。
 *
 * 這也代表送出拋轉時，那筆 123304 虛擬列一樣會被組進 details 送給 SP——因為它的 SerNo 是前端預覽時才重新
 * 編號的假值，在既有 GLS6002 裡找不到對應列，新版 SP 依 SerNo 差異比對後會把它當「新增」INSERT 成一筆真的
 * GLS6002 分錄，等於順便補上這筆一直缺的貸方沖銷分錄——這是新版 SP 的既有行為，不是本次前端改動特別處理的，
 * 之後若要調整這個行為要找 SP 人員，不在前端範圍。
 *
 * 表頭「畫面呈現」的簡化跟舊版一樣：FIN23050 每一筆核銷單號各自對應各自的既有傳票，理論上不是同一張，
 * 這裡仍是取第一筆的表頭欄位填頭部顯示，明細分組送出時按各自列自帶的 REDEEM_NO/PREP_NO 正確對應。
 */
@Component({
  selector: 'app-fin23050-cru',
  templateUrl: './fin23050-cru.component.html',
  standalone: true,
  imports: [CalendarComponent, MenubarComponent, PanelModule, ButtonModule, ReactiveFormsModule, InputTextComponent, ButtonComponent, TableEditComponent, TranslateModule]
})
export class FIN23050CRUComponent extends BasicCruPageComponent<Fin23050CruState> implements OnInit {
  private readonly fin23050Service = inject(Fin23050Service);
  private readonly dropdown = inject(DropdownApiService);
  private readonly destroyRef = inject(DestroyRef);

  /** 傳票主檔(對應 SP_FIN23050Detail 表頭)：Remark(傳票摘要)可編輯，其餘唯讀 */
  dataForm = this.formBuilder.group({
    VouNo: [{ value: null as string | null, disabled: true }],
    VoucherType: [{ value: null as string | null, disabled: true }],
    Voucher_Name: [{ value: null as string | null, disabled: true }],
    VouDate: [{ value: null as Date | null, disabled: true }],
    Remark: [null as string | null],
    CRT_USR_Name: [{ value: null as string | null, disabled: true }],
    CRT_Date: [{ value: null as Date | null, disabled: true }],
  });

  data: Fin23050DetailLine[] = [];
  initTable = false;
  /** 傳票明細初始載入後的原始快照，供「取消」按鈕還原編輯內容用 */
  private originalData: Fin23050DetailLine[] = [];
  private readonly orgOptions$ = this.dropdown.querySys3100();
  private readonly accNoOptions$ = this.dropdown.queryGls1005();

  columns: EditColumn[] = [
    { field: 'SerNo', header: '序號', width: '60px', textAlign: 'center', disabled: () => true },
    {
      field: 'AccNo', header: '科目代號', width: '160px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.accNoOptions$, optionLabel: 'value', optionValue: 'value',
      templateLabel: 'label', showClear: false,
      calculate: async (rowData: DetailFIN23050Response, value: any) => {
        const options = await firstValueFrom(this.accNoOptions$);
        const selected = options?.find(opt => opt.value === rowData.AccNo);
        return { AccCName: (selected as any)?.Name ?? '' };
      }
    },
    { field: 'AccCName', header: '科目名稱', width: '160px', textAlign: 'left', disabled: () => true },
    { field: 'VenNo', header: '廠商代號', width: '110px', textAlign: 'left', disabled: () => true },
    { field: 'NoteDesc', header: '摘要', type: 'input', width: '220px', textAlign: 'left' },
    {
      field: 'DebitAmt', header: '借方金額', width: '110px', type: 'inputNumber', format: formatAmount, textAlign: 'right', aggregate: 'sum',
      // 只有使用者自行新增的列可以輸入借方金額，既有列(SP帶出來的)維持唯讀
      disabled: (_value: any, _index?: number, rowData?: Fin23050DetailLine) => rowData?._dataStatus !== 'new',
    },
    {
      field: 'CreditAmt', header: '貸方金額', width: '110px', type: 'inputNumber', format: formatAmount, textAlign: 'right', aggregate: 'sum',
      disabled: (_value: any, _index?: number, rowData?: Fin23050DetailLine) => rowData?._dataStatus !== 'new',
    },
    {
      // 唯讀：SP_FIN23050Posting INSERT/UPDATE 時 ORG_ID 一律寫死 '100310'，不吃前端送的值，
      // 開放編輯只會讓使用者以為自己選的組織代號有送出、實際上被 SP 忽略，所以維持唯讀只顯示 SP 帶出來的值。
      field: 'Org_ID', header: '組織代號', width: '110px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.orgOptions$, optionLabel: 'value', optionValue: 'value',
      templateLabel: 'label', showClear: false, disabled: () => true,
      calculate: async (rowData: DetailFIN23050Response, value: any) => {
        const targetOrgId = rowData.Org_ID;
        if (targetOrgId) {
          try {
            const options = await firstValueFrom(this.dropdown.querySys3100());
            const selected = options?.find(opt => opt.value === targetOrgId);
            if (selected) {
              return { Org_Name: (selected as any).Name };
            }
          } catch (error) { }
        }
        return { Org_Name: '' };
      }
    },
    { field: 'Org_Name', header: '組織名稱', width: '110px', textAlign: 'left', disabled: () => true },
    { field: 'PTA', header: '立沖代號', textAlign: 'left', type: 'input', width: '70px' },
    { field: 'ACCT_KEY', header: '對帳key值', width: '120px', textAlign: 'left', disabled: () => true },
    // 活動代號：後端保留欄位，前端暫不顯示
    // { field: 'ProjectNo', header: '活動代號', width: '110px', textAlign: 'left', disabled: () => true },
    // 刪除鈕：實際內容交給 fin23050-cru.component.html 裡的 #customCell 樣板渲染，只有新增列會顯示可點擊的刪除鈕
    { field: '_delete', header: '', width: '50px', textAlign: 'center', type: 'custom' },
  ];

  ngOnInit(): void {
    this.initializePage('FIN23050', this.dataForm);
    this.formTitle = '暫付款核銷傳票拋轉預覽';

    const items = this.rowdata?.items ?? [];
    if (items.length === 0) return;

    this.loading = true;
    this.fin23050Service.detailFIN23050({
      Items: items.map(item => ({ REDEEM_NO: item.REDEEM_NO, PREP_NO: item.PREP_NO })),
    }).pipe(
      this.withLoading(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(res => {
      const lines = (res.Data ?? []).filter(line => line.AccCName !== '合計');

      const firstHeader = lines[0];
      if (firstHeader) {
        this.dataForm.patchValue({
          ...firstHeader,
          VouDate: firstHeader.VouDate ? new Date(firstHeader.VouDate) : null,
          CRT_Date: firstHeader.CRT_Date ? new Date(firstHeader.CRT_Date) : null,
        }, { emitEvent: false });

        this.dataForm.controls.VouNo.setValue('系統自動產生');
      }

      this.data = lines;
      this.originalData = lines.map(line => ({ ...line }));
      this.initTable = this.data.length > 0;
    });
  }

  /** 「取消」按鈕：把傳票明細還原成初始載入時的內容 */
  onResetDetail(): void {
    this.data = this.originalData.map(line => ({ ...line }));
  }

  /**
   * 「新增」按鈕：在表格最後插入一列空白明細列，比照最後一列所屬的核銷單號/傳票表頭欄位
   * (REDEEM_NO/PREP_NO/VouNo...)，讓 onConfirmPosting() 分組送出時這筆新增列能歸屬到正確的傳票；
   * 序號固定用「目前表格最大 SerNo + 10」，科目代號/摘要/借貸金額留白讓使用者自行填寫。
   */
  onAddAccountingLine(): void {
    if (!this.isFormCreateable || this.data.length === 0) return;

    const lastRow = this.data[this.data.length - 1];
    const maxSerNo = this.data.reduce((max, line) => Math.max(max, Number(line.SerNo) || 0), 0);
    const newSerNo = maxSerNo + 10;

    const newLine: Fin23050DetailLine = {
      REDEEM_NO: lastRow.REDEEM_NO,
      PREP_NO: lastRow.PREP_NO,
      VouNo: lastRow.VouNo,
      Voucher_Name: lastRow.Voucher_Name,
      VoucherType: lastRow.VoucherType,
      VouDate: lastRow.VouDate,
      Remark: lastRow.Remark,
      CRT_USR_Name: lastRow.CRT_USR_Name,
      CRT_Date: lastRow.CRT_Date,
      Detail_ID: `new-${newSerNo}`,
      SerNo: newSerNo,
      AccNo: '',
      AccCName: '',
      VenNo: lastRow.VenNo,
      NoteDesc: '',
      DebitAmt: 0,
      CreditAmt: 0,
      Org_ID: '',
      Org_Name: '',
      ProjectNo: lastRow.ProjectNo,
      ACCT_KEY: '',
      _dataStatus: 'new',
    };

    this.data = [...this.data, newLine];
  }

  /** 刪除鈕(只有新增列會顯示)：依物件參照從表格移除該列，不影響其餘既有列/其他新增列 */
  onDeleteAccountingLine(rowData: Fin23050DetailLine): void {
    this.data = this.data.filter(line => line !== rowData);
  }

  /**
   * 送出拋轉前的前端檢查，依序擋下（任一項不通過就中止、不呼叫 API）：
   * 1. 每一列(含既有列與新增列) DebitAmt/CreditAmt 必須剛好一欄有值，不可同時有值或同時空白。
   * 2. 依 REDEEM_NO/PREP_NO 分組，每組各自的 DebitAmt 合計必須等於 CreditAmt 合計。
   * 3. 使用者自行新增的列(_dataStatus === 'new')必須已選擇科目代號(AccNo)。
   * 既有列(SP帶出來的資料)本來就滿足 1、2 兩項，第 3 項也只挑新增列檢查，所以既有列不受影響。
   */
  private validateBeforePosting(): boolean {
    for (const line of this.data) {
      const hasDebit = Number(line.DebitAmt) > 0;
      const hasCredit = Number(line.CreditAmt) > 0;
      if (hasDebit === hasCredit) {
        this.messageService.errorBubble(
          `序號 ${line.SerNo} 這一列的借方金額與貸方金額必須擇一填寫，不可同時有值或同時空白`,
          '借貸金額驗證失敗'
        );
        return false;
      }
    }

    const groupedForBalance = new Map<string, Fin23050DetailLine[]>();
    this.data.forEach(line => {
      const key = `${line.REDEEM_NO}|${line.PREP_NO}`;
      const arr = groupedForBalance.get(key) ?? [];
      arr.push(line);
      groupedForBalance.set(key, arr);
    });
    for (const [key, lines] of groupedForBalance) {
      const redeemNo = key.split('|')[0];
      const debitTotal = lines.reduce((sum, line) => sum + (Number(line.DebitAmt) || 0), 0);
      const creditTotal = lines.reduce((sum, line) => sum + (Number(line.CreditAmt) || 0), 0);
      if (debitTotal !== creditTotal) {
        this.messageService.errorBubble(
          `核銷單號 ${redeemNo} 借方金額合計(${debitTotal})與貸方金額合計(${creditTotal})不平衡，請檢查明細`,
          '借貸不平衡'
        );
        return false;
      }
    }

    for (const line of this.data) {
      if (line._dataStatus === 'new' && !line.AccNo) {
        this.messageService.errorBubble(
          `序號 ${line.SerNo} 這一列是新增列，請選擇科目代號`,
          '科目代號未選擇'
        );
        return false;
      }
    }

    return true;
  }

  /**
   * 確定拋轉：把攤平表格依每列自帶的 REDEEM_NO/PREP_NO 分組還原成「每筆核銷單號各自一組明細」，
   * 對每一組各自呼叫一次 postFIN23050(對應 SP_FIN23050Posting)，一筆核銷單號＝一張既有傳票。
   */
  onConfirmPosting() {
    if (!this.isFormCreateable || this.data.length === 0) return;
    if (!this.validateBeforePosting()) return;

    const grouped = new Map<string, DetailFIN23050Response[]>();
    this.data.forEach(line => {
      const key = `${line.REDEEM_NO}|${line.PREP_NO}`;
      const arr = grouped.get(key) ?? [];
      arr.push(line);
      grouped.set(key, arr);
    });
    const entries = Array.from(grouped.entries());

    this.messageService.confirm({
      header: '拋轉確認',
      message: `是否確定拋轉這 ${entries.length} 筆核銷單號?`,
      accept: () => {
        this.loading = true;

        const requests = entries.map(([key, lines]) => {
          const [redeemNo, prepNo] = key.split('|');
          const details: PostFIN23050DetailInput[] = lines.map(line => ({
            SerNo: Number(line.SerNo),
            AccDC: Number(line.DebitAmt) > 0 ? 'D' : 'C',
            AccNo: line.AccNo,
            AccAmt: Number(line.DebitAmt) > 0 ? Number(line.DebitAmt) : Number(line.CreditAmt),
            NoteDesc: line.NoteDesc,
          }));
          return this.fin23050Service.postFIN23050({ REDEEM_NO: redeemNo, PREP_NO: prepNo, postFIN23050Details: details });
        });

        forkJoin(requests).pipe(
          this.withLoading(),
          takeUntilDestroyed(this.destroyRef),
        ).subscribe(results => {
          const failMessages: string[] = [];
          const successMessages: string[] = [];

          results.forEach((res, idx) => {
            const redeemNo = entries[idx][0].split('|')[0];
            // 後端目前固定回傳「拋轉成功，傳票號碼：XXXXXX」/「拋轉失敗」字串(見 FIN23050Controller.postFIN23050)，只能用字面比對判斷
            const isSuccess = !!res.Data && res.Data.includes('成功');
            if (isSuccess) {
              successMessages.push(`核銷單號：${redeemNo} ${res.Data}`);
            } else {
              failMessages.push(`${redeemNo}：${res.Data || res.Message || '拋轉失敗'}`);
            }
          });

          const summary = failMessages.length
            ? `成功 ${successMessages.length} 筆，失敗 ${failMessages.length} 筆：<br>${[...successMessages, ...failMessages].join('<br>')}`
            : successMessages.join('<br>');

          setTimeout(() => {
            this.messageService.confirm({
              header: failMessages.length ? '拋轉完成(部分失敗)' : '拋轉成功',
              message: summary,
              icon: failMessages.length ? 'pi pi-exclamation-triangle' : 'pi pi-check-circle',
              acceptLabel: '確定',
              showRejectButton: false,
              accept: () => this.onCancel(),
            });
          }, 0);
        });
      }
    });
  }
}
