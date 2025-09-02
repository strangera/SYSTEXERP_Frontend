import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FIN13060Service } from '../../../service/api/fin/fin13060.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { QueryYearMonthComponent } from '../../../shared/componentkit/query-year-month/query-year-month.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CounterNameService } from '../../../service/basic/counter-name.service';

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
    InputTextRangeComponent,
    CalendarRangeComponent,
    DropdownComponent,
    QueryYearMonthComponent,
    TableComponent,
    MultiSelectComponent,
    TranslateModule,
  ],
  templateUrl: './fin13060.component.html',
  styleUrls: ['./fin13060.component.scss'],
})
export class FIN13060Component extends BasicQueryPageComponent<any> {
  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];

  // 下拉選單
  invoicePurposeOptions = [
    { label: '營業用', value: '營業用' },
    { label: '共同使用', value: '共同使用' },
  ];

  deductOptions = [
    { label: '代表進項可扣抵之進貨及費用', value: 'A' },
    { label: '代表進項可扣抵之固定資產', value: 'B' },
    { label: '代表進項不可扣抵之進貨及費用', value: 'C' },
    { label: '代表進項不可扣抵之固定資產', value: 'D' },
  ];
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
  taxRateOptions = [
    { label: '應稅', value: '1' },
    { label: '零稅率', value: '2' },
    { label: '免稅', value: '3' },
  ];

  typeOptions = [
    { label: '進貨及費用', value: 'E' },
    { label: '固定資產', value: 'F' },
  ];
  taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
    { label: '內含稅', value: '3' },
    { label: '作廢或是空白', value: '4' },
  ];
  CounterOptions: any[] = []; // 專櫃選項

  System_IDOptions = [
    { label: 'APP服務', value: '0' },
    { label: '出庫系統設定', value: '9' },
    { label: 'EIP模組', value: 'E' },
    { label: '權限管理系統', value: 'Z' },
    { label: '決策支援管理-營運管理及銷售分析', value: '1' },
    { label: '商品管理系統', value: '2' },
    { label: '進銷存管理系統', value: '3' },
    { label: '帳務管理系統', value: '4' },
    { label: 'POS銷售管理系統', value: '5' },
    { label: '客服管理系統', value: '6' },
    { label: '物流管理系統', value: '7' },
    { label: '材料試驗管理系統', value: 'A' },
    { label: '模具管理系統', value: 'B' },
    { label: '會計管理系統', value: 'C' },
    { label: '財務管理系統', value: 'D' },
    { label: '人事薪資管理系統', value: 'F' },
    { label: '差勤管理系統', value: 'G' },
    { label: '門禁管理系統', value: 'H' },
    { label: '訓練管理系統', value: 'I' },
    { label: '績效管理系統', value: 'J' },
    { label: '薪資作業系統', value: 'K' },
    { label: '專案管理系統', value: 'L' },
    { label: '能源管理系統', value: 'M' },
    { label: '設備管理系統', value: 'N' },
    { label: '生產管理系統', value: 'O' },
    { label: '製令管理系統', value: 'P' },
    { label: '製程管理系統', value: 'Q' },
    { label: '品管管理系統', value: 'R' },
    { label: '自動倉儲系統', value: 'S' },
    { label: '製鞋管理系統', value: 'V' },
    { label: '自營管理系統', value: 'W' },
  ];

  AssetNoteOptions = [
    { label: '固定資產', value: '0' },
    { label: '土地', value: '1' },
  ];

  queryForm = this.formBuilder.group({
    PUR_VoucherType: [], // 發票格式
    GUI_Track: [], // 字軌
    PUR_GUINoStart: [], // 發票號碼 起
    PUR_GUINoEnd: [], // 發票號碼 迄
    GUI_DateStart: [], // 發票日期 起
    GUI_DateEnd: [], // 發票日期 迄
    Rep_YYYYMM: [], // 資料所屬年月
    Apply_YYYYMM: [], // 申報年月
    UniCode: [], // 廠商編號(統一編號)
    AmountStart: [], // 發票總金額 起
    AmountEnd: [], // 發票總金額 迄
    TaxExcludedStart: [], // 發票未稅金額 起
    TaxExcludedEnd: [], // 發票未稅金額 迄
    Invoice_Purpose: [], // 發票用途
    Deduct_Flag: [], // 扣抵代號
    Category: [], // 類別區分
    Voucher_NoStart: [], // 傳票號碼
    Voucher_NoEnd: [],
    SerialStart: [], // 彙總張數 起
    SerialEnd: [], // 彙總張數 迄
    Note: [], // 彙加註記
    System_ID: [], // 系統別
    Create_User: [], // 建檔人員
    Create_DateStart: [], // 建檔日期 起
    Create_DateEnd: [], // 建檔日期 迄
    Update_User: [], // 修改人員
    Update_DateStart: [], // 修改日期 起
    Update_DateEnd: [], // 修改日期 迄
    TLT_No: [],
    TaxStart: [],
    TaxEnd: [],
    PUR_TaxType: [],
    Source_Doc_NoStart: [],
    Source_Doc_NoEnd: [],
    remark: [],
    VendorCode: [],
    SellerUniCode: [],
    BuyerUniCode: [],
    AssetNote: [],

    ...createPaginationConfig([{ field: 'Rep_YYYYMM', order: 1 }]),
  });

  columns: any[] = [
    { field: 'Voucher_Type', header: '發票格式', visible: true },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'GUI_Number', header: '發票號碼', visible: true },
    { field: 'GUI_Date', header: '發票日期', visible: true },
    { field: 'Rep_YYYYMM', header: '資料所屬年月', visible: true },
    { field: 'Apply_YYYYMM', header: '申報年月', visible: true },
    { field: 'Vendor_Customer_Code', header: '廠客代號', visible: true }, // ✅ 廠客代號
    { field: 'Buyer_UniCode', header: '買受人統一編號', visible: true },
    { field: 'Amount', header: '發票總金額', visible: true },
    { field: 'TaxRate', header: '課稅別', visible: true },
    { field: 'TaxExcluded', header: '發票未稅金額', visible: true }, // ✅ 正確命名
    { field: 'Tax', header: '稅額', visible: true },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true }, // ✅ 憑證單號
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'Asset_Note', header: '資產註記', visible: true },
    { field: 'System_ID', header: '系統別', visible: true },
  ];

  constructor(
    private fin13060Service: FIN13060Service,
    private counterNameService: CounterNameService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN13060', '/FIN/FIN13060CRU', this.queryForm);
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions =
        res?.map((x: any) => ({
          label: x.label, // 給 table 用
          formLabel: `${x.value} - ${x.label}`, // 給下拉選單用
          value: x.value,
        })) || [];
    });
  }

  onSubmit(form: FormGroup): void {
    this.submitted = true;
    if (form.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const payload = { ...form.value };
    for (const key in payload) {
      if (typeof payload[key] === 'string') {
        payload[key] = payload[key].trim();
        if (payload[key] === '') payload[key] = null;
      }
    }

    this.loading = true;
    this.messageService.blockUi();

    this.fin13060Service.queryFIN13060(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;
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

  onClearForm(): void {
    this.queryForm.reset();
  }
}
