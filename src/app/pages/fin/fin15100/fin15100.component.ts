import { Component } from '@angular/core';
import {
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { FIN15100Service } from '../../../service/api/fin/fin15100.service';
import { BusinessIdService } from '../../../service/basic/business-id.service';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { query } from '@angular/animations';
import { QueryYearMonthComponent } from '@shared/componentkit/query-year-month/query-year-month.component';
import { InputTextRangeComponent } from '@shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';

import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import {  computed, signal } from '@angular/core';

type TaxType = '應稅' | '零稅' | '免稅';

interface Item {
  name: string;
  qty: number;
  unitPrice: number;
  taxType: TaxType;
  taxRate: number;     // 5, 0 ...
}

@Component({
  selector: 'app-fin15100',
  templateUrl: './fin15100.component.html',
  styleUrls: ['./fin15100.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    QueryYearMonthComponent,
    ButtonComponent,
    
    TranslateModule,
    InputTextRangeComponent,
    InputTextComponent,
    
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    DecimalPipe,
    DatePipe
   
  ],
})
export class FIN15100Component extends BasicQueryPageComponent<any> {

   // 右上角單據資訊
  doc = signal({
    title: '營業人銷貨退回、進貨退出或折讓證明單',
    serialNo: '20200016001',
    date: new Date('2020-04-16'),
  });

  // 左上角公司資訊
  issuer = signal({
    taxId: '53472085',
    name: '南紡流通事業股份有限公司',
    address: '台南市東區中華東路一段366號、396號等之…',
  });

  // 貼立發票資訊
  invoice = signal({
    year: 2019,
    month: 1,
    day: 1,
    track: 'QQ',
    number: '000001',
  });

  taxTypeOptions: TaxType[] = ['應稅', '零稅', '免稅'];

  items = signal<Item[]>([
    { name: '租金', qty: 1, unitPrice: 107100, taxType: '應稅', taxRate: 5 },
  ]);

  addRow() {
    this.items.update((arr) => [
      ...arr,
      { name: '', qty: 1, unitPrice: 0, taxType: '應稅', taxRate: 5 },
    ]);
  }
  removeRow(index: number) {
    this.items.update((arr) => arr.filter((_, i) => i !== index));
  }

  // 計算欄位
  rowAmountExcl = (r: Item) => r.qty * r.unitPrice;
  rowTax = (r: Item) => (r.taxType === '應稅' ? Math.round(this.rowAmountExcl(r) * (r.taxRate / 100)) : 0);

  subtotal = computed(() =>
    this.items().reduce((acc, r) => acc + this.rowAmountExcl(r), 0)
  );
  taxTotal = computed(() =>
    this.items().reduce((acc, r) => acc + this.rowTax(r), 0)
  );
  grandTotal = computed(() => this.subtotal() + this.taxTotal());

  data: any[] = [];
  totalRecords = 0;
  selectedItems: any[] = [];
  businessIdOptions: any[] = [];

  queryForm = this.formBuilder.group({
    DeclareYM: [null, Validators.required], // 申報年月
    Business_ID: [null, Validators.required], // 稅籍編號
    TXN_Ret_NoStart: [null], // 退出/折讓單號(起)
    TXN_Ret_NoEnd: [null],   // 退出/折讓單號(迄)
    SAL_GUITrack: ['', [Validators.maxLength(2)]],//字軌
    SAL_GUINo_start: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999950)]], //發票起始號碼
    SAL_GUINo_end: [null, [Validators.maxLength(8), Validators.minLength(8), Validators.max(99999999)]], //發票結束號碼
    ...createPaginationConfig,
  });



  columns = [
    { field: 'SEQ', header: '序號', visible: true },
    { field: 'UNI_NO', header: '統一編號', visible: true },
    { field: 'BUSINESS_NAME', header: '營業人名稱', visible: true },
    { field: 'BUSINESS_ID', header: '稅籍編號', visible: true },
    { field: 'ADDRESS', header: '營業地址', visible: true },
    { field: 'INVOICE_COUNT', header: '使用發票份數', visible: true },
    { field: 'SALE_AMOUNT', header: '應稅(銷售額)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'TAX_AMOUNT', header: '應稅(稅額)', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'ZERO_RATE_AMOUNT', header: '零稅率銷售額', visible: true, style: 'text-right', format: this.moneyFormat },
    { field: 'DUTY_FREE_AMOUNT', header: '免稅銷售額', visible: true, style: 'text-right', format: this.moneyFormat },
  ];
columnGroup = [];
  constructor(
    private fin15100Service: FIN15100Service,
    private businessIdService: BusinessIdService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN15100',
      '/fin/fin15100cru',
      this.queryForm,
      () => this.onSubmit()
    );

    this.businessIdService.getBusinessIdList().subscribe((data) => {
      this.businessIdOptions = data;
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.queryForm.invalid) {
      this.messageService.warnBubble('請完整填寫查詢條件');
      return;
    }

    const formValue = this.queryForm.value;

    const payload = {
      DeclareYM: formValue.DeclareYM,
      Business_ID: formValue.Business_ID,
    };

    this.loading = true;
    this.messageService.blockUi();

    this.fin15100Service.queryFIN15100({ request: payload }).subscribe({
      next: (res) => {
        this.data = res?.Data ?? [];
        this.totalRecords = res?.TotalCount ?? this.data.length;

        this.queryStateService.setQueryState(this.ProgNo, payload);
        this.messageService.successBubble('查詢成功');
      },
      error: () => {
        this.messageService.errorBubble('查詢失敗');
      },
      complete: () => {
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }
}
