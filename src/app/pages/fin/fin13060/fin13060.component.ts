/* eslint-disable @typescript-eslint/no-explicit-any */
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

// UI
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

import { untilDestroyed } from '@ngneat/until-destroy';
import { FIN13050Service } from '@service/api/fin/fin13050.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { FIN13060Service } from '../../../service/api/fin/fin13060.service';
import { CounterNameService } from '../../../service/basic/queryTLTTALENT.service';

type SortMeta = { field: string; order: 1 | -1 | number };

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
    MultiSelectComponent,
    TranslateModule,
    CalendarComponent,
    InputNumberRangeComponent,
    YearMonthComponent,
    TableReportComponent,
  ],
  templateUrl: './fin13060.component.html',
  styleUrls: ['./fin13060.component.scss'],
})
export class FIN13060Component extends BasicQueryPageComponent<any> implements OnInit, AfterViewInit {
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];

  CounterOptions: any[] = [];
  INV_GUITypeOptions: any[] = [];
  taxTypeOptions: any[] = [];
  System_IDOptions: any[] = [];
  AssetNoteOptions: any[] = [];
  venNoOptions: any[] = [];

  /** table-report 用：最後一次查詢 body（分頁/排序沿用） */
  lastQueryBody: any = null;

  /** table-report 需要：queryFunction(body) => Observable */
  queryFIN13060Fn = (body: any) => this.fin13060Service.queryFIN13060(body);

  /** 先都開放（需要規則再補） */
  editDisabled = (_row: any): boolean => false;
  detailDisabled = (_row: any): boolean => false;

  // 查詢表單：鍵名與後端一模一樣
  queryForm = this.formBuilder.group({
    pageSize: [30],
    pageIndex: [1],
    SortBy: this.formBuilder.control<SortMeta[]>([{ field: 'INV_GUINumber', order: 1 }]),

    INV_GUIType: this.formBuilder.control<string[] | null>(null),
    INV_GUITrack: [null, [Validators.maxLength(2)]],
    INV_GUINumber: [null, [Validators.maxLength(8)]],
    TXN_GUINo: [null],

    TXN_Date_Start: [null as Date | null],
    TXN_Date_End: [null as Date | null],

    // dateMonthOne 回 Date
    INV_YM: [null as Date | null],

    // year-month 回 'YYYYMM'
    INV_DeclareYM: [null as string | null],

    TXN_Uniform: [null],

    TXN_SaleAmt_Small: [null as number | null, [Validators.maxLength(10)]],
    TXN_SaleAmt_Big: [null as number | null, [Validators.maxLength(10)]],
    TXN_Net_Small: [null as number | null, [Validators.maxLength(10)]],
    TXN_Net_Big: [null as number | null, [Validators.maxLength(10)]],
    TXN_Tax_Small: [null as number | null, [Validators.maxLength(10)]],
    TXN_Tax_Big: [null as number | null, [Validators.maxLength(10)]],

    PLU_TaxType: this.formBuilder.control<string[] | null>(null),

    Source_Doc_No: [null, [Validators.maxLength(16)]],
    Voucher_No: [null],

    SAL_Type: this.formBuilder.control<string[] | null>(null),
    SYS_ORIGIN: this.formBuilder.control<string[] | null>(null),
    AssetType: this.formBuilder.control<string[] | null>(null),

    INV_Remark: [null],

    CRT_USR_No: [null],
    CRT_USR_Name: [null],
    CRT_Date_Start: [null as Date | null],
    CRT_Date_End: [null as Date | null],

    UPD_USR_No: [null],
    UPD_USR_Name: [null],
    UPD_Date_Start: [null as Date | null],
    UPD_Date_End: [null as Date | null],

    Tlt_No: [null],
    Ven_No: [null],
  });

  constructor(
    private readonly fin13060Service: FIN13060Service,
    private readonly counterNameService: CounterNameService,
    private readonly dropDownListService: DropDownListService,
    private readonly fin13050Service: FIN13050Service,
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2,
  ) {
    super();
  }

  // ──────────────────────────────────────────────────────────
  // 金額欄位 DOM 限制（第 11 碼直接吃掉）
  // ──────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    this.setupAmountInputDomLimit();
  }

  private setupAmountInputDomLimit(): void {
    const controlNames = [
      'TXN_SaleAmt_Small',
      'TXN_SaleAmt_Big',
      'TXN_Net_Small',
      'TXN_Net_Big',
      'TXN_Tax_Small',
      'TXN_Tax_Big',
    ];

    const hostElem: HTMLElement = this.elRef.nativeElement;
    const selector = controlNames.map(name => `input[formcontrolname="${name}"]`).join(',');
    const inputs = hostElem.querySelectorAll<HTMLInputElement>(selector);

    inputs.forEach(input => {
      this.renderer.listen(input, 'input', (event: Event) => {
        const target = event.target as HTMLInputElement;
        if (!target) return;

        let digits = (target.value || '').replace(/\D/g, '');
        if (digits.length > 10) digits = digits.slice(0, 10);

        target.value = digits;

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
    this.initializePage('FIN13060', '/FIN/FIN13060CRU', this.queryForm);

    // 下拉
    this.loadDropdownOptions();

    // 專櫃
    this.counterNameService.getCounters().subscribe((res: any) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) ?? [];
    });

    // 發票格式
    this.fin13060Service.queryAPS2002DropDownList().subscribe((res: any) => {
      const list = res?.Data ?? [];

      const allow = new Set(['31', '32']); // ✅只顯示這兩種

      this.INV_GUITypeOptions = list
        .filter((x: any) => allow.has(String(x?.No)))
        .map((x: any) => ({
          value: String(x.No),
          label: `${x.No}-${x.Name}`,
        }));
    });

    // SYS1000
    // 如果 fin13050Service 的方法型別吃不到 string，你可以比照 FIN13050 用 any：
    // const sys1000 = (type: string) => (this.fin13050Service as any).querySYS1000DropDownList(type);
    const sys1000 = (type: string) => this.fin13050Service.querySYS1000DropDownList(type as any);

    sys1000('PLU_TaxType').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    sys1000('AssetType').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.AssetNoteOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    sys1000('SYS_ORIGIN').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.System_IDOptions = list.map((x: any) => ({ value: String(x.No), label: `${x.No}-${x.Name}` }));
    });

    // FormControl 保險：最多 10 碼
    this.setupAmountMaxDigitsLimit();

    // ✅ 只從 CRU 回來才還原
    const fromCru = !!(history.state && history.state['fromCru']);

    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue(this.ProgNo);
      if (saved) {
        this.queryForm.patchValue(
          {
            ...saved,
            TXN_Date_Start: this.asDate(saved?.TXN_Date_Start),
            TXN_Date_End: this.asDate(saved?.TXN_Date_End),
            CRT_Date_Start: this.asDate(saved?.CRT_Date_Start),
            CRT_Date_End: this.asDate(saved?.CRT_Date_End),
            UPD_Date_Start: this.asDate(saved?.UPD_Date_Start),
            UPD_Date_End: this.asDate(saved?.UPD_Date_End),
            INV_YM: this.asMonthDate(saved?.INV_YM),
            INV_DeclareYM: this.normalizeYm(saved?.INV_DeclareYM),
          },
          { emitEvent: false },
        );

        // ✅ 先設好 lastQueryBody，讓 table-report 的 lazy mode 可使用
        const payload = this.buildPayload(this.queryForm);
        this.lastQueryBody = { ...payload };

        // ✅ 等 Angular 完成初始渲染後再查詢，避免與 table-report 初始化競爭
        setTimeout(() => this.onSubmit(this.queryForm), 0);
      }
    } else {
      this.queryStateService.clearQueryState(this.ProgNo);
      this.queryForm.patchValue(
        {
          pageSize: 30,
          pageIndex: 1,
          SortBy: [{ field: 'INV_GUINumber', order: 1 }],
        },
        { emitEvent: false },
      );
      this.setDefaultDeclareYmForQuery();
    }
  }

  /** 下拉：廠客代號 */
  protected loadDropdownOptions(): void {
    this.dropDownListService
      .queryPOS2013_DropDownList()
      .pipe(untilDestroyed(this))
      .subscribe((res) => {
        this.venNoOptions = (res?.Data ?? []).map((x: any) => ({
          label: `${x.VEN_No} - ${x.Name}`,
          value: x.VEN_No,
        }));
      });
  }

  /** 查詢頁：申報年月預設帶入系統年月（偶數月 YYYYMM） */
  private setDefaultDeclareYmForQuery(): void {
    const now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;

    if (month % 2 !== 0) {
      month += 1;
      if (month > 12) {
        month = 2;
        year += 1;
      }
    }

    const yyyymm = `${year}${String(month).padStart(2, '0')}`;
    this.queryForm.patchValue({ INV_DeclareYM: yyyymm }, { emitEvent: false });
  }

  /** ⭐ 金額欄位限制最多 10 碼（FormControl 保險） */
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

      ctrl.valueChanges.pipe(untilDestroyed(this)).subscribe((val) => {
        if (val === null || val === undefined) return;

        let s = String(val).replace(/\D/g, '');
        if (s.length <= 10) return;

        const limited = s.slice(0, 10);
        ctrl.setValue(Number(limited), { emitEvent: false });
      });
    });
  }

  /** 金額格式 */
  moneyFormat = (value: number): string => {
    return value != null ? Number(value).toLocaleString('en-US') : '0';
  };

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
    { field: 'SYS_ORIGIN', header: '系統別', visible: true, exportFormat: [] },
    { field: 'SYS_ORIGINDesc', header: '系統別名稱', visible: true },
  ];

  // ──────────────────────────────────────────────────────────
  // 工具：時間 / 字串處理
  // ──────────────────────────────────────────────────────────
  private toDateOnlyString(d?: Date | string | null): string | null {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private dateToYM(d: any): string | null {
    if (!d) return null;

    if (typeof d === 'string') {
      const digits = d.replace(/\D/g, '');
      return digits.length >= 6 ? digits.slice(0, 6) : null;
    }

    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt.getTime())) return null;
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
  }

  private normalizeString(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  }

  private normalizeYm(v: any): string | null {
    if (!v) return null;
    if (typeof v === 'string') {
      const digits = v.replace(/\D/g, '');
      return digits.length >= 6 ? digits.slice(0, 6) : null;
    }
    return this.dateToYM(v);
  }

  private asDate(v: any): Date | null {
    if (!v) return null;
    if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }

  private asMonthDate(v: any): Date | null {
    if (!v) return null;

    if (v instanceof Date && !isNaN(v.getTime())) {
      return new Date(v.getFullYear(), v.getMonth(), 1);
    }

    const s = String(v).trim();
    const digits = s.replace(/[^0-9]/g, '');

    if (digits.length >= 6) {
      const y = Number(digits.slice(0, 4));
      const m = Number(digits.slice(4, 6));
      if (Number.isFinite(y) && Number.isFinite(m) && m >= 1 && m <= 12) {
        return new Date(y, m - 1, 1);
      }
    }

    const d = new Date(s);
    if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);

    return null;
  }

  /** 將表單值轉成後端 payload（鍵名 1:1） */
  private buildPayload(form: FormGroup): any {
    const v: any = form.value;

    const sortBy = Array.isArray(v.SortBy) ? v.SortBy : [];
    const sortForApi = sortBy.length ? sortBy : [{ field: 'INV_GUINumber', order: 1 }];

    const pageSize = typeof v.pageSize === 'number' && v.pageSize > 0 ? v.pageSize : 30;
    const pageIndex = typeof v.pageIndex === 'number' && v.pageIndex >= 1 ? v.pageIndex : 1;

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

      INV_YM: this.dateToYM(v.INV_YM),
      INV_DeclareYM: this.normalizeYm(v.INV_DeclareYM),

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
  // 查詢 / 刪除 / 清除
  // ──────────────────────────────────────────────────────────
  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    // 按查詢：回第一頁
    form.patchValue({ pageIndex: 1 }, { emitEvent: false });

    const payload = this.buildPayload(form);

    // ✅ 給 table-report 沿用（排序/分頁/滾動載入）
    this.lastQueryBody = { ...payload };

    // ✅ 存 UI 還原用（只存表單）
    this.queryStateService.setQueryState(this.ProgNo, form.getRawValue());

    // ✅ 主動查一次（也可只靠 table-report，但這樣一按查詢就有資料）
    this.loading = true;
    this.messageService.blockUi();

    this.fin13060Service.queryFIN13060(payload).subscribe({
      next: (res: any) => {
        const raw = res?.Data ?? [];
        this.data = raw.map((row: any) => ({
          ...row,
          TXN_Date: this.toSlashDateDisplay(row?.TXN_Date),
        }));
        this.totalRecords = res?.TotalCount ?? this.data.length;
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

  onDelete(event: any): void {
    const ids = this.normalizeIds(event);
    if (!ids.length) {
      this.messageService.warnBubble('請先選擇要刪除的資料');
      return;
    }

    // ✅ 確認框：只傳 1 個參數（options 物件）
    this.messageService.confirm({
      message: `確定要刪除選取的 ${ids.length} 筆資料嗎？`,
      header: '刪除確認',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: '確定',
      rejectLabel: '取消',
      accept: () => {
        this.messageService.blockUi();

        this.fin13060Service.deleteFIN13060(ids).subscribe({
          next: () => {
            this.messageService.successBubble('刪除成功');

            if (this.lastQueryBody) {
              const pageSize =
                Number(this.lastQueryBody?.pageSize) > 0 ? this.lastQueryBody.pageSize : 30;

              const body = { ...this.lastQueryBody, pageSize };
              this.lastQueryBody = body;

              this.fin13060Service.queryFIN13060(body).subscribe({
                next: (res: any) => {
                  const raw = res?.Data ?? [];
                  this.data = raw.map((row: any) => ({
                    ...row,
                    TXN_Date: this.toSlashDateDisplay(row?.TXN_Date),
                  }));
                  this.totalRecords = res?.TotalCount ?? this.data.length;
                },
                error: () => this.messageService.unblockUi(),
                complete: () => this.messageService.unblockUi(),
              });
              return;
            }

            this.messageService.unblockUi();
          },
          error: () => {
            this.messageService.errorBubble('刪除失敗，請稍後再試');
            this.messageService.unblockUi();
          },
        });
      },
      reject: () => { },
    });
  }




  onClear(): void {
    this.submitted = false;

    this.queryForm.reset(
      {
        pageSize: 30,
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
      { emitEvent: false },
    );

    this.queryStateService.clearQueryState(this.ProgNo);

    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];

    this.lastQueryBody = null;

    // 清掉後預設再帶一次偶數月
    this.setDefaultDeclareYmForQuery();
  }

  private normalizeIds(input: any): number[] {
    if (Array.isArray(input)) {
      return input
        .map((x) => (typeof x === 'number' ? x : Number(x?.ID)))
        .filter((n) => Number.isFinite(n));
    }
    if (typeof input === 'number') return [input];
    const id = Number(input?.ID);
    return Number.isFinite(id) ? [id] : [];
  }
}
