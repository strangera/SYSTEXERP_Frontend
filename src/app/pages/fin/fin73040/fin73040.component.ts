import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import { AccordionModule } from 'primeng/accordion';

import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { FIN73040Service } from '../../../service/api/fin/fin73040.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

import { FIN73040Data, FIN73040Option, FIN73040Query } from './fin73040.model';

@Component({
  selector: 'app-fin73040',
  templateUrl: './fin73040.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TableReportComponent,
  ],
})
export class FIN73040Component extends BasicQueryPageComponent<FIN73040Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    paymentRequestNo: [null as string | null],
    custodianNo: [null as string | null],
    custodianDeptNo: [null as string | null],

    applyDateStart: [null as Date | string | null],
    applyDateEnd: [null as Date | string | null],

    paymentDateStart: [null as Date | string | null],
    paymentDateEnd: [null as Date | string | null],

    replenishDateStart: [null as Date | string | null],
    replenishDateEnd: [null as Date | string | null],

    pageSize: [30, [Validators.required]],
    pageIndex: [1, [Validators.required]],
    SortBy: [[
      { field: 'custodianDept', order: 1 },
      { field: 'custodian', order: 1 },
      { field: 'applyDate', order: 1 },
      { field: 'paymentRequestNo', order: 1 },
    ]],
  });

  paymentRequestNoOptions: FIN73040Option[] = [];
  custodianOptions: FIN73040Option[] = [];
  custodianDeptOptions: any[] = [];

  data: FIN73040Data[] = [];
  totalRecords = 0;
  lastQueryBody: FIN73040Query | null = null;

  columns: ReportColumn[] = [
    { field: 'custodianDept', header: '保管人組織' },
    { field: 'custodian', header: '零用金保管人' },
    { field: 'applyDate', header: '申請日期' },
    { field: 'paymentRequestNo', header: '支出請款單號' },
    { field: 'paymentDate', header: '請款日期' },
    { field: 'replenishDate', header: '撥補日期' },
    { field: 'replenishAmount', header: '撥補金額' },
    { field: 'unpaidAmount', header: '應付未付金額' },
  ];

  constructor(
    public readonly service: FIN73040Service,
    private tls11010Service: Tls11010Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73040', '', this.queryForm, this.onSubmit.bind(this));
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
    this.service.getCustodianOptions().subscribe(res => this.custodianOptions = res);
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

  moneyFormat(value: number | null | undefined): string {
    return value != null ? value.toLocaleString('en-US') : '';
  }

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      const body: FIN73040Query = {
        paymentRequestNo: raw.paymentRequestNo || null,
        custodianNo: raw.custodianNo || null,
        custodianDeptNo: raw.custodianDeptNo || null,

        applyDateStart: this.formatDate(raw.applyDateStart),
        applyDateEnd: this.formatDate(raw.applyDateEnd),

        paymentDateStart: this.formatDate(raw.paymentDateStart),
        paymentDateEnd: this.formatDate(raw.paymentDateEnd),

        replenishDateStart: this.formatDate(raw.replenishDateStart),
        replenishDateEnd: this.formatDate(raw.replenishDateEnd),

        pageSize: raw.pageSize ?? 30,
        pageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      };

      this.service.queryFIN73040(body)
        .pipe(finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = (res.Data ?? []).map(item => ({
            ...item,
            dataKey: item.dataKey ?? `${item.paymentRequestNo}-${item.replenishAmount}`,
          }));
          this.totalRecords = res.TotalCount ?? 0;
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}