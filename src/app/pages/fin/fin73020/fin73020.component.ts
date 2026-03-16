import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import { AccordionModule } from 'primeng/accordion';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FIN73020Service } from '../../../service/api/fin/fin73020.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

import { FIN73020Data, FIN73020Option, FIN73020Query } from './fin73020.model';

@Component({
  selector: 'app-fin73020',
  templateUrl: './fin73020.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarComponent,
    DropdownComponent,
    TableReportComponent,
  ],
})
export class FIN73020Component extends BasicQueryPageComponent<FIN73020Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    paymentRequestNo: [null as string | null],
    createDateStart: [null as Date | string | null],
    createDateEnd: [null as Date | string | null],
    applicantNo: [null as string | null],
    custodianNo: [null as string | null],
    status: [null as string | null],
    custodianDeptNo: [null as string | null],
    pageSize: [30, [Validators.required]],
    pageIndex: [1, [Validators.required]],
    SortBy: [[
      { field: 'paymentRequestNo', order: 1 },
      { field: 'createDate', order: -1 },
      { field: 'receiptNo', order: 1 },
    ]],
  });

  paymentRequestNoOptions: FIN73020Option[] = [];
  applicantOptions: FIN73020Option[] = [];
  custodianOptions: FIN73020Option[] = [];
  statusOptions: FIN73020Option[] = [];
  custodianDeptOptions: any[] = [];

  data: FIN73020Data[] = [];
  totalRecords = 0;
  lastQueryBody: FIN73020Query | null = null;

  columns: ReportColumn[] = [
    { field: 'paymentRequestNo', header: '支出請款單號' },
    { field: 'createDate', header: '產生日期' },
    { field: 'status', header: '狀態' },
    { field: 'pettyCashNo', header: '零用金單號' },
    { field: 'applyDate', header: '申請日期' },
    { field: 'applicant', header: '申請人' },
    { field: 'applicantDept', header: '申請人組織' },
    { field: 'custodian', header: '零用金保管人' },
    { field: 'expenseAccount', header: '費用會計科目' },
    { field: 'expenseDept', header: '科目組織代號' },
    { field: 'subjectSummary', header: '項目摘要' },
    { field: 'detailCategory', header: '明細類別' },
    { field: 'receiptNo', header: '發票/收據號碼' },
    { field: 'expenseDate', header: '日期' },
    { field: 'amountUntaxed', header: '未稅金額' },
    { field: 'tax', header: '稅額' },
    { field: 'total', header: '總額' },
    { field: 'voucherNo', header: '傳票號碼' },
  ];

  constructor(
    public readonly service: FIN73020Service,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73020', '', this.queryForm, this.onSubmit.bind(this));
    this.loadOptions();

    this.tls11010Service.getOrgOptions()
      .subscribe(res => {
        this.custodianDeptOptions = (res || []).map((x: any) => ({
          label: `${x.value} - ${x.label}`,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));
      });
  }

  private loadOptions(): void {
    this.service.getPaymentRequestNoOptions().subscribe(res => this.paymentRequestNoOptions = res);
    this.service.getApplicantOptions().subscribe(res => this.applicantOptions = res);
    this.service.getCustodianOptions().subscribe(res => this.custodianOptions = res);
    this.service.getStatusOptions().subscribe(res => this.statusOptions = res);
  }

  private formatDate(value: Date | string | null): string | null {
    if (!value) return null;

    if (value instanceof Date && !isNaN(value.getTime())) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }

    const normalized = String(value).replace(/\D/g, '');
    return normalized.length >= 8 ? normalized.substring(0, 8) : null;
  }

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      const body: FIN73020Query = {
        paymentRequestNo: raw.paymentRequestNo || null,
        createDateStart: this.formatDate(raw.createDateStart),
        createDateEnd: this.formatDate(raw.createDateEnd),
        applicantNo: raw.applicantNo || null,
        custodianNo: raw.custodianNo || null,
        status: raw.status || null,
        custodianDeptNo: raw.custodianDeptNo || null,
        pageSize: raw.pageSize ?? 30,
        pageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      };

      this.service.queryFIN73020(body)
        .pipe(finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = res.Data ?? [];
          this.totalRecords = res.TotalCount ?? 0;
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}