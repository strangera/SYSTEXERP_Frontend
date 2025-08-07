import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { FIN15040Service, FIN15040Data, FIN15040QueryRequest } from '../../../service/api/fin/fin15040.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CalendarComponent } from '@shared/componentkit/calendar/calendar.component';

@Component({
  selector: 'app-fin15040',
  templateUrl: './fin15040.component.html',
  styleUrl: './fin15040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, TableComponent,
    TranslateModule, DropdownComponent,
    CalendarComponent
  ]
})
export class FIN15040Component extends BasicQueryPageComponent<FIN15040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    InvoiceDateStart: [null],                                  // 發票日期_起
    InvoiceDateEnd: [null],                                    // 發票日期_迄
    InvoiceFormat: [null],                                     // 發票格式
    Character: ['', [Validators.maxLength(2)]],                // 字軌
    InvoiceNumberStart: ['', [Validators.maxLength(10)]],      // 發票號碼_起
    InvoiceNumberEnd: ['', [Validators.maxLength(10)]],        // 發票號碼_迄
    SellerUniform: ['', [Validators.maxLength(8)]],            // 廠商編號(統一編號)
    DeclareYearMonth: [null],                                  // 申報年月
    DataYearMonthStart: [null],                                // 資料所屬年月_起
    DataYearMonthEnd: [null],                                  // 資料所屬年月_迄
    TaxType: [null],                                           // 課稅別
    VoucherNumberStart: ['', [Validators.maxLength(20)]],      // 憑證單號_起
    VoucherNumberEnd: ['', [Validators.maxLength(20)]],        // 憑證單號_迄
    TransmissionNumberStart: ['', [Validators.maxLength(20)]], // 傳票號碼_起
    TransmissionNumberEnd: ['', [Validators.maxLength(20)]],   // 傳票號碼_迄
    SystemType: [null],                                        // 系統別
    AssetRemark: [''],                                         // 資產註記
    InvoiceCreator: ['', [Validators.maxLength(10)]],          // 傳票建立者
    IsUniform: [null],                                         // 是否有統一編號
    PrintType: [null],                                         // 列印方式(合併/分開列印)
    ...createPaginationConfig([{ field: 'Sequence', order: -1 }])
  });

  totalRecords = 0;
  data: FIN15040Data[] = [];
  selectedItems: FIN15040Data[] = [];

  columns: Column[] = [
    { field: 'Sequence', header: '序號', visible: true },
    { field: 'InvoiceFormat', header: '格式代號', visible: true },
    { field: 'Character', header: '字軌', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    { field: 'InvoiceDate', header: '發票日期', visible: true },
    { field: 'DataYearMonth', header: '資料所屬年月', visible: true },
    { field: 'DeclareYearMonth', header: '申報年月', visible: true },
    { field: 'BuyerUniform', header: '買受人統一編號', visible: true },
    { field: 'InvoiceAmount', header: '發票金額', visible: true },
    { field: 'InvoiceTax', header: '發票稅額', visible: true },
    { field: 'InvoiceTotal', header: '發票總金額', visible: true },
    { field: 'TaxType', header: '課稅別', visible: true },
    { field: 'VoucherNumber', header: '傳票號碼', visible: true },
    { field: 'SystemType', header: '系統別', visible: true }
  ];

  invoiceFormatOptions = [
    { value: 1, label: '21/進項三聯式、電子計算機統一發票' },
    { value: 2, label: '22/進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: 3, label: '25/進向三連式收銀機統一發票及一般稅額計算之電子發票' },
    { value: 4, label: '26/彙總登陸每張稅額五百元以下之盡項三聯式、電子計算機之統一發票' },
    { value: 5, label: '27/彙總登陸每張稅額五百元以下之盡項二聯式收銀雞統一發票、載有稅額之其他憑證' },
    { value: 6, label: '28/進項海關代徵營業稅繳納證' },
  ];

  taxTypeOptions = [
    { label: '應稅', value: '應稅' },
    { label: '免稅', value: '免稅' }
  ];

  systemTypeOptions = [
    { label: '專櫃營運管理', value: '專櫃營運管理' }
  ];

  isUniformOptions = [
    { label: '是', value: 'Y' },
    { label: '否', value: 'N' }
  ];

  printTypeOptions = [
    { label: '合併列印', value: '合併列印' },
    { label: '分開列印', value: '分開列印' }
  ];

  constructor(
    private fin15040Service: FIN15040Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15040', 'fin/fin15040qry', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fin15040QueryRequest: FIN15040QueryRequest = {
      ...frm.value,
      InvoiceDateStart: this.datePipe.transform(frm.get('InvoiceDateStart')?.value, 'yyyy-MM-dd') ?? null,
      InvoiceDateEnd: this.datePipe.transform(frm.get('InvoiceDateEnd')?.value, 'yyyy-MM-dd') ?? null,
      DataYearMonthStart: this.datePipe.transform(frm.get('DataYearMonthStart')?.value, 'yyyyMM') ?? null,
      DataYearMonthEnd: this.datePipe.transform(frm.get('DataYearMonthEnd')?.value, 'yyyyMM') ?? null,
      DeclareYearMonth: this.datePipe.transform(frm.get('DeclareYearMonth')?.value, 'yyyyMM') ?? null,
    };

    this.handleSubmit(frm, () => {
      this.fin15040Service.queryFIN15040(fin15040QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}