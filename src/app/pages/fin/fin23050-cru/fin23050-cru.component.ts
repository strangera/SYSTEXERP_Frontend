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
 * 1.2.3.5 暫付款核銷傳票拋轉作業 - 拋轉預覽頁
 *
 * 查詢頁勾選多筆核銷單號後按「預覽傳票」導進這頁，這頁把整批勾選的核銷單號一次送進
 * SP_FIN23050Detail(@ItemList TVP)，SP 內部會把所有項目的明細合併＋統一重新編序號(10,20,30...)，
 * 回傳一張扁平表(每列自帶 REDEEM_NO/PREP_NO/VouNo 等表頭欄位)，前端直接當成表格資料用。
 * 最後按「確定拋轉」時再依每列自帶的 REDEEM_NO/PREP_NO 分組，對每一組各自呼叫一次
 * SP_FIN23050Posting —— 比照 FIN23020-cru 的 forkJoin 做法。
 *
 * 注意：SP 回傳的明細列會多一筆虛擬列(Detail_ID=999999999，AccNo=123304)，那是 SP 算出來給畫面看的
 * 「暫付款核銷轉列」沖銷分錄，GLS6002 沒有對應的實體列——SP_FIN23050Posting 目前還是舊版(只 UPDATE
 * 既有列，靠 SerNo 比對，且序號規則跟新版 Detail 不同步)，這筆虛擬列送出去 Posting 也不會真的被寫入，
 * 這是已知的後端落差，還沒有解法，先如實顯示，不要自己在前端硬吃掉這筆虛擬列。
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

  data: DetailFIN23050Response[] = [];
  initTable = false;
  /** 傳票明細初始載入後的原始快照，供「取消」按鈕還原編輯內容用 */
  private originalData: DetailFIN23050Response[] = [];
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
    { field: 'DebitAmt', header: '借方金額', width: '110px', format: formatAmount, textAlign: 'right', aggregate: 'sum', disabled: () => true },
    { field: 'CreditAmt', header: '貸方金額', width: '110px', format: formatAmount, textAlign: 'right', aggregate: 'sum', disabled: () => true },
    {
      field: 'Org_ID', header: '組織代號', width: '110px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.orgOptions$, optionLabel: 'value', optionValue: 'value',
      templateLabel: 'label', showClear: false,
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
    { field: 'ProjectNo', header: '活動代號', width: '110px', textAlign: 'left', disabled: () => true },
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
   * 確定拋轉：把攤平表格依每列自帶的 REDEEM_NO/PREP_NO 分組還原成「每筆核銷單號各自一組明細」，
   * 對每一組各自呼叫一次 postFIN23050(對應 SP_FIN23050Posting)，一筆核銷單號＝一張既有傳票。
   */
  onConfirmPosting() {
    if (!this.isFormCreateable || this.data.length === 0) return;

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
          let successCount = 0;

          results.forEach((res, idx) => {
            const redeemNo = entries[idx][0].split('|')[0];
            // 後端目前固定回傳「拋轉成功」/「拋轉失敗」字串(見 FIN23050Controller.postFIN23050)，只能用字面比對判斷
            const isSuccess = !!res.Data && res.Data.includes('成功');
            if (isSuccess) {
              successCount++;
            } else {
              failMessages.push(`${redeemNo}：${res.Data || res.Message || '拋轉失敗'}`);
            }
          });

          const summary = failMessages.length
            ? `成功 ${successCount} 筆，失敗 ${failMessages.length} 筆：<br>${failMessages.join('<br>')}`
            : `成功 ${successCount} 筆`;

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
