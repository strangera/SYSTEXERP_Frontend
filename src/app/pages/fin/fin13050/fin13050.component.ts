import { Component } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FIN13050Service } from '../../../service/api/fin/fin13050.service';
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
    TranslateModule
  ],
  templateUrl: './fin13050.component.html',
  styleUrls: ['./fin13050.component.scss'],
})
export class FIN13050Component extends BasicQueryPageComponent<any> {
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
    { value: '23', label: '三聯式、電子計算機及三聯式收銀機統一發票之進貨退出或折讓證明單' },
    { value: '24', label: '二聯式收銀機統一發票及載有稅額之其他憑證之進貨退出或折讓證明單' },
  ];
  taxRateOptions = [
    { label: '應稅', value: '1' },
    { label: '零稅率', value: '2' },
    { label: '免稅', value: '3' }
  ];

  typeOptions = [
    { label: '進貨及費用', value: 'E' },
    { label: '固定資產', value: 'F' }
  ];
    taxTypeOptions = [
    { label: '免稅', value: '0' },
    { label: '應稅', value: '1' },
    { label: '零稅', value: '2' },
  ];

queryForm = this.formBuilder.group({
  PUR_VoucherType: [],              // 發票格式
  GUI_Track: [],                 // 字軌
  PUR_GUINoStart: [],          // 發票號碼 起
  PUR_GUINoEnd: [],            // 發票號碼 迄
  GUI_DateStart: [],            // 發票日期 起
  GUI_DateEnd: [],              // 發票日期 迄
  Rep_YYYYMM: [],               // 資料所屬年月
  Apply_YYYYMM: [],             // 申報年月
  UniCode: [],                  // 廠商編號(統一編號)
  AmountStart: [],              // 發票總金額 起
  AmountEnd: [],                // 發票總金額 迄
  TaxExcludedStart: [],         // 發票未稅金額 起
  TaxExcludedEnd: [],           // 發票未稅金額 迄
  Invoice_Purpose: [],          // 發票用途
  Deduct_Flag: [],              // 扣抵代號
  Category: [],                 // 類別區分
  Voucher_NoStart: [],               // 傳票號碼
  Voucher_NoEnd:[],
  SerialStart: [],              // 彙總張數 起
  SerialEnd: [],                // 彙總張數 迄
  Note: [],                     // 彙加註記
  System_ID: [],                // 系統別
  Create_User: [],              // 建檔人員
  Create_DateStart: [],         // 建檔日期 起
  Create_DateEnd: [],           // 建檔日期 迄
  Update_User: [],              // 修改人員
  Update_DateStart: [],         // 修改日期 起
  Update_DateEnd: [],           // 修改日期 迄
  
  TaxStart: [],    
  TaxEnd: [],   
  PUR_TaxType: [], 
  Source_Doc_NoStart:[],
  Source_Doc_NoEnd:[],
  remark:[],

  ...createPaginationConfig([{ field: 'Rep_YYYYMM', order: 1 }])
});


  columns: any[] = [
    { field: 'Voucher_Type', header: '發票格式', visible: true },
    { field: 'GUI_Number', header: '發票號碼', visible: true },
    { field: 'Rep_YYYYMM', header: '資料所屬年月', visible: true },
    { field: 'Apply_YYYYMM', header: '申報年月', visible: true },
    { field: 'UniCode', header: '統一編號', visible: true },
    { field: 'Amount', header: '發票總金額', visible: true },
    { field: 'Tax', header: '發票稅額', visible: true },
    { field: 'Invoice_Purpose', header: '發票用途', visible: true },
    { field: 'TaxRate', header: '課稅別', visible: true },
    { field: 'Deduct_Flag', header: '扣抵代號', visible: true },
    { field: 'Category', header: '類別區分', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'Serial', header: '彙總張數', visible: true },
    { field: 'Note', header: '備註', visible: true }
  ];

  constructor(private fin13050Service: FIN13050Service) {
    super();

  }

  ngOnInit(): void {
    this.initializePage('FIN13050', '/FIN/FIN13050CRU', this.queryForm);
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

    this.fin13050Service.queryFIN13050(payload).subscribe({
      next: (res) => {
        this.data = res.Data || [];
        this.totalRecords = res.TotalCount || this.data.length;
        this.queryStateService.setQueryState(this.ProgNo, payload);
        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢錯誤');
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      }
    });
  }

  onClearForm(): void {
    this.queryForm.reset();
  }
}
