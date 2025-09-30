import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { FIN15010Service, FIN15010Data, FIN15010QueryRequest, FIN15010PrintRequest } from '../../../service/api/fin/fin15010.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropDownListService } from '@service/utility/dropDownList.service';

import { AccordionModule } from 'primeng/accordion';
import { TranslateModule } from '@ngx-translate/core';

import { Column, createPaginationConfig, formatAmount, formatDate } from '../../../shared/componentkit/table/table.model';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { untilDestroyed } from '@ngneat/until-destroy';
import { getSYS1000Options } from '@service/system/sys1000.service';

export interface Option {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-fin15010',
  templateUrl: './fin15010.component.html',
  styleUrl: './fin15010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, TableComponent, TranslateModule, MultiSelectComponent, DropdownComponent, CalendarComponent, TableComponent, CommonModule]
})
export class FIN15010Component extends BasicQueryPageComponent<FIN15010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PUR_GUIDate_S: [null],                                      // 發票日期_起
    PUR_GUIDate_E: [null],                                      // 發票日期_迄
    PUR_VoucherType: [null],                                    // 發票格式
    GUI_Track: [null],                                          // 字軌
    InvoiceNo_S: ['', [Validators.maxLength(8)]],               // 發票號碼_起
    InvoiceNo_E: ['', [Validators.maxLength(8)]],               // 發票號碼_迄
    PUR_RepYYYYMM: [null, [Validators.required, this.validationService.evenMonthValidator]], // 申報年月
    PUR_GUIDateYYYYMM_S: [null, [Validators.required]],         // 資料所屬年月_起
    PUR_GUIDateYYYYMM_E: [null, [Validators.required]],         // 資料所屬年月_迄
    PUR_Uniform_S: ['', [Validators.maxLength(10)]],            // 廠商統一編號_起
    PUR_Uniform_E: ['', [Validators.maxLength(10)]],            // 廠商統一編號_迄
    PUR_DiscNo: [null],                                         // 折扣代號
    PUR_Type: [null],                                           // 類別區分
    PUR_TaxType: [null],                                        // 課稅別
    Source_Doc_No_S: ['', [Validators.maxLength(16)]],          // 憑證單號_起
    Source_Doc_No_E: ['', [Validators.maxLength(16)]],          // 憑證單號_迄
    Voucher_No_S: ['', [Validators.maxLength(16)]],             // 傳票號碼_起
    Voucher_No_E: ['', [Validators.maxLength(16)]],             // 傳票號碼_迄
    CRT_USR_Name: [null],                                       // 傳票建立者
    SAL_Type: [null],                                           // 使用別
    CRT_Date_S: [null],                                         // 建立日期_起
    CRT_Date_D: [null],                                         // 建立日期_迄
    SYS_ORIGIN: [null],                                         // 系統別
    ...createPaginationConfig([])
  });

  queryForm2 = this.formBuilder.group({
    IsMerge: ['0'],  // 預設為 '0' (分開列印)
    IsExcel: ['0']   // 預設為 '0' (PDF)
  });

  totalRecords = 0;
  data: FIN15010Data[] = [];
  selectedItems: FIN15010Data[] = [];
  btnLoading = false;

  columns: Column[] = [
    { field: 'No', header: '序號', hidden: true },
    { field: 'PUR_VoucherType', header: '發票格式代號', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'InvoiceNo', header: '發票號碼', visible: true },
    { field: 'PUR_GUIDate', header: '發票日期', visible: true, format: formatDate },
    { field: 'PUR_GUIDateYYYYMM', header: '資料所屬年月', visible: true },
    { field: 'PUR_RepYYYYMM', header: '申報年月', visible: true },
    { field: 'PUR_Uniform', header: '廠商統一編號', visible: true },
    { field: 'PUR_Net', header: '發票金額', visible: true, format: formatAmount },
    { field: 'PUR_Tax', header: '發票稅額', visible: true, format: formatAmount },
    { field: 'PUR_Amt', header: '發票總金額', visible: true, format: formatAmount },
    { field: 'PLU_TaxType', header: '課稅別', visible: true, format: (value: string) => this.taxTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'SAL_Type', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? value }
  ];

  //#region 下拉選項
  // TDS1007
  invoiceFormatOptions: Option[] = [];   // 發票格式
  guiTrackOptions: Option[] = [];        // 字軌

  // SYS1000
  systemTypeOptions: Option[] = getSYS1000Options('SYS_ORIGIN');      // 系統別 (APS2002.SYS_ORIGIN, 下拉選單為SYS1000.SYS_ORIGIN)
  salTypeOptions: Option[] = getSYS1000Options('T205');               // 使用別 (APS2002.SAL_Type, 下拉選單為SYS1000.T205)
  taxTypeOptions: Option[] = getSYS1000Options('PUR_TaxType');        // 課稅別 (APS2002.PUR_TaxType, 下拉選單為SYS1000.PUR_TaxType)
  discountOptions: Option[] = getSYS1000Options('PUR_DiscNo');        // 扣抵代號 (APS2002.PUR_DiscNo, 下拉選單為SYS1000.PUR_DiscNo)
  invoiceTypeOptions: Option[] = getSYS1000Options('PUR_Type');       // 類別區分 (APS2002.PUR_Type, 下拉選單為SYS1000.PUR_Type)

  // 列印方式
  mergeOptions: Option[] = [
    { label: '分開列印', value: '0' },
    { label: '合併列印', value: '1' }
  ];
  exportOptions: Option[] = [
    { label: 'PDF', value: '0' },
    { label: 'Excel', value: '1' }
  ];
  //#endregion

  constructor(
    private fin15010Service: FIN15010Service,
    private validationService: ValidationService,
    private datePipe: DatePipe,
    private dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15010', 'fin/fin15010cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const requestData: FIN15010QueryRequest = {
        MID: 0,
        STO_No: '10',
        ...frm.value,
        PUR_GUIDate_S: this.datePipe.transform(frm.get('PUR_GUIDate_S')?.value, 'yyyy-MM-dd') ?? '',
        PUR_GUIDate_E: this.datePipe.transform(frm.get('PUR_GUIDate_E')?.value, 'yyyy-MM-dd') ?? '',
        PUR_RepYYYYMM: this.datePipe.transform(frm.get('PUR_RepYYYYMM')?.value, 'yyyyMM') ?? '',
        PUR_GUIDateYYYYMM_S: this.datePipe.transform(frm.get('PUR_GUIDateYYYYMM_S')?.value, 'yyyyMM') ?? '',
        PUR_GUIDateYYYYMM_E: this.datePipe.transform(frm.get('PUR_GUIDateYYYYMM_E')?.value, 'yyyyMM') ?? '',
        CRT_Date_S: this.datePipe.transform(frm.get('CRT_Date_S')?.value, 'yyyy-MM-dd') ?? '',
        CRT_Date_D: this.datePipe.transform(frm.get('CRT_Date_D')?.value, 'yyyy-MM-dd') ?? '',
      };

      this.fin15010Service.queryFIN15010(requestData)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe(response => {
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
        });
    });
  }

  onExportReport(frm1: FormGroup, frm2: FormGroup): void {
    if (!this.validateRequiredFields()) {
      return;
    }
    this.btnLoading = true;
    const exportRequest: FIN15010PrintRequest = {
      MID: 0,
      STO_No: '10',
      ...frm1.value,
      PUR_GUIDate_S: this.datePipe.transform(frm1.get('PUR_GUIDate_S')?.value, 'yyyy-MM-dd') ?? '',
      PUR_GUIDate_E: this.datePipe.transform(frm1.get('PUR_GUIDate_E')?.value, 'yyyy-MM-dd') ?? '',
      PUR_RepYYYYMM: this.datePipe.transform(frm1.get('PUR_RepYYYYMM')?.value, 'yyyyMM') ?? '',
      PUR_GUIDateYYYYMM_S: this.datePipe.transform(frm1.get('PUR_GUIDateYYYYMM_S')?.value, 'yyyyMM') ?? '',
      PUR_GUIDateYYYYMM_E: this.datePipe.transform(frm1.get('PUR_GUIDateYYYYMM_E')?.value, 'yyyyMM') ?? '',
      CRT_Date_S: this.datePipe.transform(frm1.get('CRT_Date_S')?.value, 'yyyy-MM-dd') ?? '',
      CRT_Date_D: this.datePipe.transform(frm1.get('CRT_Date_D')?.value, 'yyyy-MM-dd') ?? '',
      IsMerge: frm2.get('IsMerge')?.value === '1' || false,
      IsExcel: frm2.get('IsExcel')?.value === '1' || false
    };

    this.fin15010Service.printFIN15010(exportRequest)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe((response) => {
        this.openDownloadWindow(response.Data.Print_URL);
      });
  }

  private validateRequiredFields(): boolean {
    if (this.queryForm.invalid) {
      const errors: string[] = [];
      if (!this.queryForm.get('PUR_RepYYYYMM')?.value) errors.push('請填寫申報年月');
      if (!this.queryForm.get('PUR_GUIDateYYYYMM_S')?.value) errors.push('請填寫資料所屬年月_起');
      if (!this.queryForm.get('PUR_GUIDateYYYYMM_E')?.value) errors.push('請填寫資料所屬年月_訖');

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
        .filter(item => ['21', '22', '25', '26', '27', '28', '29'].includes(item.INV_GUIType))
        .sort((a, b) => a.INV_GUIType.localeCompare(b.INV_GUIType))
        .map(item => ({ label: `${item.INV_GUIType}-${item.INV_GUIName}`, value: item.INV_GUIType }));
    });
  }

  // 選完申報年月 載入字軌下拉
  loadGuiTrackOptions(event: any): void {
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: this.datePipe.transform(event, 'yyyyMM') ?? '',
      MID: 0,
      STO_No: '10',
      GUI_Type: this.queryForm.controls.PUR_VoucherType.value ?? []
    }).subscribe(r => {
      this.guiTrackOptions = r.Data.GuiTracks.map((track: string) => ({ label: track, value: track }));
    });
  }
}