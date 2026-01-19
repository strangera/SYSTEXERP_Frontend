/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

import { FIN13050Service } from '@service/api/fin/fin13050.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { FIN13060Service, QueryResponse } from '../../../service/api/fin/fin13060.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

@Component({
  selector: 'app-fin13060',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    DropdownComponent,
    TableComponent,
    MultiSelectComponent,
    TranslateModule,
    CalendarComponent,
    InputNumberRangeComponent,
    YearMonthComponent,
  ],
  templateUrl: './fin13060.component.html',
  styleUrls: ['./fin13060.component.scss'],
})
export class FIN13060Component extends BasicQueryPageComponent<any> implements AfterViewInit {
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];

  CounterOptions: any[] = [];
  INV_GUITypeOptions: any[] = [];
  taxTypeOptions: any[] = [];
  System_IDOptions: any[] = [];
  AssetNoteOptions: any[] = [];
  venNoOptions: any[] = [];

  /** 記錄最後一次查詢用的條件（供分頁/排序沿用） */
  private lastQueryPayload: any | null = null;

  // 查詢表單：鍵名與後端一模一樣
  queryForm = this.formBuilder.group({
    // 分頁/排序（pageIndex 從 1 開始；預設依 INV_GUINumber 升冪）
    pageSize: [20],
    pageIndex: [1],
    SortBy: this.formBuilder.control<Array<{ field: string; order: number }>>([
      { field: 'INV_GUINumber', order: 1 },
    ]),

    // 條件
    INV_GUIType: this.formBuilder.control<string[] | null>(null),
    INV_GUITrack: [null, [Validators.maxLength(2)]],
    INV_GUINumber: [null, [Validators.maxLength(8)]],
    TXN_GUINo: [null],

    TXN_Date_Start: [null], // Date
    TXN_Date_End: [null],   // Date

    // ⭐ 這兩個給 app-year-month，用 'YYYYMM' 字串存值
    INV_YM: [null as string | null],
    INV_DeclareYM: [null as string | null],

    TXN_Uniform: [null],

    // 金額區間（這幾個會做「最多 10 碼」限制）
    TXN_SaleAmt_Small: [null as number | null, [Validators.maxLength(10)]],
    TXN_SaleAmt_Big:   [null as number | null, [Validators.maxLength(10)]],
    TXN_Net_Small:     [null as number | null, [Validators.maxLength(10)]],
    TXN_Net_Big:       [null as number | null, [Validators.maxLength(10)]],
    TXN_Tax_Small:     [null as number | null, [Validators.maxLength(10)]],
    TXN_Tax_Big:       [null as number | null, [Validators.maxLength(10)]],

    PLU_TaxType: this.formBuilder.control<string[] | null>(null),

    Source_Doc_No: [null, [Validators.maxLength(16)]],
    Voucher_No: [null],

    SAL_Type: this.formBuilder.control<string[] | null>(null),
    SYS_ORIGIN: this.formBuilder.control<string[] | null>(null),
    AssetType: this.formBuilder.control<string[] | null>(null),

    INV_Remark: [null],

    CRT_USR_No: [null],
    CRT_USR_Name: [null],
    CRT_Date_Start: [null], // Date
    CRT_Date_End: [null],

    UPD_USR_No: [null],
    UPD_USR_Name: [null],
    UPD_Date_Start: [null],
    UPD_Date_End: [null],

    Tlt_No: [null],
    Ven_No: [null],
  });

  constructor(
    private readonly fin13060Service: FIN13060Service,
    private readonly counterNameService: CounterNameService,
    private dropDownListService: DropDownListService,
    private readonly fin13050Service: FIN13050Service,
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2
  ) {
    super();
  }

  // ──────────────────────────────────────────────────────────
  // 金額欄位 DOM 限制（第 11 碼直接吃掉）
  // ──────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    // View 建好後，把 6 個金額欄位的 input 都綁上限制
    this.setupAmountInputDomLimit();
  }

  /** ⭐ 直接在 DOM 上限制金額欄位最多 10 碼（打第 11 碼就被吃掉） */
  private setupAmountInputDomLimit(): void {
    const controlNames = [
      'TXN_SaleAmt_Small',
      'TXN_SaleAmt_Big',
      'TXN_Net_Small',
      'TXN_Net_Big',
      'TXN_Tax_Small',
      'TXN_Tax_Big',
    ];

    // 找出這個 component 範圍內所有對應的 input
    const hostElem: HTMLElement = this.elRef.nativeElement;
    const selector = controlNames
      .map(name => `input[formcontrolname="${name}"]`)
      .join(',');

    const inputs = hostElem.querySelectorAll<HTMLInputElement>(selector);

    inputs.forEach(input => {
      // 用 Renderer2 綁 input 事件
      this.renderer.listen(input, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (!target) return;

        let raw = target.value || '';
        // 只保留數字
        let digits = raw.replace(/\D/g, '');

        if (digits.length > 10) {
          digits = digits.slice(0, 10);
        }

        // 寫回 input（畫面上的字立刻被截斷）
        target.value = digits;

        // 同步回 FormControl
        const controlName = target.getAttribute('formcontrolname');
        if (!controlName) return;

        const ctrl = this.queryForm.get(controlName);
        if (!ctrl) return;

        const num = digits ? Number(digits) : null;
        ctrl.setValue(num, { emitEvent: false });
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // 初始化
  // ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // 只初始化頁面資訊 & 權限
    this.initializePage('FIN13060', '/FIN/FIN13060CRU', this.queryForm);
    this.loadDropdownOptions();

    // 回填查詢條件（不自動查詢）
    const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
    if (saved) {
      this.queryForm.patchValue(
        {
          ...saved,

          // 查詢快取裡的 INV_YM / INV_DeclareYM 我們統一轉成 'YYYYMM' 字串
          INV_YM: this.normalizeYm(saved?.INV_YM),
          INV_DeclareYM: this.normalizeYm(saved?.INV_DeclareYM),

          TXN_Date_Start: this.asDate(saved?.TXN_Date_Start),
          TXN_Date_End: this.asDate(saved?.TXN_Date_End),

          CRT_Date_Start: this.asDate(saved?.CRT_Date_Start),
          CRT_Date_End: this.asDate(saved?.CRT_Date_End),
          UPD_Date_Start: this.asDate(saved?.UPD_Date_Start),
          UPD_Date_End: this.asDate(saved?.UPD_Date_End),
        },
        { emitEvent: false }
      );
    }

    // 下拉資料
    this.counterNameService.getCounters().subscribe((res: any) => {
      this.CounterOptions =
        res?.map((x: any) => ({ label: x.label, formLabel: `${x.value} - ${x.label}`, value: x.value })) ?? [];
    });

    this.fin13060Service.queryAPS2002DropDownList().subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.INV_GUITypeOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    this.fin13050Service.querySYS1000DropDownList('PLU_TaxType').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    this.fin13050Service.querySYS1000DropDownList('AssetType').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.AssetNoteOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    this.fin13050Service.querySYS1000DropDownList('SYS_ORIGIN').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.System_IDOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    // ⭐ 金額欄位限制最多 10 碼（FormControl 再加一層保險）
    this.setupAmountMaxDigitsLimit();
  }

  /** 金額格式 */
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  /** 表格欄位 */
  columns: any[] = [
    { field: 'INV_GUIType', header: '發票格式', visible: true },
    { field: 'INV_GUITrack', header: '字軌', visible: true },
    { field: 'INV_GUINumber', header: '發票號碼', visible: true },
    { field: 'TXN_Date', header: '發票日期', visible: true },
    { field: 'INV_YM', header: '資料所屬年月', visible: true },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true },
    { field: 'Tlt_No', header: '專櫃編號', visible: true },
    { field: 'Ven_No', header: '廠客代號', visible: true },
    { field: 'TXN_Uniform', header: '買受人統一編號', visible: true },
    { field: 'TXN_SaleAmt', header: '發票總金額', visible: true, format: this.moneyFormat },
    { field: 'PLU_TaxTypeDesc', header: '課稅別', visible: true },
    { field: 'TXN_Net', header: '發票未稅金額', visible: true, format: this.moneyFormat },
    { field: 'TXN_Tax', header: '稅額', visible: true, format: this.moneyFormat },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'AssetType', header: '資產註記', visible: true },
    { field: 'SAL_Type', header: '系統別', visible: true },
  ];

  // 載入下拉選項（廠客代號）
  protected loadDropdownOptions(): void {
    this.dropDownListService
      .queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe(res => {
        this.venNoOptions = res.Data.map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No
        }));
      });
  }

  /** ⭐ 金額欄位限制最多 10 碼（只保留數字，超過就截斷） */
  private setupAmountMaxDigitsLimit(): void {
    const controls = [
      'TXN_SaleAmt_Small',
      'TXN_SaleAmt_Big',
      'TXN_Net_Small',
      'TXN_Net_Big',
      'TXN_Tax_Small',
      'TXN_Tax_Big',
    ] as const;

    controls.forEach((name) => {
      const ctrl = this.queryForm.get(name);
      if (!ctrl) return;

      ctrl.valueChanges
        .pipe(untilDestroyed(this))
        .subscribe((val) => {
          if (val === null || val === undefined) return;

          // 轉字串，只保留數字
          let s = String(val).replace(/\D/g, '');
          if (s.length <= 10) return;

          // 超過 10 碼就截斷
          const limited = s.slice(0, 10);
          ctrl.setValue(Number(limited), { emitEvent: false });
        });
    });
  }

  // ──────────────────────────────────────────────────────────
  // 工具：時間 / 字串處理
  // ──────────────────────────────────────────────────────────
  /** 工具：Date / string → yyyy-MM-dd（給 API 用） */
  private toDateOnlyString(d?: Date | string | null): string | null {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * 工具：Date / 'YYYYMM' / 其它字串 → 'YYYYMM'
   * - YearMonthComponent 控制的欄位會給 'YYYYMM'
   * - 若是 Date，就轉成當月 'YYYYMM'
   */
  private dateToYM(d: any): string | null {
    if (!d) return null;

    // 若本來就是 'YYYYMM' 字串，直接轉乾淨的 6 碼
    if (typeof d === 'string') {
      const digits = d.replace(/\D/g, '');
      return digits.length >= 6 ? digits.slice(0, 6) : null;
    }

    // Date -> 'YYYYMM'
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
  }

  /** 去頭尾空白；空字串 -> null */
  private normalizeString(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  }

  /** 查詢快取裡的 INV_YM / INV_DeclareYM 統一轉成 'YYYYMM' */
  private normalizeYm(v: any): string | null {
    if (!v) return null;

    // 已經是字串，走 digits flow
    if (typeof v === 'string') {
      const digits = v.replace(/\D/g, '');
      return digits.length >= 6 ? digits.slice(0, 6) : null;
    }

    // Date 或其它 -> 走 dateToYM
    return this.dateToYM(v);
  }

  /** 將表單值轉為後端 queryFIN13060Request（鍵名 1:1） */
  private buildPayload(form: FormGroup): any {
    const v: any = form.value;

    const sortBy = Array.isArray(v.SortBy) ? v.SortBy : [];
    const sortForApi = (sortBy.length > 0) ? sortBy : null;

    const pageSize = (typeof v.pageSize === 'number' && v.pageSize > 0) ? v.pageSize : 20;
    const pageIndex = (typeof v.pageIndex === 'number' && v.pageIndex >= 1) ? v.pageIndex : 1;

    const payload: any = {
      pageSize,
      pageIndex,
      SortBy: sortForApi,

      INV_GUIType: Array.isArray(v.INV_GUIType) && v.INV_GUIType.length ? v.INV_GUIType : null,
      INV_GUITrack: this.normalizeString(v.INV_GUITrack),
      INV_GUINumber: this.normalizeString(v.INV_GUINumber),
      TXN_GUINo: this.normalizeString(v.TXN_GUINo),

      TXN_Date_Start: this.toDateOnlyString(v.TXN_Date_Start),
      TXN_Date_End: this.toDateOnlyString(v.TXN_Date_End),

      // ⭐ 給後端固定 'YYYYMM'
      INV_YM: this.dateToYM(v.INV_YM),
      INV_DeclareYM: this.dateToYM(v.INV_DeclareYM),

      TXN_Uniform: this.normalizeString(v.TXN_Uniform),

      TXN_SaleAmt_Small: v.TXN_SaleAmt_Small ?? null,
      TXN_SaleAmt_Big: v.TXN_SaleAmt_Big ?? null,
      TXN_Net_Small: v.TXN_Net_Small ?? null,
      TXN_Net_Big: v.TXN_Net_Big ?? null,
      TXN_Tax_Small: v.TXN_Tax_Small ?? null,
      TXN_Tax_Big: v.TXN_Tax_Big ?? null,

      PLU_TaxType: Array.isArray(v.PLU_TaxType) && v.PLU_TaxType.length ? v.PLU_TaxType : null,

      Source_Doc_No: this.normalizeString(v.Source_Doc_No),
      Voucher_No: this.normalizeString(v.Voucher_No),

      SAL_Type: Array.isArray(v.SAL_Type) && v.SAL_Type.length ? v.SAL_Type : null,
      SYS_ORIGIN: Array.isArray(v.SYS_ORIGIN) && v.SYS_ORIGIN.length ? v.SYS_ORIGIN : null,
      AssetType: Array.isArray(v.AssetType) && v.AssetType.length ? v.AssetType : null,

      INV_Remark: this.normalizeString(v.INV_Remark),

      CRT_USR_No: this.normalizeString(v.CRT_USR_No),
      CRT_USR_Name: this.normalizeString(v.CRT_USR_Name),
      CRT_Date_Start: v.CRT_Date_Start ? new Date(v.CRT_Date_Start).toISOString() : null,
      CRT_Date_End: v.CRT_Date_End ? new Date(v.CRT_Date_End).toISOString() : null,

      UPD_USR_No: this.normalizeString(v.UPD_USR_No),
      UPD_USR_Name: this.normalizeString(v.UPD_USR_Name),
      UPD_Date_Start: v.UPD_Date_Start ? new Date(v.UPD_Date_Start).toISOString() : null,
      UPD_Date_End: v.UPD_Date_End ? new Date(v.UPD_Date_End).toISOString() : null,

      Tlt_No: this.normalizeString(v.Tlt_No),
      Ven_No: this.normalizeString(v.Ven_No),
    };

    Object.keys(payload).forEach((k) => {
      const val = payload[k];
      if (Array.isArray(val) && val.length === 0) payload[k] = null;
      if (val === '') payload[k] = null;
    });

    return payload;
  }

  private runQuery(payload: any): void {
    this.loading = true;
    this.messageService.blockUi();

    this.fin13060Service.queryFIN13060(payload).subscribe({
      next: (res: QueryResponse<any>) => {
        const raw = res?.Data ?? [];
        this.data = raw.map(row => ({
          ...row,
          TXN_Date: this.toSlashDateDisplay(row?.TXN_Date),
        }));
        this.totalRecords = res?.TotalCount ?? this.data.length;

        this.lastQueryPayload = payload;

        const uiState = this.queryForm.getRawValue();
        this.queryStateService.setQueryState(this.ProgNo, uiState);
      },
      error: () => { this.loading = false; },
      complete: () => { this.loading = false; this.messageService.unblockUi(); },
    });
  }

  private toSlashDateDisplay(d: any): string {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN((date as any).getTime?.())) return String(d ?? '');
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).toString().padStart(2, '0');
    return `${y}/${m}/${day}`;
  }

  // ──────────────────────────────────────────────────────────
  // 查詢 / 分頁 / 刪除 / 清除
  // ──────────────────────────────────────────────────────────
  /** 查詢（按鈕 submit） */
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    form.patchValue({ pageIndex: 1 });

    this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());

    const payload = this.buildPayload(form);
    this.runQuery(payload);
  }

  /** 懶加載（翻頁/排序） */
  override onLazyLoadData(event: any, form: FormGroup): void {
    if (!this.lastQueryPayload) return;

    const currPageSize = (this.lastQueryPayload.pageSize && this.lastQueryPayload.pageSize > 0)
      ? this.lastQueryPayload.pageSize : 20;

    const pageSize = event?.rows ?? event?.pageSize ?? currPageSize;

    const pageIndex =
      Number.isFinite(event?.pageIndex)
        ? Number(event.pageIndex)
        : Math.floor((event?.first ?? 0) / pageSize) + 1;

    const sortByFromEvent =
      Array.isArray(event?.SortBy) ? event.SortBy :
        Array.isArray(event?.multiSortMeta) ? event.multiSortMeta :
          (this.lastQueryPayload.SortBy ?? []);

    const nextPayload = {
      ...this.lastQueryPayload,
      pageSize,
      pageIndex,
      SortBy: (Array.isArray(sortByFromEvent) && sortByFromEvent.length > 0)
        ? sortByFromEvent
        : [{ field: 'INV_GUINumber', order: 1 }],
    };

    form.patchValue(
      {
        pageSize,
        pageIndex,
        SortBy: nextPayload.SortBy,
      },
      { emitEvent: false }
    );

    this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());

    this.runQuery(nextPayload);
  }

  /** 刪除（表格 toolbar） */
  onDelete(event: any): void {
    const ids = this.normalizeIds(event);
    if (!ids.length) {
      this.messageService.warnBubble('請先選擇要刪除的資料');
      return;
    }

    this.messageService.blockUi();
    this.fin13060Service.deleteFIN13060(ids).subscribe({
      next: () => {
        this.messageService.successBubble('刪除成功');
        if (this.lastQueryPayload) {
          this.runQuery(this.lastQueryPayload);
        }
      },
      error: () => {
        this.messageService.errorBubble('刪除失敗，請稍後再試');
        this.messageService.unblockUi();
      },
      complete: () => {
        this.messageService.unblockUi();
      },
    });
  }

  /** 清除（確保清掉 UI、快取、表格、分頁） */
  onClear(): void {
    this.submitted = false;

    this.queryForm.reset(
      {
        pageSize: 20,
        pageIndex: 1,
        SortBy: [{ field: 'INV_GUINumber', order: 1 }],
        INV_GUIType: null,
        INV_GUITrack: null,
        INV_GUINumber: null,
        TXN_GUINo: null,
        TXN_Date_Start: null,
        TXN_Date_End: null,
        INV_YM: null,
        INV_DeclareYM: null,
        TXN_Uniform: null,
        TXN_SaleAmt_Small: null,
        TXN_SaleAmt_Big: null,
        TXN_Net_Small: null,
        TXN_Net_Big: null,
        TXN_Tax_Small: null,
        TXN_Tax_Big: null,
        PLU_TaxType: null,
        Source_Doc_No: null,
        Voucher_No: null,
        SAL_Type: null,
        SYS_ORIGIN: null,
        AssetType: null,
        INV_Remark: null,
        CRT_USR_No: null,
        CRT_USR_Name: null,
        CRT_Date_Start: null,
        CRT_Date_End: null,
        UPD_USR_No: null,
        UPD_USR_Name: null,
        UPD_Date_Start: null,
        UPD_Date_End: null,
        Tlt_No: null,
        Ven_No: null,
      },
      { emitEvent: false }
    );

    this.queryStateService.clearQueryState(this.ProgNo);

    this.data = [];
    this.totalRecords = 0;
    this.lastQueryPayload = null;
  }

  /** 將各種型別安全轉成 number[] (ID) */
  private normalizeIds(input: any): number[] {
    if (Array.isArray(input)) {
      return input
        .map(x => (typeof x === 'number' ? x : Number(x?.ID)))
        .filter(n => Number.isFinite(n));
    }
    if (typeof input === 'number') return [input];
    const id = Number(input?.ID);
    return Number.isFinite(id) ? [id] : [];
  }

  /** ISO / yyyy-MM-dd / Date 轉 Date；不合法則回 null */
  private asDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  /** '202508' / '2025/08' / '2025-08' / Date / ISO → Date(YYYY-MM-01)（目前只給別處備用） */
  private asMonthDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date && !isNaN(v.getTime())) {
      return new Date(v.getFullYear(), v.getMonth(), 1);
    }
    const s = String(v);
    const d = new Date(s);
    if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    const digits = s.replace(/[^0-9]/g, '');
    if (digits.length >= 6) {
      const y = Number(digits.slice(0, 4));
      const m = Number(digits.slice(4, 6));
      if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
        return new Date(y, m - 1, 1);
      }
    }
    return null;
  }
}
