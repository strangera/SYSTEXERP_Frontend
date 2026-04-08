/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { FIN13050Service } from '../../../service/api/fin/fin13050.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';

// UI
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';

interface SortMeta { field: string; order: 1 | -1 }

@Component({
  selector: 'app-fin13050',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    CalendarRangeComponent,
    MultiSelectComponent,
    TranslateModule,
    CalendarComponent,
    InputNumberRangeComponent,
    YearMonthComponent,
    TableReportComponent,
  ],
  templateUrl: './fin13050.component.html',
  styleUrls: ['./fin13050.component.scss'],
})
export class FIN13050Component extends BasicQueryPageComponent<any> implements OnInit {
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];

  private vendorMap: Record<string, { VEN_No: string; VEN_Name: string; VEN_Uniform: string }> = {};

  // 下拉/多選選項
  PUR_VoucherTypeOptions: any[] = [];
  directTypeOptions: { label: string; value: string }[] = [];
  taxTypeOptions: { label: string; value: string }[] = [];
  PUR_DiscNoOptions: { label: string; value: string }[] = [];
  typeOptions: { label: string; value: string }[] = [];
  SYS_ORIGINOptions: { label: string; value: string }[] = [];
  vendorOptions: any[] = [];

  /** 預設排序 */
  readonly defaultSort: SortMeta[] = [{ field: 'PUR_RepYYYYMM', order: 1 }];

  /** table-report：最後查詢 body（table-report 會用這個去做 lazy / sort / loadMore） */
  lastQueryBody: any = null;

  /** table-report 需要：提供 queryFunction (Observable) */
  queryFIN13050Fn = (body: any) => this.fin13050Service.queryFIN13050(body);

  // ✅ Voucher_No 有值的資料不可勾選（無法刪除）
  isRowSelectable = (row: any): boolean => !row?.Voucher_No;

  editDisabled = (row: any): boolean => !this.isRowSelectable(row);
  detailDisabled = (row: any): boolean => !this.isRowSelectable(row);

  // ===== 表單 =====
  queryForm = this.formBuilder.group({
    ...createPaginationConfig([
      { field: 'PUR_GUINo', order: 1 } as any,
      { field: 'PUR_GUIDate', order: 1 } as any,
    ]),

    PUR_VoucherType: [],
    PUR_GUINo: [null as any, [Validators.maxLength(10)]],

    PUR_GUIDate_Start: [],
    PUR_GUIDate_End: [],

    PUR_GUIDate_YYYYMM: [null as Date | null],
    PUR_RepYYYYMM: [null as Date | null],

    PUR_VenUniform: [],

    PUR_Amt_Small: [],
    PUR_Amt_Big: [],
    PUR_Net_Small: [],
    PUR_Net_Big: [],
    PUR_Tax_Small: [],
    PUR_Tax_Big: [],

    PUR_DirectType: [],
    PUR_TaxType: [],
    PUR_DiscNo: [],
    PUR_Type: [],
    SYS_ORIGIN: [],
    Source_Doc_No: [null as any, [Validators.maxLength(14)]],
    Voucher_No: [null as any, [Validators.maxLength(11)]],
    SAL_Type: [],
    PUR_Remark: [null as any, [Validators.maxLength(100)]],

    CRT_USR_Name: [],
    CRT_Date_Start: [],
    CRT_Date_End: [],
    UPD_USR_Name: [],
    UPD_Date_Start: [],
    UPD_Date_End: [],
  });

  // ===== Table 欄位 =====
  columns: any[] = [
    { field: 'PUR_VoucherType', header: '發票格式', visible: true },
    { field: 'PUR_GUINo', header: '發票號碼', visible: true },
    { field: 'PUR_GUIDate', header: '發票日期', visible: true, format: (v: any) => this.formatDateTime(v) },
    { field: 'PUR_GUIDate_YYYYMM', header: '資料所屬年月', visible: true },
    { field: 'PUR_RepYYYYMM', header: '申報年月', visible: true },
    { field: 'PUR_VenUniform', header: '廠商統編', visible: true },
    { field: 'PUR_Amt', header: '發票總金額', visible: true, format: (v: any) => this.money(v) },
    { field: 'PUR_Net', header: '發票未稅金額', visible: true, format: (v: any) => this.money(v) },
    { field: 'PUR_Tax', header: '發票稅額', visible: true, format: (v: any) => this.money(v) },
    { field: 'PUR_DirectTypeDesc', header: '發票用途', visible: true },
    { field: 'PUR_TaxTypeDesc', header: '課稅別', visible: true },
    { field: 'PUR_DiscNoDesc', header: '扣抵代號', visible: true },
    { field: 'PUR_TypeDesc', header: '類別區分', visible: true },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'SAL_Type', header: '系統別', visible: true },
    { field: 'PUR_Remark', header: '備註', visible: true },
  ];

  constructor(
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    // ---- 小工具：把 YYYYMM / YYYY-MM / YYYY/MM / YYYYMMDD 轉為該月 1 號的 Date ----
    const toMonthDate = (val: any): Date | null => {
      if (val == null || val === '') return null;
      if (val instanceof Date && !isNaN(val.getTime())) return val;

      const s = String(val).trim();
      const digits = s.replace(/\D/g, '');

      if (/^\d{8}$/.test(digits)) {
        const y = Number(digits.slice(0, 4));
        const m = Number(digits.slice(4, 6)) - 1;
        return isFinite(y) && isFinite(m) ? new Date(y, m, 1) : null;
      }

      if (/^\d{6}$/.test(digits)) {
        const y = Number(digits.slice(0, 4));
        const m = Number(digits.slice(4, 6)) - 1;
        return isFinite(y) && isFinite(m) ? new Date(y, m, 1) : null;
      }

      const m2 = s.match(/^(\d{4})[-\/](\d{1,2})$/);
      if (m2) {
        const y = Number(m2[1]);
        const m = Number(m2[2]) - 1;
        return isFinite(y) && isFinite(m) ? new Date(y, m, 1) : null;
      }
      return null;
    };

    const normalizeMonthControl = (ctrl: any) => {
      const v = ctrl?.value;
      if (v == null) return;
      if (!(v instanceof Date)) {
        const d = toMonthDate(v);
        if (d) ctrl.patchValue(d, { emitEvent: false });
      }
    };

    const setDefaultRepYYYYMMByToday = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      let evenMonth = month % 2 === 0 ? month : month + 1;
      if (evenMonth > 12) evenMonth = 12;

      this.queryForm.patchValue(
        { PUR_RepYYYYMM: new Date(year, evenMonth - 1, 1) },
        { emitEvent: false },
      );
    };

    // === 頁面初始化 ===
    this.initializePage('FIN13050', '/fin/FIN13050cru', this.queryForm);

    // === 下拉資料 ===
    this.fin13050Service.queryVendorList().subscribe((res) => {
      const list = res?.Data ?? [];
      this.vendorOptions = list.map((v: any) => ({
        label: `${v.VEN_No} - ${v.VEN_Name}`,
        value: v.VEN_No,
      }));
      this.vendorMap = Object.fromEntries(list.map((v: any) => [v.VEN_No, v]));
    });

    this.fin13050Service.queryAPS2002DropDownList().subscribe((res) => {
      const list = res?.Data ?? [];
      this.PUR_VoucherTypeOptions = list.map((x: any) => ({
        value: String(x.No),
        label: `${x.No}-${x.Name}`,
      }));
    });

    // ⚠️ 這裡用 any 轉型，避免你現在遇到的 TS2345（string 不能給 null|undefined）
    const sys1000 = (type: string) => (this.fin13050Service as any).querySYS1000DropDownList(type);

    sys1000('PUR_DirectType').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.directTypeOptions = list.map((x: any) => ({
        value: String(x.No),
        label: `${x.No}-${x.Name}`,
      }));
    });

    sys1000('PUR_TaxType').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({
        value: String(x.No),
        label: `${x.No}-${x.Name}`,
      }));
    });

    sys1000('PUR_DiscNo').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.PUR_DiscNoOptions = list.map((x: any) => ({
        value: String(x.No),
        label: `${x.No}-${x.Name}`,
      }));
    });

    sys1000('PUR_Type').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.typeOptions = list.map((x: any) => ({
        value: String(x.No),
        label: `${x.No}-${x.Name}`,
      }));
    });

    sys1000('SYS_ORIGIN').subscribe((res: any) => {
      const list = res?.Data ?? [];
      this.SYS_ORIGINOptions = list.map((x: any) => ({
        value: String(x.No),
        label: `${x.No}-${x.Name}`,
      }));
    });

    // 發票號碼輸入：若被輸入數字，改成字串避免被格式化
    this.queryForm.controls.PUR_GUINo?.valueChanges.subscribe((v: any) => {
      if (typeof v === 'number') {
        this.queryForm.controls.PUR_GUINo.patchValue(String(v), { emitEvent: false });
      }
    });

    // normalize 初始的年月欄位
    normalizeMonthControl(this.queryForm.controls.PUR_RepYYYYMM);
    normalizeMonthControl(this.queryForm.controls.PUR_GUIDate_YYYYMM);

    // ✅ 只從 CRU 回來才還原
    const fromCru = !!(history.state && history.state['fromCru']);

    if (fromCru) {
      const saved = this.queryStateService.getQueryStateValue('FIN13050');
      if (saved) {
        const formValue = saved.formValue ?? saved;

        if (formValue) {
          this.queryForm.patchValue(formValue, { emitEvent: false });
          normalizeMonthControl(this.queryForm.controls.PUR_RepYYYYMM);
          normalizeMonthControl(this.queryForm.controls.PUR_GUIDate_YYYYMM);
        }

        this.lastQueryBody = saved.lastQueryBody ?? null;

        // 回來就自動查一次
        Promise.resolve().then(() => this.onSubmit(this.queryForm));
      }
    } else {
      this.queryStateService.clearQueryState('FIN13050');
      this.lastQueryBody = null;
      setDefaultRepYYYYMMByToday();
    }
  }

  /** 將多選值正規化為陣列（空陣列=>undefined 不送） */
  private arr<T = any>(value: any, mapFn?: (x: any) => T | undefined): T[] | undefined {
    if (value == null) return undefined;

    const pushSafe = (src: any): T | undefined => (mapFn ? mapFn(src) : (src as T));

    if (Array.isArray(value)) {
      const a = value.map(pushSafe).filter((x): x is T => x != null && x !== '');
      return a.length ? a : undefined;
    }

    const single = pushSafe(value);
    return single != null && single !== '' ? [single] : undefined;
  }

  private toYYYYMMOne(input: any): string | undefined {
    if (!input) return undefined;
    if (typeof input === 'string' && /^\d{6}$/.test(input)) return input;
    if (typeof input === 'string' && /^\d{8}$/.test(input)) return input.slice(0, 6);
    if (typeof input === 'string') {
      const m = input.match(/^(\d{4})[-\/](\d{2})/);
      if (m) return m[1] + m[2];
    }
    const d = new Date(input);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    return undefined;
  }

  private uniform8Array(value: any): string[] | undefined {
    const mapTo8 = (val: any): string | undefined => {
      if (val == null || val === '') return undefined;
      const s = String(val).trim();
      const head = s.split('-')[0].trim();
      const digits = head.replace(/\D/g, '');
      return digits.length >= 8 ? digits.slice(0, 8) : undefined;
    };
    return this.arr<string>(value, mapTo8);
  }

  formatDateTime(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
  }

  /** 金額格式化（千分位） */
  money(v: number): string {
    return Number(v ?? 0).toLocaleString('en-US');
  }

  /** 儲存查詢狀態，給返回列表還原用 */
  private saveQueryState(): void {
    this.queryStateService.setQueryState(this.ProgNo, {
      formValue: this.queryForm.getRawValue(),
      lastQueryBody: this.lastQueryBody,
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const v = form.value as any;

    // ✅ 排序：優先用表單 SortBy；若沒有就用 defaultSort
    const sortBy: SortMeta[] =
      v.SortBy && v.SortBy.length ? (v.SortBy as SortMeta[]) : this.defaultSort;

    const payload: any = {
      pageSize: v.pageSize ?? 30,
      pageIndex: v.pageIndex ?? 1,
      SortBy: sortBy,

      PUR_GUINo: v.PUR_GUINo?.toUpperCase() || undefined,
      PUR_VoucherType: this.arr(v.PUR_VoucherType),

      PUR_GUIDate_Start: v.PUR_GUIDate_Start || undefined,
      PUR_GUIDate_End: v.PUR_GUIDate_End || undefined,

      PUR_GUIDate_YYYYMM: this.toYYYYMMOne(v.PUR_GUIDate_YYYYMM),
      PUR_RepYYYYMM: this.toYYYYMMOne(v.PUR_RepYYYYMM),

      PUR_VenUniform: this.uniform8Array(v.PUR_VenUniform),

      PUR_Amt_Small: v.PUR_Amt_Small ?? undefined,
      PUR_Amt_Big: v.PUR_Amt_Big ?? undefined,
      PUR_Net_Small: v.PUR_Net_Small ?? undefined,
      PUR_Net_Big: v.PUR_Net_Big ?? undefined,
      PUR_Tax_Small: v.PUR_Tax_Small ?? undefined,
      PUR_Tax_Big: v.PUR_Tax_Big ?? undefined,

      PUR_DirectType: this.arr(v.PUR_DirectType),
      PUR_TaxType: this.arr(v.PUR_TaxType),
      PUR_DiscNo: this.arr(v.PUR_DiscNo),
      PUR_Type: this.arr(v.PUR_Type),

      Source_Doc_No: v.Source_Doc_No,
      SYS_ORIGIN: this.arr(v.SYS_ORIGIN),
      SAL_Type: this.arr(v.SAL_Type),
      PUR_Remark: v.PUR_Remark,

      Voucher_No: v.Voucher_No ?? undefined,
      CRT_USR_Name: v.CRT_USR_Name ?? undefined,
      CRT_Date_Start: v.CRT_Date_Start || undefined,
      CRT_Date_End: v.CRT_Date_End || undefined,
      UPD_USR_Name: v.UPD_USR_Name ?? undefined,
      UPD_Date_Start: v.UPD_Date_Start || undefined,
      UPD_Date_End: v.UPD_Date_End || undefined,
    };

    Object.keys(payload).forEach((k) => {
      const val = payload[k];
      if (val === '' || val === null) payload[k] = undefined;
      if (Array.isArray(val) && val.length === 0) payload[k] = undefined;
    });

    this.loading = true;
    this.messageService.blockUi();

    this.fin13050Service.queryFIN13050(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.messageService.unblockUi();
      }))
      .subscribe({
        next: (res) => {
          this.data = res?.Data ?? [];
          this.totalRecords = res?.TotalCount ?? this.data.length ?? 0;

          // ✅ table-report 用：一定要把最後查詢 body 記住（含 SortBy）
          this.lastQueryBody = { ...payload };

          this.saveQueryState();
        },
        error: () => { /* 全域錯誤處理 */ },
      });
  }

onDelete = (selection: any | any[]) => {
  const rows = Array.isArray(selection) ? selection : [selection];

  const invalid = rows.filter((r) => !!r?.Voucher_No);
  if (invalid.length) {
    this.messageService.warnBubble('已產生傳票號碼之資料不可刪除');
    return;
  }

  const ids = rows.map((r) => Number(r?.id)).filter((id) => Number.isFinite(id));
  if (!ids.length) {
    this.messageService.warnBubble('請先選擇要刪除的資料（缺少 id）');
    return;
  }

  // ✅ 確認視窗（只傳 1 個 options 物件，避免 TS2554）
  this.messageService.confirm({
    header: '刪除確認',
    message: `確定要刪除選取的 ${ids.length} 筆資料嗎？`,
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確定',
    rejectLabel: '取消',
    accept: () => {
      this.messageService.blockUi();

      this.fin13050Service
        .deleteFIN13050(ids)
        .pipe(finalize(() => this.messageService.unblockUi()))
        .subscribe({
          next: () => {
            this.messageService.successBubble('刪除成功');

            const v = this.queryForm.value as any;
            const pageSize = v.pageSize ?? 30;
            let pageIndex = v.pageIndex ?? 1;

            // 若刪掉整頁，往前一頁
            if (this.data.length === ids.length && pageIndex > 1) {
              pageIndex -= 1;
              this.queryForm.patchValue({ pageIndex }, { emitEvent: false });
            }

            // 保險：若 onSubmit 會用到 pageSize，也確保還在
            if (!this.queryForm.value?.pageSize) {
              this.queryForm.patchValue({ pageSize }, { emitEvent: false });
            }

            this.onSubmit(this.queryForm);
          },
          error: () => {
            /* 全域錯誤處理 */
          },
        });
    },
    reject: () => {
      // 取消：不做事
    },
  });
};


  private buildInitialQueryValues() {
    return {
      pageIndex: 1,
      pageSize: 30,
      SortBy: this.defaultSort as SortMeta[],

      PUR_GUINo: null,

      PUR_GUIDate_Start: null,
      PUR_GUIDate_End: null,
      PUR_GUIDate_YYYYMM: null,
      PUR_RepYYYYMM: null,

      PUR_VoucherType: null,
      PUR_VenUniform: null,
      PUR_Amt_Small: null,
      PUR_Amt_Big: null,
      PUR_Net_Small: null,
      PUR_Net_Big: null,
      PUR_Tax_Small: null,
      PUR_Tax_Big: null,
      PUR_DirectType: null,
      PUR_TaxType: null,
      PUR_DiscNo: null,
      PUR_Type: null,
      SYS_ORIGIN: null,
      SAL_Type: null,
      PUR_Remark: null,
      Source_Doc_No: null,
      Voucher_No: null,

      CRT_USR_Name: null,
      CRT_Date_Start: null,
      CRT_Date_End: null,
      UPD_USR_Name: null,
      UPD_Date_Start: null,
      UPD_Date_End: null,
    };
  }

  onClear(): void {
    const init = this.buildInitialQueryValues();
    this.queryForm.reset(init);

    this.data = [];
    this.totalRecords = 0;
    this.selectedItems = [];

    this.lastQueryBody = null;

    this.saveQueryState();
  }
}
