import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Fin23050Service, QueryFIN23050Response } from '@service/api/fin/fin23050.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { toLocalDateTimeString } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';

//1.2.3.5 暫付款核銷傳票拋轉作業
@Component({
  selector: 'app-fin23050',
  templateUrl: './fin23050.component.html',
  standalone: true,
  imports: [
    MenubarComponent, AccordionModule, ButtonModule, FormsModule, ReactiveFormsModule,
    DropdownRangeComponent, ButtonComponent, TableReportComponent, TranslateModule, CalendarComponent
  ]
})
export class FIN23050Component extends BasicQueryPageComponent<QueryFIN23050Response> implements OnInit {
  public readonly fin23050Service = inject(Fin23050Service);

  // 核銷單號起訖：確認 SP_FIN23050Get 的用途就是「查詢頁條件下拉」，用下拉選單比照原設計，不是自由輸入文字。
  queryForm = this.formBuilder.group({
    REDEEM_NO_S: [null as string | null],
    REDEEM_NO_E: [null as string | null],
  });
  voucherDateControl = this.formBuilder.control(new Date());

  data: QueryFIN23050Response[] = [];
  selectedItems: QueryFIN23050Response[] = [];
  totalRecords = 0;
  lastQuery: unknown = null;
  footerData: any = null;

  /**
   * 核銷單號下拉選項(起/迄共用同一份清單)，來源就是 SP_FIN23050Get 本身。
   */
  redeemNoOptions: { label: string; value: string }[] | null = null;

  // 查詢結果欄位對應 SP_FIN23050Query 的回傳欄位，跟舊系統查詢頁截圖一致。
  columns: ReportColumn[] = [
    { field: 'REDEEM_NO', header: '核銷單號', align: 'left' },
    { field: 'PREP_NO', header: '預支單號', align: 'left' },
    { field: 'VEN_No', header: '廠商代號', align: 'left' },
    { field: 'APPY_Date', header: '申請日期', format: formatDate, align: 'left', width: '100px' },
    { field: 'CLOSE_Date', header: '預計核銷日', format: formatDate, align: 'left', width: '100px' },
    { field: 'PAY_Date', header: '預計付款日', format: formatDate, align: 'left', width: '100px' },
    { field: 'PREP_Amt', header: '預支金額', format: formatAmount, align: 'right' },
    // { field: 'RedeemedAmt', header: '已核銷金額', format: formatAmount, align: 'right' },
    { field: 'BalanceAmt', header: '核銷金額', format: formatAmount, align: 'right' },
    { field: 'NoteDesc', header: '備註', align: 'left' },
  ];

  ngOnInit(): void {
    this.initializePage('FIN23050', 'fin/fin23050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadRedeemNoOptions();
  }

  private loadRedeemNoOptions() {
    this.fin23050Service.getFIN23050({}).pipe(untilDestroyed(this)).subscribe(res => {
      const list = res.Data ?? [];
      const seen = new Set<string>();
      this.redeemNoOptions = list
        .filter(item => item.REDEEM_NO && !seen.has(item.REDEEM_NO) && seen.add(item.REDEEM_NO))
        .map(item => ({ label: item.REDEEM_NO, value: item.REDEEM_NO }));
    });
  }

  /**
   * 查詢：先用 SP_FIN23050Get(範圍下拉條件) 找出區間內的核銷單號/預支單號配對，
   * 再逐筆呼叫 SP_FIN23050Query 撈出畫面要顯示的完整欄位(廠商代號/日期/金額/備註)，比照 FIN23020-cru 的 forkJoin 寫法。
   * 注意：SP_FIN23050Query 每次呼叫自己 ROW_NUMBER() 從 1 開始，合併多筆結果後在前端重新編號 ID，避免 dataKey 撞號。
   */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin23050Service.getFIN23050(frm.value).pipe(
        switchMap(getRes => {
          const pairs = getRes.Data ?? [];
          if (pairs.length === 0) return of([] as QueryFIN23050Response[]);
          return forkJoin(
            pairs.map(p => this.fin23050Service.queryFIN23050({ PREP_NO: p.PREP_NO, REDEEM_NO: p.REDEEM_NO }))
          ).pipe(map(resList => resList.flatMap(r => r.Data ?? [])));
        }),
        finalize(() => this.loading = false),
        untilDestroyed(this),
      ).subscribe(rows => {
        this.data = rows.map((row, idx) => ({ ...row, ID: idx + 1 }));
        this.totalRecords = this.data.length;
        this.lastQuery = frm.value;
        this.footerData = {
          PREP_Amt: this.data.reduce((sum, row) => sum + (Number(row.PREP_Amt) || 0), 0),
          RedeemedAmt: this.data.reduce((sum, row) => sum + (Number(row.RedeemedAmt) || 0), 0),
          BalanceAmt: this.data.reduce((sum, row) => sum + (Number(row.BalanceAmt) || 0), 0),
        };
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }

  get isPreviewDisabled(): boolean {
    return this.selectedItems.length === 0 || !this.voucherDateControl.value;
  }

  /**
   * 預覽傳票：把勾選的多筆核銷單號(rowData)+ 傳票日期整包帶進 fin23050cru 頁面，比照 FIN23020 的做法，
   * 由該頁逐筆呼叫 SP_FIN23050Detail 組出預覽資料，這裡只負責導頁。
   */
  onPreview() {
    if (this.isPreviewDisabled) return;
    this.navigateWithState(CRUDStatus.Create, {
      items: [...this.selectedItems],
      VouDate: toLocalDateTimeString(this.voucherDateControl.value),
    });
  }
}
