import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN23050Detail, Fin23050Service, PostFIN23050DetailInput, QueryFIN23050Response } from '@service/api/fin/fin23050.service';
import { BasicCruPageComponent } from '@shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableEditComponent } from '@shared/components/table-edit/table-edit.component';
import { EditColumn } from '@shared/components/table-edit/table-edit.model';
import { formatAmount } from '@shared/components/table-report/table-report.model';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { finalize, firstValueFrom, forkJoin } from 'rxjs';
import { DropdownApiService } from 'src/app/service/utility/dropdown-api.service';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

/** 查詢頁勾選多筆核銷單號後帶進本頁的最小資料 */
interface Fin23050CruState {
  items: QueryFIN23050Response[];
  /** 查詢頁選的傳票日期，目前 SP_FIN23050Posting 沒有 @VouDate 參數可以接，先保留欄位、尚未真的送進後端 */
  VouDate?: string | null;
}

/** 攤平後的傳票明細列，額外帶原始來源核銷單號/預支單號，方便按來源重組拋轉請求 */
interface PostingLine extends FIN23050Detail {
  _sourceRedeemNo: string;
  _sourcePrepNo: string;
}

/**
 * 1.2.3.5 暫付款核銷傳票拋轉作業 - 拋轉預覽頁
 *
 * 查詢頁勾選多筆核銷單號後按「預覽傳票」導進這頁，這頁對每一筆勾選的核銷單號各自呼叫一次
 * SP_FIN23050Detail 取得預覽(傳票主檔+明細)，攤平成一張表讓使用者編輯摘要，最後按「確定拋轉」
 * 才會對每一筆各自呼叫一次 SP_FIN23050Posting —— 比照 FIN23020-cru 的 forkJoin 做法。
 *
 * 注意(跟 FIN23020 不同的地方，先老實記下來)：FIN23020 是把多筆暫付款「合併成一張全新傳票」，
 * 所以取第一筆表頭當樣板合理。但 FIN23050 每一筆核銷單號在 FIN23040 核銷當下就已經各自產生了
 * 獨立的既有傳票(各自的 VouNo/VouDate)，理論上不是同一張——這裡先比照 FIN23020 的寫法只用第一筆
 * 表頭填頭部欄位，只是「畫面呈現」的簡化，明細分組送出時還是按各自來源正確對應各自的核銷單號。
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

  data: PostingLine[] = [];
  initTable = false;
  /** 傳票明細初始載入後的原始快照，供「取消」按鈕還原編輯內容用 */
  private originalData: PostingLine[] = [];
  private readonly orgOptions$ = this.dropdown.querySys3100();

  columns: EditColumn[] = [
    { field: 'SerNo', header: '序號', width: '60px', textAlign: 'center', disabled: () => true },
    { field: 'AccNo', header: '科目代號', width: '110px', textAlign: 'left', disabled: () => true },
    { field: 'AccCName', header: '科目名稱', width: '160px', textAlign: 'left', disabled: () => true },
    { field: 'VenNo', header: '廠商代號', width: '110px', textAlign: 'left', disabled: () => true },
    { field: 'NoteDesc', header: '摘要', type: 'input', width: '220px', textAlign: 'left' },
    { field: 'DebitAmt', header: '借方金額', width: '110px', format: formatAmount, textAlign: 'right', aggregate: 'sum', disabled: () => true },
    { field: 'CreditAmt', header: '貸方金額', width: '110px', format: formatAmount, textAlign: 'right', aggregate: 'sum', disabled: () => true },
    {
      field: 'Org_ID', header: '組織代號', width: '110px', type: 'dropdown', textAlign: 'left',
      optionsAsync: true, options: () => this.orgOptions$, optionLabel: 'value', optionValue: 'value',
      templateLabel: 'label', showClear: false,
      calculate: async (rowData: PostingLine, value: any) => {
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
    const requests = items.map(item =>
      this.fin23050Service.detailFIN23050({ REDEEM_NO: item.REDEEM_NO, PREP_NO: item.PREP_NO })
    );
    forkJoin(requests).pipe(
      finalize(() => { this.loading = false; }),
      untilDestroyed(this),
    ).subscribe(results => {
      const firstHeader = results[0]?.Data?.FIN23050Data;
      if (firstHeader) {
        this.dataForm.patchValue({
          ...firstHeader,
          VouDate: firstHeader.VouDate ? new Date(firstHeader.VouDate) : null,
          CRT_Date: firstHeader.CRT_Date ? new Date(firstHeader.CRT_Date) : null,
        }, { emitEvent: false });

        this.dataForm.controls.VouNo.setValue('系統自動產生');
      }
      const lines: PostingLine[] = [];
      results.forEach((res, idx) => {
        const item = items[idx];
        const details = res.Data?.FIN23050DetailData ?? [];
        const validDetails = details.filter(line => line.AccCName !== '合計');

        validDetails.forEach(line => {
          lines.push({
            ...line,
            _sourceRedeemNo: item.REDEEM_NO,
            _sourcePrepNo: item.PREP_NO,
          });
        });
      });
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
   * 確定拋轉：把攤平表格依 _sourceRedeemNo/_sourcePrepNo 分組還原成「每筆核銷單號各自一組明細」，
   * 對每一組各自呼叫一次 postFIN23050(對應 SP_FIN23050Posting)，一筆核銷單號＝一張既有傳票。
   */
  onConfirmPosting() {
    if (!this.isFormCreateable || this.data.length === 0) return;

    const grouped = new Map<string, PostingLine[]>();
    this.data.forEach(line => {
      const key = `${line._sourceRedeemNo}|${line._sourcePrepNo}`;
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
          finalize(() => this.loading = false),
          untilDestroyed(this),
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
