/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { getSYS1000Options } from '@service/system/sys1000.service';

import {
  ApiResponse,
  OptionItem,
  QueryTLS25030Request,
  QueryTLS25030Row,
  TLS25030Service,
} from '../../../service/api/tls/tls25030.service';

import { CounterNameService } from '@service/basic/queryTLTTALENT.service';
import { FloorService } from '@service/basic/querySYS3900.service';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { DeductionService } from '@service/basic/queryAPS1003.service';

type SortItem = { field: string; order: number };

@UntilDestroy()
@Component({
  selector: 'app-tls25030',
  templateUrl: './tls25030.component.html',
  styleUrls: ['./tls25030.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,

    MenubarComponent,
    AccordionModule,
    ButtonModule,
    ButtonComponent,

    CalendarRangeComponent,
    InputTextComponent,
    DropdownComponent,
    MultiSelectComponent,
    InputTextRangeComponent,

    TableReportComponent,
  ],
})
export class TLS25030Component extends BasicQueryPageComponent<any> {
  data: QueryTLS25030Row[] = [];
  totalRecords = 0;
  viewTotalRecords = 0;
  selectedItems: QueryTLS25030Row[] = [];
  lastQueryBody: any = null;
  footerData: any = undefined;
  tableVer = 0;

  btnLoading = false;

  readonly defaultSort: SortItem[] = [{ field: 'UPD_Date', order: -1 }];

  columns: ReportColumn[] = [
    { field: 'fine_no', header: '單據編號' },
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '專櫃名稱' },
    { field: 'fine_date', header: '違規日期', format: (v: string) => this.formatDate(v) },
    { field: 'deduct_date', header: '扣款日期', format: (v: string) => this.formatDate(v) },
    { field: 'Violation_type_Name', header: '違規類別' },
    { field: 'CAP_Name', header: '扣款項目' },
    { field: 'fine_amount', header: '金額' },
    { field: 'Org_Name', header: '開立單位' },
    { field: 'CRT_USR_Name', header: '建立者' },
    { field: 'UPD_Date', header: '維護日', format: (v: string) => this.formatDate(v) },
    { field: 'payment_status_Name', header: '狀態' },
    { field: 'violation_otherdesc', header: '備註' },
  ];

  /** ✅ 下拉 options（以 TLS25030Component 為主、統一管理） */
  // 違規類別：SYS1000
  violationTypeOptions: OptionItem[] = getSYS1000Options('Violation_type') as any;

  // 扣款項目：APS1003
  capItemOptions: OptionItem[] = [];

  // 樓層：SYS3900
  floorOptions: OptionItem[] = [];

  // 繳款方式：寫死 (1=扣款,2=現金,9=其他)
  payTypeOptions: OptionItem[] = [
    { value: '1', label: '1-扣款' },
    { value: '2', label: '2-現金' },
    { value: '9', label: '9-其他' },
  ];

  // 開立單位：SYS3100（Observable options）
  orgOptions = this.dropdown.querySys3100();

  // 建立者：Counter
  CounterOptions: OptionItem[] = [];

  queryForm = this.formBuilder.group({
    tlt_no: ['' as string],
    tlt_name: ['' as string],
    fine_no: ['' as string],

    // 日期區間（Date）
    fine_date_s: [null as Date | null],
    fine_date_e: [null as Date | null],
    deduct_date_s: [null as Date | null],
    deduct_date_e: [null as Date | null],

    // 金額
    amount_s: [null as number | null],
    amount_e: [null as number | null],

    // 下拉/多選
    violation_type: ['' as string],
    cap_item: ['' as string],
    org_id: ['' as string],
    fine_status: ['' as string],
    pay_type: ['' as string], // ✅ 查詢條件要用繳款方式就保留

    floors: [[] as string[]], // 多選 => join CSV

    crt_usr_no: ['' as string],

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private tls25030Service: TLS25030Service,
    private cdr: ChangeDetectorRef,
    private counterNameService: CounterNameService,
    private readonly dropdown: DropdownApiService,
    private deductionService: DeductionService,
    private floorService: FloorService
  ) {
    super();
  }

  private formatDate(val: string): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return val;
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  private toIso(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    return dt.toISOString();
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private cleanStr(v: any): string | undefined {
    const s = String(v ?? '').trim();
    return s ? s : undefined;
  }

  private cleanNum(v: any): number | undefined {
    if (v === '' || v == null) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private cleanArrayToCsv(arr: any): string | undefined {
    const a = Array.isArray(arr) ? arr : [];
    const cleaned = a.map((x) => String(x ?? '').trim()).filter((x) => !!x);
    return cleaned.length ? cleaned.join(',') : undefined;
  }

  private buildQueryPayload(base: any): QueryTLS25030Request {
    const pageIndex = Number.isFinite(base?.pageIndex) && base.pageIndex >= 1 ? base.pageIndex : 1;
    const pageSize = Number.isFinite(base?.pageSize) && base.pageSize > 0 ? base.pageSize : 30;
    const sort = this.normalizeSort(base?.SortBy, this.defaultSort);

    const payload: QueryTLS25030Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      tlt_no: this.cleanStr(base?.tlt_no),
      tlt_name: this.cleanStr(base?.tlt_name),
      fine_no: this.cleanStr(base?.fine_no),

      violation_type: this.cleanStr(base?.violation_type),
      cap_item: this.cleanStr(base?.cap_item),
      org_id: this.cleanStr(base?.org_id),
      fine_status: this.cleanStr(base?.fine_status),
      pay_type: this.cleanStr(base?.pay_type),
      crt_usr_no: this.cleanStr(base?.crt_usr_no),

      amount_s: this.cleanNum(base?.amount_s),
      amount_e: this.cleanNum(base?.amount_e),

      fine_date_s: this.toIso(base?.fine_date_s),
      fine_date_e: this.toIso(base?.fine_date_e),
      deduct_date_s: this.toIso(base?.deduct_date_s),
      deduct_date_e: this.toIso(base?.deduct_date_e),

      floors: this.cleanArrayToCsv(base?.floors),
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  /** ✅ 給 table-report 用 */
  public queryTLS25030ForReport = (body: any) =>
    this.tls25030Service.queryTLS25030(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<QueryTLS25030Row[] | QueryTLS25030Row>) => {
        const src = (res as any)?.Data;
        const rows: QueryTLS25030Row[] = Array.isArray(src) ? src : src ? [src] : [];
        const totalCount = Number((res as any)?.TotalCount ?? rows.length) || rows.length;
        rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));
        return { Data: rows, TotalCount: totalCount, GrandTotal: null };
      })
    );

  ngOnInit(): void {
    this.initializePage('TLS25030', '/tls/tls25030cru', this.queryForm, (form) => this.onSubmit(form));

    // ✅ 這裡會「一定關掉 loading」，避免你現在卡住的問題
    this.loading = true;

    const floors$ = this.floorService.getFloors().pipe(
      take(1),
      catchError((err) => {
        console.error('getFloors error:', err);
        return of([] as OptionItem[]);
      })
    );

    const counters$ = this.counterNameService.getCounters().pipe(
      take(1),
      catchError((err) => {
        console.error('getCounters error:', err);
        return of([] as any[]);
      })
    );

    const capItems$ = this.deductionService.getAPS1003DropDownList({ cap_typeList: ['Z'] }).pipe(
      take(1),
      catchError((err) => {
        console.error('APS1003 dropdown load error:', err);
        return of([] as any[]);
      })
    );

    forkJoin([floors$, counters$, capItems$])
      .pipe(
        finalize(() => {
          this.loading = false; // ✅ 一定會關掉
          this.cdr.detectChanges();
        }),
        untilDestroyed(this)
      )
      .subscribe(([floors, counters, capList]) => {
        this.floorOptions = floors || [];

        this.CounterOptions = (counters || []).map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        }));

        this.capItemOptions = (capList || []).map((x: any) => ({
          value: String(x.value),
          label: `${x.value} - ${x.label}`,
        }));
      });
  }

  onSubmit(_frm: any) {
    this.submitted = true;

    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload(raw);
    payload.PageIndex = 1;

    this.btnLoading = true; // ✅ 如果你按鈕有綁 btnLoading
    this.loading = true;    // ✅ table-report/loading

    this.data = [];
    this.selectedItems = [];
    this.footerData = undefined;
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.tableVer++;

    this.tls25030Service
      .queryTLS25030(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.btnLoading = false;
          this.cdr.detectChanges();
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: (response: ApiResponse<QueryTLS25030Row[]>) => {
          const rows: QueryTLS25030Row[] = Array.isArray(response?.Data) ? response.Data : [];
          rows.forEach((r, idx) => ((r as any)._rowKey = idx + 1));

          this.data = rows;
          const realTotal = Number((response as any)?.TotalCount ?? rows.length) || rows.length;

          setTimeout(() => {
            this.totalRecords = realTotal;
            this.viewTotalRecords = realTotal;
            this.lastQueryBody = { ...payload };
          });

          this.queryStateService.setQueryState(this.ProgNo, this.queryForm.value);
        },
        error: (err: any) => {
          console.error('TLS25030 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.viewTotalRecords = 0;
          this.footerData = undefined;
        },
      });
  }

  onClear(frm: any) {
    frm.reset({
      tlt_no: '',
      tlt_name: '',
      fine_no: '',

      fine_date_s: null,
      fine_date_e: null,
      deduct_date_s: null,
      deduct_date_e: null,

      amount_s: null,
      amount_e: null,

      violation_type: '',
      cap_item: '',
      org_id: '',
      fine_status: '',
      pay_type: '',
      floors: [],
      crt_usr_no: '',

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.viewTotalRecords = 0;
    this.footerData = undefined;
  }
}
