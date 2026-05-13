/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';

import { FIN13100Service } from '../../../service/api/fin/fin13100.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { TableReportComponent } from '../../../shared/componentkit/table-report/table-report.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

@Component({
  selector: 'app-fin13100',
  standalone: true,
  templateUrl: './fin13100.component.html',
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    TableReportComponent,
  ],
})
export class FIN13100Component extends BasicQueryPageComponent<any> {
  private defaultQueryFormValue: any;
  queryForm = this.formBuilder.group({
    VouNoStart: [null],
    VouNoEnd: [null],
    VouDateStart: [null],
    VouDateEnd: [null],

    ...createPaginationConfig([{ field: 'VouNo', order: -1 }]),
  });

  data: any[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;

  queryFIN13100Fn = (body: any) => this.fin13100Service.queryFIN13100(body);

  columns: any[] = [
    { field: 'VouNo', header: '傳票編號', visible: true },
    {
      field: 'VouDate',
      header: '傳票日期',
      visible: true,
      format: (v: any) => this.formatDate(v),
    },
    {
      field: 'PostFlagName',
      header: '傳票狀態',
      visible: true,
      format: (v: any, _i?: number, row?: any) =>
        v || this.formatPostFlag(row?.PostFlag),
    },
    // {
    //   field: 'TaxTotal',
    //   header: '銷項稅額-貸方',
    //   visible: true,
    //   align: 'right',
    //   format: (v: any) => this.money(v),
    //   exportFormat: 'number:comma2',
    // },
  ];

  constructor(private fin13100Service: FIN13100Service) {
    super();
  }

  ngOnInit(): void {

    this.initializePage('FIN13100', 'FIN/FIN13100CRU');

    // 記錄第一次進頁面的預設值
    this.defaultQueryFormValue = this.queryForm.getRawValue();

    const fromCru = !!history.state?.fromCru;
    const hasQueryState = this.queryStateService.getQueryState(this.ProgNo);

    if (fromCru && hasQueryState) {
      this.handleQueryRestore(this.queryForm, this.ProgNo, (f) => this.onSubmit(f));
    }
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const raw = form.getRawValue();
    const payload: any = { ...raw };

    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    payload.VouDateStart = this.toDateString(payload.VouDateStart);
    payload.VouDateEnd = this.toDateString(payload.VouDateEnd);
    payload.pageIndex = payload.pageIndex ?? 1;
    payload.pageSize = payload.pageSize ?? 30;
    payload.SortBy = payload.SortBy ?? [{ field: 'VouNo', order: 1 }];

    this.lastQueryBody = { ...payload };

    this.loading = true;
    this.messageService.blockUi();

    this.fin13100Service.queryFIN13100(payload).subscribe({
      next: (res: any) => {
        this.data = Array.isArray(res?.Data) ? res.Data : [];
        this.totalRecords = res?.TotalCount ?? this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, raw);
      },
      error: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  onClearForm(): void {
    setTimeout(() => {
      (this.queryStateService as any).clearQueryState?.(this.ProgNo);

      this.queryForm.reset(
        {
          VouNoStart: null,
          VouNoEnd: null,
          VouDateStart: null,
          VouDateEnd: null,
          pageIndex: 1,
          pageSize: 30,
          SortBy: [{ field: 'VouNo', order: 1 }],
        },
        { emitEvent: true }
      );

      this.queryForm.markAsPristine();
      this.queryForm.markAsUntouched();
      this.submitted = false;
    });
  }
  private toDateString(v: any): string | null {
    if (!v) return null;

    const d = new Date(v);
    if (isNaN(d.getTime())) return null;

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  formatDate(v: any): string {
    const date = this.toDateString(v);
    return date ? date.replace(/-/g, '/') : '';
  }

  formatPostFlag(v: any): string {
    const value = String(v ?? '').trim();

    switch (value) {
      case '0':
        return '0-作廢';
      case '1':
        return '1-建立';
      case '2':
        return '2-確認';
      case '3':
        return '3-過帳';
      default:
        return value;
    }
  }

  money(v: any): string {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    if (isNaN(n)) return '';
    return n.toLocaleString('en-US');
  }
}