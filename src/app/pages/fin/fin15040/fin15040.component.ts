import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
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
import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { ValidationService } from '@shared/service/validation.service';

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
    TranslateModule, DropdownComponent, CalendarComponent, CommonModule
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
    INV_YM2: [null, [Validators.required, this.validationService.evenMonthValidator]],                     // 申報年月 (必填, date picker)
    PUR_Uniform: ['', [Validators.maxLength(8)]],               // 統一編號 (string(8))
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
  data: FIN15040Data[] = [];
  selectedItems: FIN15040Data[] = [];
  btnLoading = false;

  columns: Column[] = [
    { field: 'INV_GUIType', header: '發票格式', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'INV_GUITrack', header: '字軌', visible: true },
    { field: 'INV_GUINumber', header: '發票號碼', visible: true },
    { field: 'TXN_Date', header: '發票日期', visible: true, format: (value: any) => value ? this.datePipe.transform(value, 'yyyy/MM/dd') : '' },
    { field: 'INV_YM1', header: '資料所屬年月', visible: true },
    { field: 'INV_YM2', header: '申報年月', visible: true },
    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_Net', header: '發票金額', visible: true, format: (value: number) => value ? value.toLocaleString() : '0' },
    { field: 'TXN_Tax', header: '發票稅額', visible: true, format: (value: number) => value ? value.toLocaleString() : '0' },
    { field: 'TXN_SaleAmt', header: '發票總金額', visible: true, format: (value: number) => value ? value.toLocaleString() : '0' },
    { field: 'PLU_TaxType', header: '課稅別', visible: true, format: (value: string) => this.taxTypeOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'SAL_Type', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? '' }
  ];

  // 下拉選項
  invoiceFormatOptions: Option[] = [];   // 發票格式
  taxTypeOptions = getSYS1000Options('PUR_TaxType');       // 課稅別
  systemTypeOptions = getSYS1000Options('T205');           // 系統別
  assetNotationOptions = getSYS1000Options('AssetType');   // 資產註記
  guiTrackOptions: Option[] = [];        // 字軌
  hasUniformOptions: Option[] = [
    { label: '有', value: true },
    { label: '無', value: false }
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
    private readonly dropDownListService: DropDownListService,
    private readonly validationService: ValidationService
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
        TXN_Date_S: frm.get('TXN_Date_S')?.value ? this.datePipe.transform(frm.get('TXN_Date_S')?.value, 'yyyy-MM-dd') ?? '' : '',
        TXN_Date_E: frm.get('TXN_Date_E')?.value ? this.datePipe.transform(frm.get('TXN_Date_E')?.value, 'yyyy-MM-dd') ?? '' : '',
        INV_YM1_S: this.datePipe.transform(frm.get('INV_YM1_S')?.value, 'yyyyMM') ?? '',
        INV_YM1_E: this.datePipe.transform(frm.get('INV_YM1_E')?.value, 'yyyyMM') ?? '',
        INV_YM2: this.datePipe.transform(frm.get('INV_YM2')?.value, 'yyyyMM') ?? '',
      };

      this.fin15040Service.queryFIN15040(requestData)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe((res) => {
          this.data = res.Data;
          this.totalRecords = res.TotalCount;
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
      TXN_Date_S: frm1.get('TXN_Date_S')?.value ? this.datePipe.transform(frm1.get('TXN_Date_S')?.value, 'yyyy-MM-dd') ?? '' : '',
      TXN_Date_E: frm1.get('TXN_Date_E')?.value ? this.datePipe.transform(frm1.get('TXN_Date_E')?.value, 'yyyy-MM-dd') ?? '' : '',
      INV_YM1_S: this.datePipe.transform(frm1.get('INV_YM1_S')?.value, 'yyyyMM') ?? '',
      INV_YM1_E: this.datePipe.transform(frm1.get('INV_YM1_E')?.value, 'yyyyMM') ?? '',
      INV_YM2: this.datePipe.transform(frm1.get('INV_YM2')?.value, 'yyyyMM') ?? '',
      IsMerge: frm2.get('IsMerge')?.value === '1' || false,
      IsExcel: frm2.get('IsExcel')?.value === '1' || false
    };

    this.fin15040Service.printFIN15040(exportRequest)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe((response) => {
        this.openDownloadWindow(response.Data.Print_URL);
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

  private openDownloadWindow(printUrl: string): void {
    const downloadUrl = `${environment.ApiUrl}${printUrl}`;
    window.open(downloadUrl, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
  }

  private loadDropdownOptions(): void {
    // 發票格式
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).subscribe(r => {
      this.invoiceFormatOptions = r.Data.INV_GUITypes
        .filter(item => item.INV_GUIType >= '31' && item.INV_GUIType <= '38')
        .map(item => ({ label: item.INV_GUIName, value: item.INV_GUIType }))
    });
  }

  // 申報年月改變時載入字軌
  loadGuiTrackOptions(event: any): void {
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: this.datePipe.transform(event, 'yyyyMM') ?? '',
      MID: 0,
      STO_No: '10',
      GUI_Type: this.queryForm.controls.PUR_VoucherType.value ?? ''
    }).subscribe(r => {
      this.guiTrackOptions = r.Data.GuiTracks.map((track: string) => ({ label: track, value: track })) ?? [];
    });
  }
}