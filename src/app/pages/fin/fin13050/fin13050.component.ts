import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

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
    InputTextRangeComponent,
    CalendarRangeComponent,
    DropdownComponent,
    QueryYearMonthComponent,
    TableComponent,
    MultiSelectComponent,
    TranslateModule,
  ],
  templateUrl: './fin13050.component.html',
  styleUrls: ['./fin13050.component.scss'],
})
export class FIN13050Component extends BasicQueryPageComponent<any> {
  totalRecords = 0;
  data: any[] = [];

  // 下拉/多選選項（沿用你原本的）
  PUR_VoucherTypeOptions: any[] = [
    {
      value: '23',
      label: '三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單',
    },
    {
      value: '24',
      label: '二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單',
    },
  ];

  // 發票用途 -> 對應後端 PUR_DirectType
  directTypeOptions = [
    { label: '營業用', value: '1' },
    { label: '共同使用', value: '2' },
  ];

  // 課稅別 -> 後端 PUR_TaxType（單值；多選我幫你以逗號字串送出）
  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
    { label: '內含稅', value: '3' },
    { label: '作廢或是空白', value: '4' },
  ];

  // 類別區分 -> 對應後端 PUR_Type（若需多選，同樣以逗號字串送出）
  typeOptions = [
    { label: '進貨及費用', value: 'E' },
    { label: '固定資產', value: 'F' },
  ];
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
    PUR_GUITrack: [], // 字軌
    PUR_GUINoStart: [], // 發票號碼（前端區間 -> 後端只有單值，會在送出時合併）
    PUR_GUINoEnd: [],

    PUR_GUIDate_Start: [], // 發票日期 起
    PUR_GUIDate_End: [], // 發票日期 迄
    PUR_GUIDate_YYYYMM: [], // 發票日期(年月)；若你不用可不填

    PUR_RepYYYYMM: [], // 資料所屬年月
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

    Source_Doc_No: [], // 憑證單號（若前端使用這個，會直送）
    Voucher_No: [], // 傳票號碼
    SAL_Type: [], // 銷售類型（若不用可留空）
    PUR_Remark: [], // 備註

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
    { field: 'PUR_DirectType', header: '發票用途', visible: true },
    { field: 'PUR_TaxType', header: '課稅別', visible: true },
    { field: 'PUR_DiscNo', header: '折讓/扣抵號', visible: true },
    { field: 'PUR_Type', header: '類別區分', visible: true },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'SAL_Type', header: '銷售類型', visible: true },
    { field: 'PUR_Remark', header: '備註', visible: true },
  ];

  constructor(private fin13050Service: FIN13050Service) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13050', '/fin/FIN13050cru', this.queryForm);
  }

  // 多選=>逗號字串；單值維持
  private toCsv(value: any): string | undefined {
    if (Array.isArray(value)) return value.length ? value.join(',') : undefined;
    if (value === null || value === undefined || value === '') return undefined;
    return String(value);
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
      SortBy:
        v.SortBy && v.SortBy.length
          ? v.SortBy
          : [{ field: 'PUR_RepYYYYMM', order: 1 }],

      PUR_VoucherType: this.toCsv(v.PUR_VoucherType),
      PUR_GUITrack: this.toCsv(v.PUR_GUITrack),
      PUR_GUINo: this.composeGUINo(v.PUR_GUINoStart, v.PUR_GUINoEnd),

      PUR_GUIDate_Start: v.PUR_GUIDate_Start || undefined,
      PUR_GUIDate_End: v.PUR_GUIDate_End || undefined,
      PUR_GUIDate_YYYYMM: this.toCsv(v.PUR_GUIDate_YYYYMM),

      PUR_RepYYYYMM: this.toCsv(v.PUR_RepYYYYMM),
      PUR_VenUniform: this.toCsv(v.PUR_VenUniform),

      PUR_Amt_Small: v.PUR_Amt_Small ?? undefined,
      PUR_Amt_Big: v.PUR_Amt_Big ?? undefined,
      PUR_Net_Small: v.PUR_Net_Small ?? undefined,
      PUR_Net_Big: v.PUR_Net_Big ?? undefined,
      PUR_Tax_Small: v.PUR_Tax_Small ?? undefined,
      PUR_Tax_Big: v.PUR_Tax_Big ?? undefined,

      PUR_DirectType: this.toCsv(v.PUR_DirectType),
      PUR_TaxType: this.toCsv(v.PUR_TaxType),
      PUR_DiscNo: this.toCsv(v.PUR_DiscNo),
      PUR_Type: this.toCsv(v.PUR_Type),

      Source_Doc_No: this.toCsv(v.Source_Doc_No),
      Voucher_No: this.toCsv(v.Voucher_No),
      SAL_Type: this.toCsv(v.SAL_Type),
      PUR_Remark: this.toCsv(v.PUR_Remark),

      CRT_USR_Name: this.toCsv(v.CRT_USR_Name),
      CRT_Date_Start: v.CRT_Date_Start || undefined,
      CRT_Date_End: v.CRT_Date_End || undefined,
      UPD_USR_Name: this.toCsv(v.UPD_USR_Name),
      UPD_Date_Start: v.UPD_Date_Start || undefined,
      UPD_Date_End: v.UPD_Date_End || undefined,
    };

    // 清空空字串與 null
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '' || payload[k] === null) payload[k] = undefined;
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
          const raw = res?.Data ?? [];
          this.data = raw.map((r: any) => ({
            ...r,
            _rowKey: this.makeRowKey(r),
          }));
          this.totalRecords = res?.TotalCount ?? this.data.length ?? 0;

          // 同步保存查詢狀態（可選）
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
}
