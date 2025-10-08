import { Component } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FIN13050Service } from '../../../service/api/fin/fin13050.service';

// UI
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { ValidationService } from '@shared/service/validation.service';
import { InputNumberComponent } from '@shared/componentkit/input-number/input-number.component';

type SortMeta = { field: string; order: 1 | -1 };

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
    // DropdownComponent,
    // QueryYearMonthComponent,
    TableComponent,
    MultiSelectComponent,
    TranslateModule,
    CalendarComponent,
    InputNumberRangeComponent,
    
  ],
  templateUrl: './fin13050.component.html',
  styleUrls: ['./fin13050.component.scss'],
})
export class FIN13050Component extends BasicQueryPageComponent<any> {
  totalRecords = 0;
  data: any[] = [];
  private vendorMap: Record<
    string,
    { VEN_No: string; VEN_Name: string; VEN_Uniform: string }
  > = {};

  // 下拉/多選選項（沿用你原本的）
  PUR_VoucherTypeOptions: any[] = [];

  // 發票用途 -> 對應後端 PUR_DirectType
  directTypeOptions: Array<{ label: string; value: string }> = [];
  taxTypeOptions: Array<{ label: string; value: string }> = [];
  PUR_DiscNoOptions: Array<{ label: string; value: string }> = [];
  typeOptions: Array<{ label: string; value: string }> = [];
  SYS_ORIGINOptions: Array<{ label: string; value: string }> = [];
  // 課稅別 -> 後端 PUR_TaxType（單值；多選我幫你以逗號字串送出）

  // 類別區分 -> 對應後端 PUR_Type（若需多選，同樣以逗號字串送出）

  vendorOptions: any[] = [];
  private makeRowKey(row: any): string {
    const no = row?.PUR_GUINo ?? '';
    const dt = row?.PUR_GUIDate ?? '';
    return `${no}#${dt}`;
  }



  // ===== 表單：全面改成後端欄位命名 =====
  queryForm = this.formBuilder.group({
    // 後端分頁排序；不包含 Offset / OrderBy
    ...createPaginationConfig([
      { field: 'PUR_GUINo', order: 1 } as any,
      { field: 'PUR_GUIDate', order: 1 } as any,
    ]),

    // 主條件（全部使用後端命名）
    PUR_VoucherType: [], // 發票格式
    PUR_GUITrack: [, [Validators.maxLength(2)]], // 字軌
    PUR_GUINo: [, [Validators.maxLength(8)]], // 發票號碼（前端區間 -> 後端只有單值，會在送出時合併）


    PUR_GUIDate_Start: [], // 發票日期 起
    PUR_GUIDate_End: [], // 發票日期 迄
    PUR_GUIDate_YYYYMM: [
      ,
      [
        // this.validationService.evenMonthValidator,
      ],
    ], // 發票日期(年月)；若你不用可不填

    PUR_RepYYYYMM: [, []], // 資料所屬年月
    PUR_VenUniform: [], // 廠商編號(統編)

    PUR_Amt_Small: [], // 發票總金額 起
    PUR_Amt_Big: [], // 發票總金額 迄
    PUR_Net_Small: [], // 未稅金額 起
    PUR_Net_Big: [], // 未稅金額 迄
    PUR_Tax_Small: [], // 稅額 起
    PUR_Tax_Big: [], // 稅額 迄

    PUR_DirectType: [], // 發票用途（多選轉逗號字串）
    PUR_TaxType: [], // 課稅別（多選轉逗號字串）
    PUR_DiscNo: [], // 憑證單號（若你需要「來源單號」，後端是 Source_Doc_No；此欄保留對應規格）
    PUR_Type: [], // 類別區分（多選轉逗號字串）
    SYS_ORIGIN: [], // 系統別（多選轉逗號字串） 
    Source_Doc_No: [, [Validators.maxLength(14)]], // 憑證單號（若前端使用這個，會直送）
    Voucher_No: [, [Validators.maxLength(11)]], // 傳票號碼
    SAL_Type: [], // 銷售類型（若不用可留空）
    PUR_Remark: [, [Validators.maxLength(100)]], // 備註

    CRT_USR_Name: [],
    CRT_Date_Start: [],
    CRT_Date_End: [],
    UPD_USR_Name: [],
    UPD_Date_Start: [],
    UPD_Date_End: [],
  });

  // ===== Table 欄位：用後端回傳欄位 =====
  columns: any[] = [
    { field: 'PUR_VoucherType', header: '發票格式', visible: true },
    { field: 'PUR_GUITrack', header: '字軌', visible: true },
    { field: 'PUR_GUINo', header: '發票號碼', visible: true },
    {
      field: 'PUR_GUIDate',
      header: '發票日期',
      visible: true,
      format: this.formatDateTime,
    },
    { field: 'PUR_GUIDate_YYYYMM', header: '發票年月', visible: true },
    { field: 'PUR_RepYYYYMM', header: '資料所屬年月', visible: true },
    { field: 'PUR_VenUniform', header: '廠商統編', visible: true },
    { field: 'PUR_Amt', header: '發票總金額', visible: true },
    { field: 'PUR_Net', header: '發票未稅金額', visible: true },
    { field: 'PUR_Tax', header: '發票稅額', visible: true },
    { field: 'PUR_DirectTypeDesc', header: '發票用途', visible: true },
    { field: 'PUR_TaxTypeDesc', header: '課稅別', visible: true },
    { field: 'PUR_DiscNo', header: '扣抵代號', visible: true },
    { field: 'PUR_TypeDesc', header: '類別區分', visible: true },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'SAL_Type', header: '銷售類型', visible: true },
    { field: 'PUR_Remark', header: '備註', visible: true },
  ];

  constructor(
    private fin13050Service: FIN13050Service,
    private validationService: ValidationService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13050', '/fin/FIN13050cru', this.queryForm);
    this.fin13050Service.queryVendorList().subscribe((res) => {
      const list = res?.Data ?? [];
      this.vendorOptions = list.map((v: any) => ({
        label: `${v.VEN_No}-${v.VEN_Name}`,
        value: v.VEN_No,
      }));
      this.vendorMap = Object.fromEntries(list.map((v: any) => [v.VEN_No, v]));
    });
      this.fin13050Service.queryAPS2002DropDownList().subscribe((res) => {
    const list = res?.Data ?? [];
    this.PUR_VoucherTypeOptions = list.map(x => ({
      value: String(x.No),
      label: String(x.Name),
    }));
  });
    this.fin13050Service.querySYS1000DropDownList('PUR_DirectType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.directTypeOptions = list.map((x: any) => ({
        value: String(x.No), // No -> value
        label: String(x.Name), // Name -> label
      }));
    });


    this.fin13050Service
      .querySYS1000DropDownList('PUR_TaxType')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.taxTypeOptions = list.map((x: any) => ({
          value: String(x.No), // No -> value
          label: String(x.Name), // Name -> label
        }));
      });

    this.fin13050Service
      .querySYS1000DropDownList('PUR_DiscNo')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.PUR_DiscNoOptions = list.map((x: any) => ({
          value: String(x.No), // No -> value
          label: String(x.Name), // Name -> label
        }));
      });
    this.fin13050Service
      .querySYS1000DropDownList('PUR_Type')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.typeOptions = list.map((x: any) => ({
          value: String(x.No), // No -> value
          label: String(x.Name), // Name -> label
        }));
      });

          this.fin13050Service
      .querySYS1000DropDownList('SYS_ORIGIN')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.SYS_ORIGINOptions = list.map((x: any) => ({
          value: String(x.No), // No -> value
          label: String(x.Name), // Name -> label
        }));
      });

      
const toStr = (v: any) => (v == null ? v : String(v));
  this.queryForm.controls.PUR_GUINo?.valueChanges.subscribe(v => {
    if (typeof v === 'number') {
      this.queryForm.controls.PUR_GUINo.patchValue(toStr(v), { emitEvent: false });
    }
  });
 
}
/** 將多選值正規化為陣列（空陣列=>undefined 不送） */
/** 將多選值正規化為陣列（空陣列=>undefined 不送） */
private arr<T = any>(
  value: any,
  mapFn?: (x: any) => T | undefined
): T[] | undefined {
  if (value == null) return undefined;

  const pushSafe = (src: any): T | undefined =>
    mapFn ? mapFn(src) : (src as T);

  if (Array.isArray(value)) {
    const arr = value
      .map(pushSafe)
      .filter((x): x is T => x != null && x !== '');
    return arr.length ? arr : undefined;
  }

  const single = pushSafe(value);
  return single != null && single !== '' ? [single] : undefined;
}

/** 單一值 -> 'YYYYMM'，無法轉則回 undefined */
private toYYYYMMOne(input: any): string | undefined {
  if (!input) return undefined;
  if (typeof input === 'string' && /^\d{6}$/.test(input)) return input;     // 'YYYYMM'
  if (typeof input === 'string' && /^\d{8}$/.test(input)) return input.slice(0, 6); // 'YYYYMMDD' -> 'YYYYMM'
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

/** 允許單值或陣列，回傳 'YYYYMM' 的陣列（空=>undefined） */
private toYYYYMMArray(value: any): string[] | undefined {
  return this.arr<string>(value, (v) => this.toYYYYMMOne(v));
}

/** 統編：接受單值或陣列，回傳「只取前8碼數字」的陣列（空=>undefined） */
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


  // 組合「前端號碼區間」成單一送出值（兩端都有時：start-end；僅一端就送該值）
  private composeGUINo(
    start?: string | null,
    end?: string | null,
  ): string | undefined {
    const s = (start ?? '').trim();
    const e = (end ?? '').trim();
    if (s && e) return `${s}-${e}`;
    if (s) return s;
    if (e) return e;
    return undefined;
  }

  formatDateTime(value: any): string {
    if (!value) return '';
    const date = new Date(value);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const v = form.value;

    // 建立 payload：對齊後端，且不包含 Offset / OrderBy
    const payload: any = {
  pageSize: v.pageSize ?? 20,
  pageIndex: v.pageIndex ?? 1,
  SortBy: v.SortBy && v.SortBy.length ? v.SortBy : [{ field: 'PUR_RepYYYYMM', order: 1 }],

  // 單/區間維持原邏輯
  PUR_GUITrack: v.PUR_GUITrack || undefined,
  PUR_GUINo:v.PUR_GUINo || undefined,

  // ↓↓↓ 全部改成「陣列」送出 ↓↓↓
  PUR_VoucherType: this.arr(v.PUR_VoucherType),

  PUR_GUIDate_Start: v.PUR_GUIDate_Start || undefined,
  PUR_GUIDate_End: v.PUR_GUIDate_End || undefined,

  // 年月也改成陣列（單選時就是單元素陣列）
  PUR_GUIDate_YYYYMM: this.toYYYYMMOne(v.PUR_GUIDate_YYYYMM),
  PUR_RepYYYYMM: this.toYYYYMMOne(v.PUR_RepYYYYMM),

  // 統編可多選 -> 傳陣列（每個元素都只保留前8碼數字）
  PUR_VenUniform: this.uniform8Array(v.PUR_VenUniform),

  PUR_Amt_Small: v.PUR_Amt_Small ?? undefined,
  PUR_Amt_Big: v.PUR_Amt_Big ?? undefined,
  PUR_Net_Small: v.PUR_Net_Small ?? undefined,
  PUR_Net_Big: v.PUR_Net_Big ?? undefined,
  PUR_Tax_Small: v.PUR_Tax_Small ?? undefined,
  PUR_Tax_Big: v.PUR_Tax_Big ?? undefined,

  // 多選 -> 陣列
  PUR_DirectType: this.arr(v.PUR_DirectType),
  PUR_TaxType: this.arr(v.PUR_TaxType),
  PUR_DiscNo: this.arr(v.PUR_DiscNo),
  PUR_Type: this.arr(v.PUR_Type),

  // 這些也改成多選陣列（若你 UI 仍是單選，會自動轉單元素陣列）
  Source_Doc_No: v.Source_Doc_No,
  SYS_ORIGIN: this.arr(v.SYS_ORIGIN),  // 你模板已用 multi-select（系統別）
  SAL_Type: this.arr(v.SAL_Type),          // 你模板已用 multi-select（系統別）
  PUR_Remark: this.arr(v.PUR_Remark),

  Voucher_No:  v.Voucher_No ?? undefined,
  CRT_USR_Name:  v.CRT_USR_Name ?? undefined,
  CRT_Date_Start: v.CRT_Date_Start || undefined,
  CRT_Date_End: v.CRT_Date_End || undefined,
  UPD_USR_Name:  v.UPD_USR_Name ?? undefined,
  UPD_Date_Start: v.UPD_Date_Start || undefined,
  UPD_Date_End: v.UPD_Date_End || undefined,
};

// 清掉空值
Object.keys(payload).forEach((k) => {
  const val = payload[k];
  if (val === '' || val === null) payload[k] = undefined;
  // 陣列也檢查一下空陣列
  if (Array.isArray(val) && val.length === 0) payload[k] = undefined;
});

    this.loading = true;
    this.messageService.blockUi();

    this.fin13050Service
      .queryFIN13050(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.messageService.unblockUi();
        }),
      )
      .subscribe({
        next: (res) => {
          this.data = res?.Data ?? []; // 直接吃回來的 data，內含 id
          this.totalRecords = res?.TotalCount ?? this.data.length ?? 0;
          this.queryStateService.setQueryState(this.ProgNo, payload);
        },
        error: () => {
          /* 已由 errorHandler 處理 */
        },
      });
  }
  override onLazyLoadData(event: any, form: FormGroup) {
    // 先讓父類把頁碼/排序寫回表單（我們也會修正父類大小寫）
    super.onLazyLoadData(event, form);
    // 立刻打 API
    this.onSubmit(this.queryForm);
  }
  onDelete = (selection: any | any[]) => {
    const rows = Array.isArray(selection) ? selection : [selection];
    const ids = rows
      .map((r) => Number(r?.id))
      .filter((id) => Number.isFinite(id));

    if (!ids.length) {
      this.messageService.warnBubble('請先選擇要刪除的資料（缺少 id）');
      return;
    }

    // 若你有共用確認窗，可在這裡加一段 confirm（可略）
    // if (!(await this.messageService.confirm('確定刪除選取的資料？'))) return;

    this.messageService.blockUi();
    this.fin13050Service
      .deleteFIN13050(ids)
      .pipe(finalize(() => this.messageService.unblockUi()))
      .subscribe({
        next: () => {
          this.messageService.successBubble('刪除成功');
          // 若剛好刪掉當頁最後一筆且不是第一頁，退回前一頁（可選）
          const v = this.queryForm.value as any;
          const pageSize = v.pageSize ?? 20;
          let pageIndex = v.pageIndex ?? 1;
          if (this.data.length === ids.length && pageIndex > 1) {
            pageIndex -= 1;
            this.queryForm.patchValue({ pageIndex });
          }
          // 重新查詢
          this.onSubmit(this.queryForm);
        },
        error: () => {
          // 已由全域錯誤處理；這裡不需要額外處理
        },
      });
  };


  /** 允許陣列（回逗號字串），或單值（回單一 'YYYYMM'） */
  private toYYYYMMCsv(value: any): string | undefined {
    if (Array.isArray(value)) {
      const items = value
        .map((v) => this.toYYYYMMOne(v))
        .filter((v): v is string => !!v);
      return items.length ? items.join(',') : undefined;
    }
    return this.toYYYYMMOne(value);
  }
  /** 取得統編前 8 碼（忽略 - 分店碼、空白與非數字） */
  private uniform8(value: any): string | undefined {
    if (value == null || value === '') return undefined;
    const s = String(value).trim();

    // 先抓第一段（避免像 03090217-1）
    const head = s.split('-')[0].trim();

    // 只保留數字
    const digits = head.replace(/\D/g, '');

    // 足 8 碼就取前 8 碼
    if (digits.length >= 8) return digits.slice(0, 8);

    // 不足 8 碼就不送
    return undefined;
  }
  // 建議放在 class 內靠前處
  private defaultSort = [{ field: 'PUR_RepYYYYMM', order: 1 } as any];

  private buildInitialQueryValues() {
  return {
    pageIndex: 1,
    pageSize: 20,
    SortBy: this.defaultSort,

    // 多選欄位 -> []
    PUR_VoucherType: [],
    PUR_GUITrack: undefined,
    PUR_GUINoStart: undefined,
    PUR_GUINoEnd: undefined,

    PUR_GUIDate_Start: null,
    PUR_GUIDate_End: null,

    // 年月也視為多選 -> []
    PUR_GUIDate_YYYYMM: [],
    PUR_RepYYYYMM: [],

    PUR_VenUniform: [],

    PUR_Amt_Small: undefined,
    PUR_Amt_Big: undefined,
    PUR_Net_Small: undefined,
    PUR_Net_Big: undefined,
    PUR_Tax_Small: undefined,
    PUR_Tax_Big: undefined,

    PUR_DirectType: [],
    PUR_TaxType: [],
    PUR_Type: [],

    Source_Doc_No: [],
    Voucher_No: [],
    SAL_Type: [],      // 系統別：多選
    PUR_Remark: [],

    CRT_USR_Name: [],
    CRT_Date_Start: null,
    CRT_Date_End: null,
    UPD_USR_Name: [],
    UPD_Date_Start: null,
    UPD_Date_End: null,
  };
}



}
