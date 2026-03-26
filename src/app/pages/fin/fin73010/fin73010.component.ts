import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';

import { AccordionModule } from 'primeng/accordion';

import { FIN73010Data, FIN73010Option, FIN73010Query } from './fin73010.model';
import { FIN73010Service } from '../../../service/api/fin/fin73010.service';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { Tls11010Service } from '@service/api/tls/tls11010.service';

@Component({
  selector: 'app-fin73010',
  templateUrl: './fin73010.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    // CalendarComponent,
    TableReportComponent,
    CalendarRangeComponent
  ],
})
export class FIN73010Component extends BasicQueryPageComponent<FIN73010Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    pettyCashNo: [null as string | null],
    applyDateStart: [null as Date | string | null],
    applyDateEnd: [null as Date | string | null],
    applicantNo: [null as string | null],
    custodianNo: [null as string | null],
    status: [null as string | null],
    custodianDeptNo: [null as string | null],
    pageSize: [30, [Validators.required]],
    pageIndex: [1, [Validators.required]],
    SortBy: [[
      { field: 'pettyCashNo', order: 1 },
      { field: 'applyDate', order: -1 },
      { field: 'invoiceReceiptNo', order: 1 },
    ]],
  });

  pettyCashNoOptions: FIN73010Option[] = [];
  applicantOptions: FIN73010Option[] = [];
  custodianOptions: FIN73010Option[] = [];
  statusOptions: FIN73010Option[] = [];
  // custodianDeptOptions: FIN73010Option[] = [];
custodianDeptOptions: any[] = [];
  data: FIN73010Data[] = [];
  totalRecords = 0;
  lastQueryBody: FIN73010Query | null = null;

  columns: ReportColumn[] = [
    { field: 'pettyCashNo', header: '零用金單號' },
    { field: 'applyDate', header: '申請日期' },
    { field: 'applicantNo', header: '零用金申請人' },
    { field: 'applicantDept', header: '申請人組織' },
    { field: 'custodianNo', header: '零用金保管人' },
    { field: 'custodianDept', header: '保管單位' },
    { field: 'status', header: '狀態' },
    { field: 'expenseAccountNo', header: '費用會計科目' },
    { field: 'expenseDeptNo', header: '費用科目組織' },
    { field: 'subjectSummary', header: '項目摘要' },
    { field: 'detailCategory', header: '明細類別' },
    { field: 'invoiceReceiptNo', header: '發票/收據號碼' },
    { field: 'expenseDate', header: '日期' },
    { field: 'amountUntaxed', header: '未稅金額' },
    { field: 'tax', header: '稅額' },
    { field: 'total', header: '總額' },
  ];

  constructor(public readonly service: FIN73010Service  ,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73010', '', this.queryForm, this.onSubmit.bind(this));
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
    this.service.getPettyCashNoOptions().subscribe(res => this.pettyCashNoOptions = res);
    this.service.getApplicantOptions().subscribe(res => this.applicantOptions = res);
    this.service.getCustodianOptions().subscribe(res => this.custodianOptions = res);
    this.service.getStatusOptions().subscribe(res => this.statusOptions = res);
    this.service.getCustodianDeptOptions().subscribe(res => this.custodianDeptOptions = res);
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

      const body: FIN73010Query = {
        pettyCashNo: raw.pettyCashNo || null,
        applyDateStart: this.formatDate(raw.applyDateStart),
        applyDateEnd: this.formatDate(raw.applyDateEnd),
        applicantNo: raw.applicantNo || null,
        custodianNo: raw.custodianNo || null,
        status: raw.status || null,
        custodianDeptNo: raw.custodianDeptNo || null,
        pageSize: raw.pageSize ?? 30,
        pageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      };

      this.service.queryFIN73010(body)
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