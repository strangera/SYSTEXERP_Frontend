/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { finalize, map, of } from 'rxjs';
import { FormGroup, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';

import {
  FIN55060Service,
  FIN55060Data,
  QueryFIN55060Payload,
} from 'src/app/service/api/fin/fin55060.service';

import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';

import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig, formatAmount } from '@shared/componentkit/table/table.model';

@Component({
  selector: 'app-fin55060',
  templateUrl: './fin55060.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarRangeComponent,
    DropdownComponent,
    ButtonComponent,
    TableReportComponent,

    TranslateModule,
  ],
})
export class FIN55060Component extends BasicQueryPageComponent<FIN55060Data> implements OnInit {

  readonly today: Date = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  // === 查詢表單 ===
  queryForm = this.formBuilder.group({
    TXN_BDATE: [this.today, [Validators.required]],
    TXN_EDATE: [this.today, [Validators.required]],

    ORG_ID: [null],
    ProjectNo: [null],
    AccNo: [null],
    DetailNo: [null],

    ...createPaginationConfig([]),
    pageSize: [30],
    pageIndex: [1],
  });

  // === 資料 ===
  data: FIN55060Data[] = [];
  totalRecords = 0;
  btnLoading = false;
  lastQueryBody: QueryFIN55060Payload | null = null;

  // === 欄位 ===
  columns: Column[] = [
    { field: 'AccNo', header: '科目代號', visible: true },
    { field: 'AccCName', header: '科目名稱', visible: true },
    { field: 'DetailNo', header: '明細代號', visible: true },
    { field: 'ORG_ID', header: '部門代號', visible: true },
    { field: 'Org_Name', header: '部門名稱', visible: true },
    { field: 'ProjectNo', header: '活動代號', visible: true },
    { field: 'Debit_Amt', header: '借方金額', visible: true, format: formatAmount },
    { field: 'Credit_Amt', header: '貸方金額', visible: true, format: formatAmount },
    { field: 'OpeningBal', header: '餘額', visible: true, format: formatAmount },
  ];

  // === 下拉資料 ===
  ORG_IDOptions: any[] = [];
  ProjectNoOptions: any[] = [];
  AccNoOptions: any[] = [];
  DetailNoOptions: any[] = [];

  constructor(private fin55060Service: FIN55060Service) {
    super();
  }

  override ngOnInit(): void {
    this.initializePage('FIN55060', 'fin/fin55060cru', this.queryForm, (form) => this.onSubmit(form));
  }

  // === 工具 ===
  private toDateOnly(x: any): string | undefined {
    if (!x) return undefined;
    const d = typeof x === 'string' ? new Date(x) : (x as Date);
    if (isNaN(d.getTime())) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private ensureArr(v: any) {
    return Array.isArray(v) ? v : v == null || v === '' ? [] : [v];
  }

  private sanitizeSortBy(sortBy: any[] | undefined) {
    if (!Array.isArray(sortBy)) return [];
    return sortBy.filter(s => s && typeof s.field === 'string' && !s.field.startsWith('_'));
  }

  // === 查詢送出 ===
   onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const raw = form.getRawValue();
      const from = this.toDateOnly(raw?.TXN_BDATE);
      const to = this.toDateOnly(raw?.TXN_EDATE);

      if (!from || !to) {
        this.messageService?.warnBubble?.('請選擇日期起訖。');
        return;
      }

      const payload: QueryFIN55060Payload = {
        TXN_BDATE: from,
        TXN_EDATE: to,
        org_idList: this.ensureArr(raw?.ORG_ID),
        ProjectNoList: this.ensureArr(raw?.ProjectNo),
        AccNoList: this.ensureArr(raw?.AccNo),
        DetailNoList: this.ensureArr(raw?.DetailNo),
      };

      this.fin55060Service.queryFIN55060(payload)
        .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
        .subscribe(res => {
          const rows: any[] = [];
          const data = res?.Data ?? [];

          // 🔽 攤平後端 _Details 陣列
          if (Array.isArray(data)) {
            data.forEach(group => {
              if (Array.isArray(group._Details)) {
                group._Details.forEach((d: any) => {
                  rows.push({
                    AccNo: group.AccNo,
                    AccCName: group.AccCName,
                    ...d,
                  });
                });
              }
            });
          } else if (data && Array.isArray(data._Details)) {
            data._Details.forEach((d: any) => {
              rows.push({
                AccNo: data.AccNo,
                AccCName: data.AccCName,
                ...d,
              });
            });
          }

          this.data = rows;
          this.totalRecords = rows.length;
          this.lastQueryBody = { ...payload };
        });
    });
  }

  // === Table Report 查詢函式 ===
  public queryFIN55060ForReport = (body: any) => {
    const bdate =
      this.toDateOnly(body?.TXN_BDATE) ??
      this.lastQueryBody?.TXN_BDATE ??
      this.toDateOnly(this.queryForm.value?.TXN_BDATE);

    const edate =
      this.toDateOnly(body?.TXN_EDATE) ??
      this.lastQueryBody?.TXN_EDATE ??
      this.toDateOnly(this.queryForm.value?.TXN_EDATE);

    if (!bdate || !edate) {
      this.messageService?.warnBubble?.('請選擇日期起訖。');
      return of({ Data: [], TotalCount: 0 });
    }

    const merged = { ...(this.lastQueryBody ?? {}), ...(body ?? {}) };
    const payload: QueryFIN55060Payload = {
      TXN_BDATE: bdate,
      TXN_EDATE: edate,
      org_idList: this.ensureArr(merged?.ORG_ID),
      ProjectNoList: this.ensureArr(merged?.ProjectNo),
      AccNoList: this.ensureArr(merged?.AccNo),
      DetailNoList: this.ensureArr(merged?.DetailNo),
    };

    return this.fin55060Service.queryFIN55060(payload).pipe(
      map((res: any) => {
        const rows: any[] = [];
        const data = res?.Data ?? [];

        if (Array.isArray(data)) {
          data.forEach(group => {
            if (Array.isArray(group._Details)) {
              group._Details.forEach((d: any) => {
                rows.push({
                  AccNo: group.AccNo,
                  AccCName: group.AccCName,
                  ...d,
                });
              });
            }
          });
        }

        const total = rows.length;
        this.totalRecords = total;
        this.data = rows;
        this.lastQueryBody = { ...(this.lastQueryBody ?? {}), ...payload };

        return { Data: rows, TotalCount: total };
      })
    );
  };
}
