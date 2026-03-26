import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';

import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';

import { FIN73030Service } from '../../../service/api/fin/fin73030.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '../../../shared/componentkit/table-report/table-report.model';

import { FIN73030Data, FIN73030Option, FIN73030Query } from './fin73030.model';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';

@Component({
  selector: 'app-fin73030',
  templateUrl: './fin73030.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MenubarComponent,
    ButtonComponent,
    // CalendarComponent,
    DropdownComponent,
    TableReportComponent,
    CalendarRangeComponent
  ],
})
export class FIN73030Component extends BasicQueryPageComponent<FIN73030Data> implements OnInit {
  public readonly queryForm = this.formBuilder.group({
    paymentRequestNo: [null as string | null],
    createDateStart: [null as Date | string | null],
    createDateEnd: [null as Date | string | null],
    status: [null as string | null],
    printSignOff: [false as boolean | null],
    pageSize: [30, [Validators.required]],
    pageIndex: [1, [Validators.required]],
    SortBy: [[
      { field: 'paymentRequestNo', order: 1 },
      { field: 'createDate', order: -1 },
      { field: 'contentName', order: 1 },
    ]],
  });

  paymentRequestNoOptions: FIN73030Option[] = [];
  statusOptions: FIN73030Option[] = [];

  data: FIN73030Data[] = [];
  totalRecords = 0;
  lastQueryBody: FIN73030Query | null = null;

  columns: ReportColumn[] = [
    { field: 'contentName', header: '名稱/摘要/內容' },
    { field: 'unit', header: '單位' },
    { field: 'quantity', header: '數量' },
    { field: 'unitPrice', header: '單價' },
    { field: 'totalPrice', header: '總價' },
  ];

  constructor(public readonly service: FIN73030Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN73030', '', this.queryForm, this.onSubmit.bind(this));
    this.loadOptions();
  }

  private loadOptions(): void {
    this.service.getPaymentRequestNoOptions().subscribe(res => this.paymentRequestNoOptions = res);
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

  moneyFormat(value: number | null | undefined): string {
    return value != null ? value.toLocaleString('en-US') : '';
  }

  public onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const raw = frm.getRawValue();

      const body: FIN73030Query = {
        paymentRequestNo: raw.paymentRequestNo || null,
        createDateStart: this.formatDate(raw.createDateStart),
        createDateEnd: this.formatDate(raw.createDateEnd),
        status: raw.status || null,
        printSignOff: raw.printSignOff ?? false,
        pageSize: raw.pageSize ?? 30,
        pageIndex: raw.pageIndex ?? 1,
        SortBy: raw.SortBy,
      };

      this.service.queryFIN73030(body)
        .pipe(finalize(() => this.loading = false))
        .subscribe(res => {
          this.data = (res.Data ?? []).map(item => ({
            ...item,
            dataKey: item.dataKey ?? `${item.paymentRequestNo}-${item.contentName}-${item.totalPrice}`,
          }));
          this.totalRecords = res.TotalCount ?? 0;
          this.lastQueryBody = body;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}