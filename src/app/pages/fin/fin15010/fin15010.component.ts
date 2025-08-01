import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { FIN15010Service, FIN15010Data, FIN15010QueryRequest } from '../../../service/api/fin/fin15010.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';

import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';

import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';

@Component({
  selector: 'app-fin15010',
  templateUrl: './fin15010.component.html',
  styleUrl: './fin15010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, InputNumberRangeComponent, TableComponent, TranslateModule, MultiSelectComponent, DropdownComponent]
})
export class FIN15010Component extends BasicQueryPageComponent<FIN15010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    InvoiceDateStart: [null], // 發票日期_起
    InvoiceDateEnd: [null], // 發票日期_迄
    FormatCode: [null], // 發票格式 (多選)
    Character: [null, [Validators.maxLength(2)]], // 字軌
    InvoiceNumberStart: ['', [Validators.maxLength(10)]], // 發票號碼_起
    InvoiceNumberEnd: ['', [Validators.maxLength(10)]], // 發票號碼_迄
    DataYearMonthStart: [null], // 資料所屬年月_起
    DataYearMonthEnd: [null], // 資料所屬年月_迄
    DeclareYearMonthStart: [null], // 申報年月_起
    DeclareYearMonthEnd: [null], // 申報年月_迄
    SellerUniformStart: ['', [Validators.maxLength(10)]], // 廠商統一編號
    SellerUniformEnd: ['', [Validators.maxLength(10)]], // 廠商統一編號
    InvoiceType: [null], // 類別區分 (多選)
    PrintType: [null], // 列印方式
    BuyerUniform: ['', [Validators.maxLength(10)]], // 客戶編號(統一編號)
    InvoiceUsage: [null], // 發票使用別
    CarrierType: ['', [Validators.maxLength(10)]], // 傳票類立者
    CarrierNumberStart: ['', [Validators.maxLength(10)]], // 傳票號碼_起
    CarrierNumberEnd: ['', [Validators.maxLength(10)]], // 傳票號碼_迄
    BuildDateStart: [null], // 建立日期_起
    BuildDateEnd: [null], // 建立日期_迄
    SystemType: ['', [Validators.maxLength(10)]], // 系統別
    TaxType: [null], // 課稅別 (多選)
    DeductionCode: [null, [Validators.maxLength(10)]], // 扣抵代碼
    CertNumberStart: ['', [Validators.maxLength(20)]], // 憑證號碼_起
    CertNumberEnd: ['', [Validators.maxLength(20)]], // 憑證號碼_迄
    ...createPaginationConfig([{ field: 'Sequence', order: -1 }])
  });

  totalRecords = 0;
  data: FIN15010Data[] = [];
  selectedItems: FIN15010Data[] = [];

  columns: Column[] = [
    { field: 'Sequence', header: '序號', visible: true },
    { field: 'FormatCode', header: '發票格式', visible: true },
    { field: 'Character', header: '字軌', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true },
    { field: 'DataYearMonth', header: '資料所屬年月', visible: true },
    { field: 'DeclareYearMonth', header: '申報年月', visible: true },
    { field: 'SellerUniform', header: '廠商編號(統一編號)', visible: true },
    { field: 'BuyerUniform', header: '客戶編號(統一編號)', visible: true },
    { field: 'InvoiceAmount', header: '發票金額', visible: true },
    { field: 'InvoiceTax', header: '發票稅額', visible: true },
    { field: 'DeductionAmount', header: '應稅總金額', visible: true },
    { field: 'InvoiceType', header: '類別區分', visible: true },
    { field: 'InvoiceUsage', header: '發票使用別', visible: true },
    { field: 'CarrierType', header: '傳票類立者', visible: true },
    { field: 'CarrierNumber', header: '傳票號碼', visible: true },
    { field: 'BuildDate', header: '建立日期', visible: true },
    { field: 'PrintType', header: '列印方式', visible: true },
    { field: 'SystemType', header: '系統別', visible: true }
  ];

  //#region 下拉選單選項
  formatCodeOptions = [
    { label: 'A01', value: 'A01' },
    { label: 'A02', value: 'A02' }
  ];

  invoiceTypeOptions = [
    { value: 1, label: '二聯式收銀機發票' },
    { value: 2, label: '二聯式手開' },
    { value: 3, label: '三聯式手開' },
    { value: 4, label: '二聯式電子發票' },
    { value: 5, label: '電子-丁種字軌' },
  ];

  invoiceUsageOptions = [
    { label: '1.自用', value: '1' },
    { label: '2.外銷', value: '2' }
  ];

  printTypeOptions = [
    { label: '合併列印', value: '1' },
    { label: '分開列印', value: '2' }
  ];

  taxTypeOptions = [
    { label: '應稅', value: '1' },
    { label: '零稅率', value: '2' },
    { label: '免稅', value: '3' }
  ];
  //#endregion

  constructor(
    private fin15010Service: FIN15010Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15010', 'fin/fin15010cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fin15010QueryRequest: FIN15010QueryRequest = {
      ...frm.value,
      // 日期格式轉換
      DataYearMonthStart: this.datePipe.transform(frm.get('DataYearMonthStart')?.value, 'yyyyMM') ?? null,
      DataYearMonthEnd: this.datePipe.transform(frm.get('DataYearMonthEnd')?.value, 'yyyyMM') ?? null,
      DeclareYearMonthStart: this.datePipe.transform(frm.get('DeclareYearMonthStart')?.value, 'yyyyMM') ?? null,
      DeclareYearMonthEnd: this.datePipe.transform(frm.get('DeclareYearMonthEnd')?.value, 'yyyyMM') ?? null,
    };

    this.handleSubmit(frm, () => {
      this.fin15010Service.queryFIN15010(fin15010QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}