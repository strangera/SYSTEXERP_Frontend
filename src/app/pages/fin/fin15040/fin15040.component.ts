import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { FIN15040Service, FIN15040QueryRequest, FIN15040PrintRequest, FIN15040Data } from '@service/api/fin/fin15040.service';
import { environment } from '../../../../environments/environment';

// Components
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropDownListService } from '@service/utility/dropDownList.service';

export interface Option {
  label: string;
  value: string | number | boolean;
}

@Component({
  selector: 'app-fin15040',
  templateUrl: './fin15040.component.html',
  styleUrl: './fin15040.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, TableComponent,
    TranslateModule, DropdownComponent, CalendarComponent
  ]
})
export class FIN15040Component extends BasicQueryPageComponent<FIN15040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date_S: [null],                                         // 發票日期起 (date picker)
    TXN_Date_E: [null],                                         // 發票日期訖 (date picker)
    PUR_VoucherType: [null],                                    // 發票格式 (dropdown)
    GUI_Track: [null],                                          // 字軌 (dropdown)
    INV_GUINumber_S: ['', [Validators.maxLength(8)]],           // 發票號碼起 (string(8))
    INV_GUINumber_E: ['', [Validators.maxLength(8)]],           // 發票號碼訖 (string(8))
    INV_YM1_S: [null],                                          // 資料所屬年月起 (date picker)
    INV_YM1_E: [null],                                          // 資料所屬年月訖 (date picker)
    INV_YM2: [null, [Validators.required]],                     // 申報年月 (必填, date picker)
    PUR_Uniform: ['', [Validators.maxLength(8)]],               // 廠商編號(統一編號) (string(8))
    PUR_TaxType: [null],                                        // 課稅別 (dropdown)
    Source_Doc_No_S: ['', [Validators.maxLength(16)]],          // 憑證單號起 (string(16))
    Source_Doc_No_E: ['', [Validators.maxLength(16)]],          // 憑證單號訖 (string(16))
    Voucher_No_S: ['', [Validators.maxLength(16)]],             // 傳票號碼起 (string(16))
    Voucher_No_E: ['', [Validators.maxLength(16)]],             // 傳票號碼訖 (string(16))
    SAL_Type: [null],                                           // 系統別 (dropdown)
    Voucher_no: ['', [Validators.maxLength(20)]],               // 傳票建立者 (string(20))
    Asset_Notation: [null],                                     // 資產註記 (dropdown)
    HasUniform: [null],                                         // 是否有統編 (dropdown)
    PUR_DiscNo: [null],                                         // 折抵代號 (dropdown)
    ...createPaginationConfig([{ field: 'No', order: -1 }])
  });

  queryForm2 = this.formBuilder.group({
    IsMerge: ['0'],  // 預設為 '0' (分開列印)
    IsExcel: ['0']   // 預設為 '0' (PDF)
  });

  totalRecords = 0;
  data: any[] = [];
  selectedItems: any[] = [];
  btnLoading = false;

  columns: Column[] = [
    { field: 'No', header: '序號', visible: false },
    { field: 'TXN_Date', header: '發票日期', visible: true, format: (value: any) => value ? this.datePipe.transform(value, 'yyyy/MM/dd') : '' },
    { field: 'PUR_VoucherType', header: '發票格式', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'INV_GUINumber', header: '發票號碼', visible: true },
    { field: 'INV_YM1', header: '資料所屬年月', visible: true },
    { field: 'INV_YM2', header: '申報年月', visible: true },
    { field: 'PUR_Uniform', header: '廠商編號(統一編號)', visible: true },
    { field: 'PUR_TaxType', header: '課稅別', visible: true, format: (value: string) => this.taxTypeOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'SAL_Type', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'Voucher_no', header: '傳票建立者', visible: true },
    { field: 'Asset_Notation', header: '資產註記', visible: true, format: (value: string) => this.assetNotationOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'HasUniform', header: '是否有統一編號', visible: true, format: (value: boolean) => value === true ? '有' : value === false ? '無' : '' },
    { field: 'PUR_DiscNo', header: '折抵代號', visible: true, format: (value: string) => this.discountOptions.find(opt => opt.value === value)?.label ?? '' }
  ];

  // 下拉選項
  invoiceFormatOptions: Option[] = [];   // 發票格式
  systemTypeOptions: Option[] = [];      // 系統別
  guiTrackOptions: Option[] = [];        // 字軌
  taxTypeOptions: Option[] = [
    { label: '應稅', value: '1' },
    { label: '零稅率', value: '2' },
    { label: '免稅', value: '3' },
    { label: '作廢及空白未使用之統一發票', value: 'D' }
  ];
  assetNotationOptions: Option[] = [
    { label: '固定資產', value: '0' },
    { label: '土地', value: '1' }
  ];
  hasUniformOptions: Option[] = [
    { label: '有', value: true },
    { label: '無', value: false }
  ];
  discountOptions: Option[] = [
    { label: '進項可扣抵之進貨及費用', value: '1' },
    { label: '進項可扣抵之固定資產', value: '2' },
    { label: '進項不可扣抵之進貨及費用', value: '3' },
    { label: '進項不可扣抵之固定資產', value: '4' }
  ];
  mergeOptions: Option[] = [
    { label: '分開列印', value: '0' },
    { label: '合併列印', value: '1' }
  ];
  exportOptions: Option[] = [
    { label: 'PDF', value: '0' },
    { label: 'Excel', value: '1' }
  ];

  constructor(
    private readonly fin15040Service: FIN15040Service,
    private readonly datePipe: DatePipe,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15040', 'fin/fin15040cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const requestData: FIN15040QueryRequest = {
        MID: 0,
        STO_No: '10',
        ...frm.value,
        TXN_Date_S: frm.get('TXN_Date_S')?.value ? this.datePipe.transform(frm.get('TXN_Date_S')?.value, 'yyyy-MM-dd') : undefined,
        TXN_Date_E: frm.get('TXN_Date_E')?.value ? this.datePipe.transform(frm.get('TXN_Date_E')?.value, 'yyyy-MM-dd') : undefined,
        INV_YM1_S: this.datePipe.transform(frm.get('INV_YM1_S')?.value, 'yyyyMM') ?? undefined,
        INV_YM1_E: this.datePipe.transform(frm.get('INV_YM1_E')?.value, 'yyyyMM') ?? undefined,
        INV_YM2: this.datePipe.transform(frm.get('INV_YM2')?.value, 'yyyyMM') ?? undefined,
      };

      this.fin15040Service.queryFIN15040(requestData)
        .pipe(finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data.POS4023_FIN15040s;
          this.totalRecords = response.Data.POS4023_FIN15040s.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  onExportReport(frm1: FormGroup, frm2: FormGroup): void {
    if (!this.validateRequiredFields()) {
      return;
    }

    this.btnLoading = true;
    const exportRequest: FIN15040PrintRequest = {
      MID: 0,
      STO_No: '10',
      ...frm1.value,
      TXN_Date_S: frm1.get('TXN_Date_S')?.value ? this.datePipe.transform(frm1.get('TXN_Date_S')?.value, 'yyyy-MM-dd') : undefined,
      TXN_Date_E: frm1.get('TXN_Date_E')?.value ? this.datePipe.transform(frm1.get('TXN_Date_E')?.value, 'yyyy-MM-dd') : undefined,
      INV_YM1_S: this.datePipe.transform(frm1.get('INV_YM1_S')?.value, 'yyyyMM') ?? undefined,
      INV_YM1_E: this.datePipe.transform(frm1.get('INV_YM1_E')?.value, 'yyyyMM') ?? undefined,
      INV_YM2: this.datePipe.transform(frm1.get('INV_YM2')?.value, 'yyyyMM') ?? undefined,
      IsMerge: frm2.get('IsMerge')?.value === '1' || false,
      IsExcel: frm2.get('IsExcel')?.value === '1' || false
    };

    this.fin15040Service.printFIN15040(exportRequest)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.openDownloadWindow(response.Data.Print_URL);
          } else {
            this.messageService.errorBubble('產生報表失敗');
          }
        },
        error: (error) => {
          console.error('列印報表錯誤:', error);
          this.messageService.errorBubble('產生報表時發生錯誤');
        }
      });
  }

  private validateRequiredFields(): boolean {
    if (this.queryForm.invalid) {
      const errors: string[] = [];
      if (!this.queryForm.get('INV_YM2')?.value) errors.push('請填寫申報年月');
      if (errors.length > 0) {
        this.messageService.errorBubble(errors.join('<br>'));
        return false;
      }
    }
    return true;
  }

  // FIXME: 這個回傳網址跟 fin15020 fin15030不一樣
  private openDownloadWindow(printUrl: string): void {
    const downloadUrl = `${environment.ApiUrl}/temp/${printUrl}`;
    window.open(downloadUrl, '_blank');
  }

  private loadDropdownOptions(): void {
    // 發票格式
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).subscribe(r => {
      this.invoiceFormatOptions = r.Data.INV_GUITypes.map(item => ({ label: item.INV_GUIName, value: item.INV_GUIType }));
    });
    // 系統別
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'T207' }).subscribe(r => {
      this.systemTypeOptions = r.Data.map(item => ({ label: item.Name, value: item.No }));
    });
    // 其餘下拉選項如有API請依需求補上
  }

  // 申報年月改變時載入字軌
  loadGuiTrackOptions(event: any): void {
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: this.datePipe.transform(event, 'yyyyMM') ?? '',
      MID: 0,
      STO_No: '10',
      GUI_Type: this.queryForm.controls.PUR_VoucherType.value ?? ''
    }).subscribe(r => {
      this.guiTrackOptions = r.Data[0]?.GuiTracks?.map((track: string) => ({ label: track, value: track })) ?? [];
    });
  }
}