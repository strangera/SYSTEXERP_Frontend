import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Fin23050Service, GetFIN23050Response, QueryFIN23050Response } from '@service/api/fin/fin23050.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmount, formatDate, ReportColumn } from '@shared/components/table-report/table-report.model';
import { CRUDStatus } from '@shared/models/system/CRUDstatus';
import { toLocalDateTimeString } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
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
  private readonly destroyRef = inject(DestroyRef);

  queryForm = this.formBuilder.group({
    REDEEM_NO_S: [null as string | null],
    REDEEM_NO_E: [null as string | null],
  });
  voucherDateControl = this.formBuilder.control(new Date());

  data: QueryFIN23050Response[] = [];
  selectedItems: QueryFIN23050Response[] = [];
  totalRecords = 0;
  lastQuery: unknown = null;
  footerData: { PREP_Amt: number; RedeemedAmt: number; BalanceAmt: number } | null = null;

  /** 核銷單號下拉選項(起/迄共用同一份清單)，來源是 SP_FIN23050Get。 */
  redeemNoOptions: { label: string; value: string }[] | null = null;

  columns: ReportColumn[] = [
    { field: 'REDEEM_NO', header: '核銷單號', align: 'left' },
    { field: 'PREP_NO', header: '預支單號', align: 'left' },
    { field: 'VEN_No', header: '廠商代號', align: 'left' },
    { field: 'APPY_Date', header: '申請日期', format: formatDate, align: 'left', width: '100px' },
    { field: 'CLOSE_Date', header: '預計核銷日', format: formatDate, align: 'left', width: '100px' },
    { field: 'PAY_Date', header: '預計付款日', format: formatDate, align: 'left', width: '100px' },
    { field: 'PREP_Amt', header: '預支金額', format: formatAmount, align: 'right' },
    { field: 'BalanceAmt', header: '核銷金額', format: formatAmount, align: 'right' },
    { field: 'NoteDesc', header: '備註', align: 'left' },
  ];

  ngOnInit(): void {
    this.initializePage('FIN23050', 'fin/fin23050cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadRedeemNoOptions();
  }

  private loadRedeemNoOptions() {
    this.fin23050Service.getFIN23050({}).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
      const list = res.Data ?? [];
      const seen = new Set<string>();
      this.redeemNoOptions = list
        .filter((item: GetFIN23050Response) => item.REDEEM_NO && !seen.has(item.REDEEM_NO) && seen.add(item.REDEEM_NO))
        .map((item: GetFIN23050Response) => ({ label: item.REDEEM_NO, value: item.REDEEM_NO }));
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.fin23050Service.queryFIN23050(frm.value).pipe(
        this.withLoading(),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe(res => {
        const rows = res.Data ?? [];
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

  onPreview() {
    if (this.isPreviewDisabled) return;
    this.navigateWithState(CRUDStatus.Create, {
      items: [...this.selectedItems],
      VouDate: toLocalDateTimeString(this.voucherDateControl.value),
    });
  }
}
