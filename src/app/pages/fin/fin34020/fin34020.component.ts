/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { map } from 'rxjs/operators';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';

import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

import { DropDownListService } from '@service/utility/dropDownList.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';

import {
  ApiResponse,
  Fin34020Service,
  QueryFIN34020Request,
  QueryFIN34020Row,
  SortItem,
} from '../../../service/api/fin/fin34020.service';

@UntilDestroy()
@Component({
  selector: 'app-fin34020',
  templateUrl: './fin34020.component.html',
  styleUrls: ['./fin34020.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    AccordionModule,
    ButtonModule,

    MenubarComponent,
    ButtonComponent,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextRangeComponent,
    MultiSelectComponent,
    RadiobuttonComponent,

    TableComponent,
  ],
})
export class FIN34020Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  data: QueryFIN34020Row[] = [];
  totalRecords = 0;
  lastQueryBody: any = null;

  readonly defaultSort: SortItem[] = [
    { field: 'VEN_No', order: 1 },
    { field: 'ARS_Date', order: 1 },
    { field: 'ARS_No', order: 1 },
  ];
  private _currentSortBy: SortItem[] = this.defaultSort;

  columns: Column[] = [
    { field: 'VEN_No', header: '廠客代號' },
    { field: 'VEN_Name', header: '客戶名稱' },
    { field: 'PayType', header: '收/付' },
    { field: 'ARS_No', header: '應收帳款單號' },
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'ARS_Date', header: '立帳日期', format: (v: any) => this.formatDate(v) },
    { field: 'PTA_Date', header: '預計收款日', format: (v: any) => this.formatDate(v) },
    { field: 'ARS_Amt', header: '立帳金額', format: (v: any) => this.moneyFormat(v) },
    { field: 'NoteDesc', header: '摘要' },
    { field: 'RefNo', header: '參考單號' },
    { field: 'RCV_Date', header: '收款日期', format: (v: any) => this.formatDate(v) },
    { field: 'VouNo', header: '傳票號碼' },
    { field: 'RcvOrAdjAmt', header: '收款/調整金額', format: (v: any) => this.moneyFormat(v) },
    { field: 'UnpaidBalanceAmt', header: '未沖餘額', format: (v: any) => this.moneyFormat(v) },
  ];

  /** 科目代號 options：label = AccNo - AccCName */
  accNoOptions: any[] = [];

  /** ✅ Radio options（顯示/不顯示） */
  showOptions = [
    { value: true, label: '顯示' },
    { value: false, label: '不顯示' },
  ];
  moneyTypeOptions = [
  { value: 0, label: '0' },
  { value: 11, label: '11' },
  { value: 15, label: '15' },
  { value: 30, label: '30' },
  { value: 45, label: '45' },
];

  /** ✅ 查詢表單：新增兩個 radio */
  queryForm = this.formBuilder.group({
    // 廠客代號：range
    VEN_No_From: ['' as string],
    VEN_No_To: ['' as string],

    // 日期區間
    ARS_Date_From: [null as Date | null],
    ARS_Date_To: [null as Date | null],
    RCV_Date_From: [null as Date | null],
    RCV_Date_To: [null as Date | null],
    ADJ_Date_From: [null as Date | null],
    ADJ_Date_To: [null as Date | null],

    // 科目代號(多選) -> AccNoList
    AccNoList: [[] as string[]],

    // ✅ 1) 帳款餘額為零是否顯示（真的有作用 -> ShowZeroBalance）
    ShowZeroBalance: [true as boolean],

    // ✅ 2) 應付金額是否顯示（保留但無作用）
    ShowPayAmount: [true as boolean],

    // 你原本有 ShowARSAmount / ShowZeroBalance 的話
    // 這裡保留 ShowARSAmount 仍可用（若你要用於顯示「應收金額」）
    ShowARSAmount: [true as boolean],
    MoneyTypeList: [[] as number[]], // 月結天數(多選) -> join(',')

    ...createPaginationConfig(this.defaultSort),
  });

  constructor(
    private fin34020Service: Fin34020Service,
    private dropDownListService: DropDownListService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN34020', 'fin/fin34020cru', this.queryForm, (form) => this.onSubmit(form));

    // 科目代號下拉：請改成你專案實際的 API（我用有就呼叫避免編譯失敗）
    if ((this.dropDownListService as any)?.queryGLS1005_DropDownList) {
      (this.dropDownListService as any)
        .queryGLS1005_DropDownList()
        .pipe(untilDestroyed(this))
        .subscribe((res: any) => {
          const rows = Array.isArray(res?.Data) ? res.Data : [];
          this.accNoOptions = rows
            .map((x: any) => ({
              value: String(x.AccNo ?? x.No ?? ''),
              label: `${x.AccNo ?? x.No ?? ''} - ${x.AccCName ?? x.Name ?? ''}`,
              raw: x,
            }))
            .filter((o: any) => o.value);
        });
    }

    // 還原查詢條件
    const saved = this.queryStateService.getQueryStateValue('FIN34020');
    if (saved?.formValue) {
      this.queryForm.patchValue(saved.formValue, { emitEvent: false });
      this._currentSortBy = saved.currentSortBy ?? this.defaultSort;
      this.lastQueryBody = saved.lastQueryBody ?? null;
      Promise.resolve().then(() => this.onSubmit(this.queryForm));
    }
  }

  // ===== localStorage MID / STO_No =====
  private getUserInfo(): any {
    try {
      const raw = localStorage.getItem('UserInfo');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private getMID(): number {
    const u = this.getUserInfo();
    const mid = Number(u?.mid ?? u?.MID ?? 0);
    return Number.isFinite(mid) ? mid : 0;
  }

  private getStoreNo(): string | undefined {
    const u = this.getUserInfo();
    const sto = String(u?.SYS_StoreNo ?? u?.SYS_STORENO ?? u?.StoreNo ?? '').trim();
    return sto ? sto : undefined;
  }

  // ===== helpers =====
  moneyFormat(value: any): string {
    const n = Number(value);
    if (!Number.isFinite(n)) return '0';
    return n.toLocaleString('en-US');
  }

  private formatDate(val: any): string {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  }

  private toYmd(d: Date | string | null | undefined): string | undefined {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return undefined;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private normalizeSort(input: any, fallback: SortItem[]): SortItem[] {
    const asArr = Array.isArray(input) ? input : [];
    const cleaned = asArr
      .filter((x) => x && typeof x.field === 'string' && typeof x.order === 'number')
      .map((x) => ({ field: String(x.field), order: x.order as number }));
    return cleaned.length ? cleaned : fallback;
  }

  private buildQueryPayload(raw: any): QueryFIN34020Request {
    const pageIndex = Number.isFinite(raw?.pageIndex) && raw.pageIndex >= 1 ? raw.pageIndex : 1;
    const pageSize = Number.isFinite(raw?.pageSize) && raw.pageSize > 0 ? raw.pageSize : 30;
    const sort = this.normalizeSort(raw?.SortBy, this.defaultSort);

    // ✅ ShowPayAmount：保留但不送（無作用）
    // ✅ ShowZeroBalance：真的送去後端
    const payload: QueryFIN34020Request = {
      PageIndex: pageIndex,
      PageSize: pageSize,
      SortBy: sort,

      MID: this.getMID(),
      STO_No: this.getStoreNo(),

      VEN_No_From: (raw?.VEN_No_From ?? '').trim() || undefined,
      VEN_No_To: (raw?.VEN_No_To ?? '').trim() || undefined,

      ARS_Date_From: this.toYmd(raw?.ARS_Date_From),
      ARS_Date_To: this.toYmd(raw?.ARS_Date_To),

      RCV_Date_From: this.toYmd(raw?.RCV_Date_From),
      RCV_Date_To: this.toYmd(raw?.RCV_Date_To),

      ADJ_Date_From: this.toYmd(raw?.ADJ_Date_From),
      ADJ_Date_To: this.toYmd(raw?.ADJ_Date_To),

      AccNoList: Array.isArray(raw?.AccNoList) && raw.AccNoList.length ? raw.AccNoList.join(',') : undefined,

      // ✅ 1) 帳款餘額為零是否顯示
      ShowZeroBalance: raw?.ShowZeroBalance ?? true,

      // ✅ 立帳金額是否顯示（若後端有支援）
      ShowARSAmount: raw?.ShowARSAmount ?? true,
      MoneyTypeList:
  Array.isArray(raw?.MoneyTypeList) && raw.MoneyTypeList.length
    ? raw.MoneyTypeList.join(',')
    : undefined,
    };

    Object.keys(payload).forEach((k) => {
      const v = (payload as any)[k];
      if (v === '' || v == null) delete (payload as any)[k];
    });

    return payload;
  }

  private parseQueryResponse(res: any): { rows: QueryFIN34020Row[]; total: number } {
    const rows = Array.isArray(res?.Data) ? (res.Data as QueryFIN34020Row[]) : [];
    const total = Number(res?.TotalCount ?? rows[0]?.TotalCount ?? rows.length) || rows.length;
    return { rows, total };
  }

  public queryFIN34020ForReport = (body: any) =>
    this.fin34020Service.queryFIN34020(this.buildQueryPayload(body || {})).pipe(
      map((res: ApiResponse<any>) => {
        const parsed = this.parseQueryResponse(res);
        return { Data: parsed.rows, TotalCount: parsed.total, GrandTotal: null };
      })
    );

  onSubmit(_frm: any) {
    this.submitted = true;

    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload({ ...raw, pageIndex: 1 });

    this.loading = true;
    this.data = [];
    this.totalRecords = 0;

    this.fin34020Service
      .queryFIN34020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;

          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          this.loading = false;
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('FIN34020 query API error:', err);
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private saveQueryState(): void {
    this.queryStateService.setQueryState('FIN34020', {
      formValue: this.queryForm.getRawValue(),
      currentSortBy: this._currentSortBy,
      lastQueryBody: this.lastQueryBody,
    });
  }

  onClear(frm: any) {
    frm.reset({
      VEN_No_From: '',
      VEN_No_To: '',

      ARS_Date_From: null,
      ARS_Date_To: null,
      RCV_Date_From: null,
      RCV_Date_To: null,
      ADJ_Date_From: null,
      ADJ_Date_To: null,
MoneyTypeList: [],
      AccNoList: [],

      ShowZeroBalance: true,
      ShowPayAmount: true, // 保留但無作用
      ShowARSAmount: true,

      ...createPaginationConfig(this.defaultSort),
    });

    this.submitted = false;
    this.data = [];
    this.totalRecords = 0;
    this.lastQueryBody = null;
  }

  override onLazyLoadData(e: any) {
    const raw = this.queryForm.getRawValue();
    const payload = this.buildQueryPayload({
      ...raw,
      pageIndex: e?.pageIndex,
      pageSize: e?.pageSize,
      SortBy: e?.SortBy,
    });

    this.loading = true;
    this.fin34020Service
      .queryFIN34020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;

          this.lastQueryBody = { ...payload };
          this._currentSortBy = payload.SortBy ?? this.defaultSort;

          this.loading = false;
          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  @ViewChild('finTable') finTable!: TableComponent;

  ngAfterViewInit(): void {
    setTimeout(() => {
      try {
        (this.finTable as any).IsPrint = true;
      } catch {}

      const dt: any = (this.finTable as any).dt;
      if (dt?.onLazyLoad) {
        dt.onLazyLoad.pipe(untilDestroyed(this)).subscribe((e: any) => {
          const pageSize = Number(e?.rows ?? 30);
          const first = Number(e?.first ?? 0);
          const pageIndex = Math.floor(first / pageSize) + 1;
          this.fireQueryByPage(pageIndex, pageSize, e?.multiSortMeta);
        });
      }
    });
  }

  private readonly _allowSortFields = new Set(this.columns.map(c => c.field).filter(Boolean) as string[]);

  private fireQueryByPage(pageIndex: number, pageSize: number, sortMeta?: any) {
    const raw = this.queryForm.getRawValue();

    let sortBy: SortItem[] | undefined;
    if (Array.isArray(sortMeta) && sortMeta.length) {
      const filtered = sortMeta
        .filter((s: any) => this._allowSortFields.has(String(s?.field)))
        .map((s: any) => ({ field: String(s.field), order: Number(s.order) || 1 }));
      if (filtered.length) sortBy = filtered;
    }
    if (!sortBy || !sortBy.length) sortBy = this._currentSortBy?.length ? this._currentSortBy : this.defaultSort;

    const payload = this.buildQueryPayload({ ...raw, pageIndex, pageSize, SortBy: sortBy });
    this._currentSortBy = payload.SortBy ?? this.defaultSort;

    this.loading = true;
    this.fin34020Service
      .queryFIN34020(payload)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (res: ApiResponse<any>) => {
          const parsed = this.parseQueryResponse(res);
          this.data = parsed.rows;
          this.totalRecords = parsed.total;

          this.lastQueryBody = { ...payload };
          this.loading = false;

          this.saveQueryState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.data = [];
          this.totalRecords = 0;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }
}
