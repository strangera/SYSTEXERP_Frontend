import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { FIN15030Service, FIN15030Data, FIN15030QueryRequest } from '../../../service/api/fin/fin15030.service';
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

@Component({
  selector: 'app-fin15030',
  templateUrl: './fin15030.component.html',
  styleUrl: './fin15030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, TableComponent,
    TranslateModule, DropdownComponent
  ]
})
export class FIN15030Component extends BasicQueryPageComponent<FIN15030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    ReturnOrderNumberStart: ['', [Validators.maxLength(20)]], // 退出/折讓單號_起
    ReturnOrderNumberEnd: ['', [Validators.maxLength(20)]],   // 退出/折讓單號_迄
    InvoiceFormat: [null],                                    // 發票格式
    Character: ['', [Validators.maxLength(2)]],               // 字軌
    InvoiceNumberStart: ['', [Validators.maxLength(10)]],     // 發票號碼_起
    InvoiceNumberEnd: ['', [Validators.maxLength(10)]],       // 發票號碼_迄
    ReturnDateStart: [null],                                  // 退出/折讓日期_起
    ReturnDateEnd: [null],                                    // 退出/折讓日期_迄
    AreaType: [null],                                         // 區別
    DeclareYearMonth: [null],                                 // 申報年月
    DataYearMonthStart: [null],                               // 資料所屬年月_起
    DataYearMonthEnd: [null],                                 // 資料所屬年月_迄
    VoucherNumberStart: ['', [Validators.maxLength(20)]],     // 憑證單號_起
    VoucherNumberEnd: ['', [Validators.maxLength(20)]],       // 憑證單號_迄
    TransmissionNumberStart: ['', [Validators.maxLength(20)]],// 傳票號碼_起
    TransmissionNumberEnd: ['', [Validators.maxLength(20)]],  // 傳票號碼_迄
    PrintType: [null],                                        // 列印方式(合併/分開列印)
    SystemType: [null],                                       // 系統別
    ...createPaginationConfig([{ field: 'Sequence', order: -1 }])
  });

  totalRecords = 0;
  data: FIN15030Data[] = [];
  selectedItems: FIN15030Data[] = [];

  columns: Column[] = [
    { field: 'Sequence', header: '序號', visible: true },
    { field: 'ReturnOrderNumber', header: '退出/折讓單號', visible: true },
    { field: 'InvoiceFormat', header: '發票格式', visible: true },
    { field: 'Character', header: '字軌', visible: true },
    { field: 'InvoiceNumber', header: '發票號碼', visible: true },
    { field: 'ReturnDate', header: '退出/折讓日期', visible: true },
    { field: 'AreaType', header: '區別', visible: true },
    { field: 'DeclareYearMonth', header: '申報年月', visible: true },
    { field: 'DataYearMonth', header: '資料所屬年月', visible: true },
    { field: 'ReturnAmount', header: '退出/折讓金額', visible: true },
    { field: 'ReturnTax', header: '退出/折讓稅額', visible: true },
    { field: 'VoucherNumber', header: '憑證單號', visible: true },
    { field: 'TransmissionNumber', header: '傳票號碼', visible: true },
    { field: 'SystemType', header: '系統別', visible: true },
    { field: 'UniformNumber', header: '統一編號', visible: true }
  ];

  invoiceFormatOptions = [
    { label: '33', value: '33' },
    { label: '34', value: '34' }
  ];

  areaTypeOptions = [
    { label: '折讓', value: '折讓' },
    { label: '退出', value: '退出' }
  ];

  printTypeOptions = [
    { label: '合併列印', value: '合併列印' },
    { label: '分開列印', value: '分開列印' }
  ];

  systemTypeOptions = [
    { label: '27365925', value: '27365925' },
    { label: '53575264', value: '53575264' }
  ];

  constructor(
    private fin15030Service: FIN15030Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15030', 'fin/fin15030cru', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fin15030QueryRequest: FIN15030QueryRequest = {
      ...frm.value,
      ReturnDateStart: this.datePipe.transform(frm.get('ReturnDateStart')?.value, 'yyyy-MM-dd') ?? null,
      ReturnDateEnd: this.datePipe.transform(frm.get('ReturnDateEnd')?.value, 'yyyy-MM-dd') ?? null,
      DataYearMonthStart: this.datePipe.transform(frm.get('DataYearMonthStart')?.value, 'yyyyMM') ?? null,
      DataYearMonthEnd: this.datePipe.transform(frm.get('DataYearMonthEnd')?.value, 'yyyyMM') ?? null,
      DeclareYearMonth: this.datePipe.transform(frm.get('DeclareYearMonth')?.value, 'yyyyMM') ?? null,
    };

    this.handleSubmit(frm, () => {
      this.fin15030Service.queryFIN15030(fin15030QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }
}