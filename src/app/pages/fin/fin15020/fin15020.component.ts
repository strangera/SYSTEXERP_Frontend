import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { FIN15020Service, FIN15020Data, FIN15020QueryRequest, FIN15020PrintRequest } from '../../../service/api/fin/fin15020.service';
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
  selector: 'app-fin15020',
  templateUrl: './fin15020.component.html',
  styleUrl: './fin15020.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, TableComponent,
    TranslateModule, DropdownComponent, CalendarComponent
  ]
})
export class FIN15020Component extends BasicQueryPageComponent<FIN15020Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Ret_No_S: ['', [Validators.maxLength(10)]],             // 退出/折讓單號起 (string(10))
    TXN_Ret_No_E: ['', [Validators.maxLength(10)]],             // 退出/折讓單號訖 (string(10))
    PUR_VoucherType: [null],                                    // 發票格式 (dropdown)
    GUI_Track: ['', [Validators.maxLength(2)]],                 // 字軌 (string(2))
    PUR_GUINo_S: ['', [Validators.maxLength(8)]],               // 發票號碼起 (string(8))
    PUR_GUINo_E: ['', [Validators.maxLength(8)]],               // 發票號碼訖 (string(8))
    PUR_GUIDate_S: [null],                                      // 退出/折讓日期起 (date picker)
    PUR_GUIDate_E: [null],                                      // 退出/折讓日期訖 (date picker)
    Credit_Type: [null],                                        // 區別 (dropdown)
    PUR_RepYYYYMM: [null, [Validators.required]],               // 申報年月 (必填, date picker)
    PUR_GUIDateYYYYMM_S: [null, [Validators.required]],         // 資料所屬年月起 (必填, date picker)
    PUR_GUIDateYYYYMM_E: [null, [Validators.required]],         // 資料所屬年月訖 (必填, date picker)
    Source_Doc_No_S: ['', [Validators.maxLength(16)]],          // 憑證單號起 (string(16))
    Source_Doc_No_E: ['', [Validators.maxLength(16)]],          // 憑證單號訖 (string(16))
    Voucher_No_S: ['', [Validators.maxLength(16)]],             // 傳票號碼起 (string(16))
    Voucher_No_E: ['', [Validators.maxLength(16)]],             // 傳票號碼訖 (string(16))
    SAL_Type: [null],                                           // 系統別 (dropdown)
    ...createPaginationConfig([{ field: 'No', order: -1 }])
  });

  queryForm2 = this.formBuilder.group({
    IsMerge: [null],                                           // 列印方式 (dropdown)
    IsExcel: [null],                                          // 檔案類型 (dropdown)
  });

  totalRecords = 0;
  data: FIN15020Data[] = [];
  selectedItems: FIN15020Data[] = [];

  columns: Column[] = [
    { field: 'No', header: '序號', visible: false },
    { field: 'TXN_Ret_No', header: '退出折讓單號', visible: true },
    { field: 'PUR_VoucherType', header: '發票格式代號', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'InvoiceNo', header: '發票號碼', visible: true },
    { field: 'PUR_GUIDate', header: '退出折讓日期', visible: true, format: (value: any) => value ? this.datePipe.transform(value, 'yyyy/MM/dd') : '' },
    {
      field: 'Credit_Type', header: '區別', visible: true, format: (value: string) => this.creditTypeOptions.find(opt => opt.value === value)?.label ?? ''
    },
    { field: 'PUR_RepYYYYMM', header: '申報年月', visible: true },
    { field: 'PUR_Net', header: '退出折讓單金額', visible: true, format: (value: number) => value ? value.toLocaleString() : '0' },
    { field: 'PUR_Tax', header: '退出折讓單稅額', visible: true, format: (value: number) => value ? value.toLocaleString() : '0' },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'SAL_Type', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? '' },
    {
      field: 'PUR_DiscNo',
      header: '折抵代號',
      visible: true,
      format: (value: string) => {
        const discountOptions: { [key: string]: string } = {
          '1': '進項可扣抵之進貨及費用',
          '2': '進項可扣抵之固定資產',
          '3': '進項不可扣抵之進貨及費用',
          '4': '進項不可扣抵之固定資產'
        };
        return discountOptions[value] ?? value;
      }
    },
    { field: 'PUR_Uniform', header: '統一編號', visible: true }
  ];

  // 更新選項
  invoiceFormatOptions = [
    { value: '21', label: '進項三聯式、電子計算機統一發票' },
    { value: '22', label: '進項二聯式收銀機統一發票、載有稅額之其他憑證' },
    { value: '25', label: '進項三聯式收銀機統一發票及一般稅額計算之電子發票' },
    {
      value: '26',
      label: '彙總登錄每張稅額伍佰元以下之進項三聯式、電子計算機統一發票',
    },
    {
      value: '27',
      label:
        '彙總登錄每張稅額伍佰元以下之進項二聯式收銀機統一發票、載有稅額之其他憑證',
    },
    { value: '28', label: '進項海關代徵營業稅繳納證' },
  ];

  creditTypeOptions = [
    { label: '退出', value: '1' },
    { label: '折讓', value: '2' }
  ];

  systemTypeOptions = [
    { label: '資材管理系統', value: '1' },
    { label: '能源管理系統', value: '2' },
    { label: '客戶服務管理', value: '3' },
    { label: '應付帳款系統', value: '4' },
    { label: '應收帳款系統', value: '5' },
    { label: '預算管理系統', value: '6' },
    { label: '零用金管理系統', value: '7' },
    { label: '總帳管理系統', value: '8' },
    { label: '發票暨媒體申報系統', value: '9' },
    { label: '票據管理系統', value: '10' },
    { label: '基本資料管理系統', value: '11' },
    { label: '權限管理系統', value: '12' },
    { label: '招商暨合約系統', value: '13' },
    { label: '專櫃營運管理', value: '14' },
    { label: '決策支援管理', value: '15' },
    { label: 'POS網管系統', value: '16' },
    { label: '自營管理系統', value: '17' }
  ];

  printTypeOptions = [
    { label: '分開列印', value: '0' },
    { label: '合併列印', value: '1' }
  ];

  fileTypeOptions = [
    { label: 'PDF', value: '0' },
    { label: 'EXCEL', value: '1' }
  ];

  constructor(
    private fin15020Service: FIN15020Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15020', 'fin/fin15020qry', this.queryForm, (form) => this.onSubmit(form));
  }

  onSubmit(frm: FormGroup) {
    const fin15020QueryRequest: FIN15020QueryRequest = {
      MID: 0,                                                 // 南紡固定帶0
      STO_No: '10',                                          // 南紡固定帶'10'
      ...frm.value,
      PUR_GUIDateYYYYMM_S: this.datePipe.transform(frm.get('PUR_GUIDateYYYYMM_S')?.value, 'yyyyMM'),
      PUR_GUIDateYYYYMM_E: this.datePipe.transform(frm.get('PUR_GUIDateYYYYMM_E')?.value, 'yyyyMM'),
      PUR_RepYYYYMM: this.datePipe.transform(frm.get('PUR_RepYYYYMM')?.value, 'yyyyMM'),
    };

    this.handleSubmit(frm, () => {
      this.fin15020Service.queryFIN15020(fin15020QueryRequest)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data.APS2002_FIN15020s;
          this.totalRecords = response.Data.APS2002_FIN15020s.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  btnLoading = false;

  onExportReport() {
    if (this.queryForm.invalid) {
      // 檢查必填欄位
      const errors: string[] = [];

      if (!this.queryForm.get('PUR_RepYYYYMM')?.value) {
        errors.push('請填寫申報年月');
      }
      if (!this.queryForm.get('PUR_GUIDateYYYYMM_S')?.value) {
        errors.push('請填寫資料所屬年月_起');
      }
      if (!this.queryForm.get('PUR_GUIDateYYYYMM_E')?.value) {
        errors.push('請填寫資料所屬年月_訖');
      }

      if (errors.length > 0) {
        this.messageService.errorBubble(errors.join('<br>'));
        return;
      }
    }

    this.btnLoading = true;

    const formValue = this.queryForm.value;
    const exportRequest: FIN15020PrintRequest = {
      ...Object.fromEntries(
        Object.entries(formValue).map(([key, value]) => [key, value === null ? undefined : value])
      ),
      PUR_GUIDateYYYYMM_S: this.datePipe.transform(this.queryForm.value.PUR_GUIDateYYYYMM_S, 'yyyyMM') ?? undefined,
      PUR_GUIDateYYYYMM_E: this.datePipe.transform(this.queryForm.value.PUR_GUIDateYYYYMM_E, 'yyyyMM') ?? undefined,
      PUR_RepYYYYMM: this.datePipe.transform(this.queryForm.value.PUR_RepYYYYMM, 'yyyyMM') ?? undefined,
      IsMerge: this.queryForm2.value.IsMerge ? this.queryForm2.value.IsMerge === '1' : false,
      IsExcel: this.queryForm2.value.IsExcel ? this.queryForm2.value.IsExcel === '1' : false
    };

    this.fin15020Service.printFIN15020(exportRequest)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe(response => {
        // 處理列印回應
        console.log('列印回應:', response);
      });
  }
}