/* src/app/pages/fin/fin13060/fin13060.component.ts */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

import { FIN13060Service, QueryResponse } from '../../../service/api/fin/fin13060.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';
import { FIN13050Service } from '@service/api/fin/fin13050.service';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';


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
  ],
  templateUrl: './fin13060.component.html',
  styleUrls: ['./fin13060.component.scss'],
})
export class FIN13060Component extends BasicQueryPageComponent<any> {
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  CounterOptions: any[] = [];

  INV_GUITypeOptions: any[] = [
   
  ];

  taxTypeOptions = [
  
  ];

  System_IDOptions = [
  
  ];

  AssetNoteOptions = [

  ];

  // 查詢表單：鍵名與後端一模一樣
  queryForm = this.formBuilder.group({
    // 分頁/排序
    PageSize: [0],
    PageIndex: [0],
    SortBy: this.formBuilder.control<Array<{ field: string; order: number }>>([]),

    // 條件
    INV_GUIType: this.formBuilder.control<string[] | null>(null),
    INV_GUITrack: [null, [Validators.maxLength(2)]],
    INV_GUINumber: [null, [Validators.maxLength(8)]],
    TXN_GUINo: [null],

    TXN_Date_Start: [null], // yyyy-MM-dd
    TXN_Date_End: [null],   // yyyy-MM-dd

    INV_YM: [null],           // yyyyMM（單值）
    INV_DeclareYM: [null],    // yyyyMM（單值）

    TXN_Uniform: [null],

    TXN_SaleAmt_Small: [null as number | null],
    TXN_SaleAmt_Big: [null as number | null],
    TXN_Net_Small: [null as number | null],
    TXN_Net_Big: [null as number | null],
    TXN_Tax_Small: [null as number | null],
    TXN_Tax_Big: [null as number | null],

    PLU_TaxType: this.formBuilder.control<string[] | null>(null),

    Source_Doc_No: [null, [Validators.maxLength(16)]],
    Voucher_No: [null],

    SAL_Type: this.formBuilder.control<string[] | null>(null),
    SYS_ORIGIN: this.formBuilder.control<string[] | null>(null),
    AssetType: this.formBuilder.control<string[] | null>(null),

    INV_Remark: [null],

    CRT_USR_No: [null],
    CRT_USR_Name: [null],
    CRT_Date_Start: [null], // ISO
    CRT_Date_End: [null],

    UPD_USR_No: [null],
    UPD_USR_Name: [null],
    UPD_Date_Start: [null],
    UPD_Date_End: [null],

    Tlt_No: [null],
    Ven_No: [null],
  });
private toSlashDateDisplay(d: any): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime?.())) return String(d ?? '');
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}
  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0'; // ✅ 使用美式格式
  }
  // 表格欄位
  columns: any[] = [
    { field: 'INV_GUIType', header: '發票格式', visible: true },
    { field: 'INV_GUITrack', header: '字軌', visible: true },
    { field: 'INV_GUINumber', header: '發票號碼', visible: true },
    { field: 'TXN_Date', header: '發票日期', visible: true },
    { field: 'INV_YM', header: '資料所屬年月', visible: true },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true },
    { field: 'Ven_No', header: '廠商編號', visible: true },
    { field: 'TXN_Uniform', header: '買受人統一編號', visible: true },
    { field: 'TXN_SaleAmt', header: '發票總金額', visible: true, format: this.moneyFormat },
    { field: 'PLU_TaxType', header: '課稅別', visible: true },
    { field: 'TXN_Net', header: '發票未稅金額', visible: true , format: this.moneyFormat},
    { field: 'TXN_Tax', header: '稅額', visible: true, format: this.moneyFormat },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'AssetType', header: '資產註記', visible: true },
    { field: 'SYS_ORIGIN', header: '系統別', visible: true },
  ];

  constructor(
    private fin13060Service: FIN13060Service,
    private counterNameService: CounterNameService,
     private fin13050Service: FIN13050Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13060', '/FIN/FIN13060CRU', this.queryForm);

    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label,
          formLabel: `${x.value} - ${x.label}`,
          value: x.value,
        })) ?? [];
    });
    this.fin13060Service.queryAPS2002DropDownList().subscribe((res) => {
    const list = res?.Data ?? [];
    this.INV_GUITypeOptions = list.map(x => ({
      value: String(x.No),
      label: String(x.Name),
    }));
  });
      this.fin13050Service.querySYS1000DropDownList('PLU_TaxType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.taxTypeOptions = list.map((x: any) => ({
        value: String(x.No), // No -> value
        label: String(x.Name), // Name -> label
      }));
    });
          this.fin13050Service.querySYS1000DropDownList('AssetType').subscribe((res) => {
      const list = res?.Data ?? [];
      this.AssetNoteOptions = list.map((x: any) => ({
        value: String(x.No), // No -> value
        label: String(x.Name), // Name -> label
      }));
    });
        this.fin13050Service
      .querySYS1000DropDownList('SYS_ORIGIN')
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.System_IDOptions = list.map((x: any) => ({
          value: String(x.No), // No -> value
          label: String(x.Name), // Name -> label
        }));
      });
  }

  // yyyy-MM-dd
  private toDateOnlyString(d?: Date | string | null): string | null {
    if (!d) return null;
    const date = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(date.getTime())) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // yyyyMM（INV_YM/INV_DeclareYM 專用；輸入可為 Date 或字串）
  private toYearMonth(d: any): string | null {
    if (!d) return null;
    if (d instanceof Date || !isNaN(new Date(d).getTime())) {
      const dt = d instanceof Date ? d : new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      return `${y}${m}`;
    }
    const digits = String(d).replace(/[^0-9]/g, '');
    return digits.length >= 6 ? digits.slice(0, 6) : null;
  }

  private normalizeString(v: any): string | null {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s === '' ? null : s;
  }

  /** 將表單值轉為後端 queryFIN13060Request（鍵名 1:1） */
  private buildPayload(form: FormGroup): any {
    const v: any = form.value;

    const payload: any = {
      PageSize: v.PageSize ?? 0,
      PageIndex: v.PageIndex ?? 0,
      SortBy: Array.isArray(v.SortBy) ? v.SortBy : [],

      INV_GUIType: Array.isArray(v.INV_GUIType) && v.INV_GUIType.length ? v.INV_GUIType : null,
      INV_GUITrack: this.normalizeString(v.INV_GUITrack),
      INV_GUINumber: this.normalizeString(v.INV_GUINumber),
      TXN_GUINo: this.normalizeString(v.TXN_GUINo),

      TXN_Date_Start: this.toDateOnlyString(v.TXN_Date_Start),
      TXN_Date_End: this.toDateOnlyString(v.TXN_Date_End),

      INV_YM: this.toYearMonth(v.INV_YM),                 // 單值 yyyyMM
      INV_DeclareYM: this.toYearMonth(v.INV_DeclareYM),   // 單值 yyyyMM

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

    // 清空空陣列為 null（保險）
    Object.keys(payload).forEach((k) => {
      const val = payload[k];
      if (Array.isArray(val) && val.length === 0) payload[k] = null;
      if (val === '') payload[k] = null;
    });

    return payload;
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = this.buildPayload(form);

    this.loading = true;
    this.messageService.blockUi();

this.fin13060Service.queryFIN13060(payload).subscribe({
  next: (res: QueryResponse<any>) => {
    const raw = res?.Data ?? [];
    // 只處理有 TXN_Date 的列
    this.data = raw.map(row => ({
      ...row,
      TXN_Date: this.toSlashDateDisplay(row?.TXN_Date),
    }));
    this.totalRecords = res?.TotalCount ?? this.data.length;
    this.queryStateService.setQueryState(this.ProgNo, payload);
  },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }
}
