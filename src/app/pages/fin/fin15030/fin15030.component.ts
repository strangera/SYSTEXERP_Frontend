import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { createPaginationConfig, Column } from '../../../shared/componentkit/table/table.model';
import { FIN15030Data, FIN15030Service, FIN15030QueryRequest, FIN15030PrintRequest } from '@service/api/fin/fin15030.service';
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
  value: string | number;
}

@Component({
  selector: 'app-fin15030',
  templateUrl: './fin15030.component.html',
  styleUrl: './fin15030.component.scss',
  standalone: true,
  imports: [
    MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule,
    InputTextRangeComponent, CalendarRangeComponent, InputTextComponent, TableComponent,
    TranslateModule, DropdownComponent, CalendarComponent, CommonModule
  ]
})
export class FIN15030Component extends BasicQueryPageComponent<FIN15030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_Remark_S: ['', [Validators.maxLength(20)]],             // 退出/折讓單號起 (string(20))
    INV_Remark_E: ['', [Validators.maxLength(20)]],             // 退出/折讓單號訖 (string(20))
    INV_GUIType: [null],                                        // 發票格式 (dropdown)
    GUI_Track: [null],                                          // 字軌 (string(2))
    TXN_GUINo_S: ['', [Validators.maxLength(8)]],               // 發票號碼起 (string(8))
    TXN_GUINo_E: ['', [Validators.maxLength(8)]],               // 發票號碼訖 (string(8))
    TXN_Date_S: [null],                                         // 退出/折讓日期起 (date picker)
    TXN_Date_E: [null],                                         // 退出/折讓日期訖 (date picker)
    Credit_Type: [null],                                        // 區別 (dropdown)
    INV_YM: [null, [Validators.required]],                      // 申報年月 (必填, date picker)
    INV_Data_YM_S: [null],                                      // 資料所屬年月起 (date picker)
    INV_Data_YM_E: [null],                                      // 資料所屬年月訖 (date picker)
    Source_Doc_No_S: ['', [Validators.maxLength(16)]],          // 憑證單號起 (string(16))
    Source_Doc_No_E: ['', [Validators.maxLength(16)]],          // 憑證單號訖 (string(16))
    Voucher_No_S: ['', [Validators.maxLength(16)]],             // 傳票編號起 (string(16))
    Voucher_No_E: ['', [Validators.maxLength(16)]],             // 傳票編號訖 (string(16))
    SAL_Type: [null],                                           // 系統別 (dropdown)
    ...createPaginationConfig([{ field: 'No', order: -1 }])
  });

  queryForm2 = this.formBuilder.group({
    IsMerge: ['0'],  // 預設為 '0' (分開列印)
    IsExcel: ['0']   // 預設為 '0' (PDF)
  });

  totalRecords = 0;
  data: FIN15030Data[] = [];
  selectedItems: FIN15030Data[] = [];
  btnLoading = false;

  columns: Column[] = [
    { field: 'No', header: '序號', visible: false },
    { field: 'INV_Remark', header: '退出折讓單號', visible: true },
    { field: 'INV_GUIType', header: '格式代號', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_Date', header: '退出折讓日期', visible: true, format: (value: any) => value ? this.datePipe.transform(value, 'yyyy/MM/dd') : '' },
    {
      field: 'Credit_Type', header: '區別', visible: true, format: (value: string) => this.creditTypeOptions.find(opt => opt.value === value)?.label ?? ''
    },
    { field: 'INV_YM', header: '申報年月', visible: true },
    { field: 'TXN_Net', header: '退出折讓單金額', visible: true, format: (value: number) => value ? value.toLocaleString() : '0' },
    { field: 'TXN_Tax', header: '退出折讓單稅額', visible: true, format: (value: number) => value ? value.toLocaleString() : '0' },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票編號', visible: true },
    { field: 'SAL_Type', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? '' },
    { field: 'TXN_Uniform', header: '統一編號', visible: true }
  ];

  //#region 下拉選項
  invoiceFormatOptions: Option[] = []  // 發票格式
  creditTypeOptions: Option[] = [
    { label: '退出', value: '1' },
    { label: '折讓', value: '2' }
  ];  // 區別
  systemTypeOptions: Option[] = []  // 系統別
  guiTrackOptions: Option[] = []  // 字軌

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
    private readonly fin15030Service: FIN15030Service,
    private readonly datePipe: DatePipe,
    private readonly dropDownListService: DropDownListService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15030', 'fin/fin15030', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      const requestData: FIN15030QueryRequest = {
        MID: 0,
        STO_No: '10',
        ...frm.value,
        TXN_Date_S: this.datePipe.transform(frm.get('TXN_Date_S')?.value, 'yyyy-MM-dd') ?? '',
        TXN_Date_E: this.datePipe.transform(frm.get('TXN_Date_E')?.value, 'yyyy-MM-dd') ?? '',
        INV_YM: this.datePipe.transform(frm.get('INV_YM')?.value, 'yyyyMM') ?? '',
        INV_Data_YM_S: this.datePipe.transform(frm.get('INV_Data_YM_S')?.value, 'yyyyMM') ?? '',
        INV_Data_YM_E: this.datePipe.transform(frm.get('INV_Data_YM_E')?.value, 'yyyyMM') ?? '',
      };

      this.fin15030Service.queryFIN15030(requestData)
        .pipe(finalize(() => this.loading = false))
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
    const exportRequest: FIN15030PrintRequest = {
      MID: 0,
      STO_No: '10',
      ...frm1.value,
      TXN_Date_S: this.datePipe.transform(frm1.get('TXN_Date_S')?.value, 'yyyy-MM-dd') ?? '',
      TXN_Date_E: this.datePipe.transform(frm1.get('TXN_Date_E')?.value, 'yyyy-MM-dd') ?? '',
      INV_YM: this.datePipe.transform(frm1.get('INV_YM')?.value, 'yyyyMM') ?? '',
      INV_Data_YM_S: this.datePipe.transform(frm1.get('INV_Data_YM_S')?.value, 'yyyyMM') ?? '',
      INV_Data_YM_E: this.datePipe.transform(frm1.get('INV_Data_YM_E')?.value, 'yyyyMM') ?? '',
      IsMerge: frm2.get('IsMerge')?.value === '1' || false,
      IsExcel: frm2.get('IsExcel')?.value === '1' || false
    };

    this.fin15030Service.printFIN15030(exportRequest)
      .pipe(finalize(() => this.btnLoading = false))
      .subscribe((response) => {
        this.openDownloadWindow(response.Data.Print_URL);
      });
  }

  private validateRequiredFields(): boolean {
    if (this.queryForm.invalid) {
      const errors: string[] = [];
      if (!this.queryForm.get('INV_YM')?.value) errors.push('請填寫申報年月');

      if (errors.length > 0) {
        this.messageService.errorBubble(errors.join('<br>'));
        return false;
      }
    }
    return true;
  }

  private openDownloadWindow(printUrl: string): void {
    const downloadUrl = `${environment.ApiUrl}${printUrl}`;
    window.open(downloadUrl, '_blank');
  }

  private loadDropdownOptions(): void {
    // 載入發票格式
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).subscribe(r => {
      this.invoiceFormatOptions = r.Data.INV_GUITypes.map(item => ({ label: item.INV_GUIName, value: item.INV_GUIType }));
    });
    // 載入系統別
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: 'T207' }).subscribe(r => {
      this.systemTypeOptions = r.Data.map(item => ({ label: item.Name, value: item.No }));
    });
  }

  // 選完申報年月 載入字軌下拉
  loadGuiTrackOptions(event: any): void {
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: this.datePipe.transform(event, 'yyyyMM') ?? '',
      MID: 0,
      STO_No: '10',
      GUI_Type: this.queryForm.controls.INV_GUIType.value ?? ''
    }).subscribe(r => {
      this.guiTrackOptions = r.Data.GuiTracks.map((track: string) => ({ label: track, value: track }));
    });
  }
}