import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { getSYS1000Options, SystemOptionsService } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount, formatDate } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { FIN15010Data, FIN15010PrintRequest, FIN15010QueryRequest, FIN15010Service } from '../../../service/api/fin/fin15010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputTextRangeComponent } from '../../../shared/componentkit/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { ValidationService } from '../../../shared/service/validation.service';
import { removeEmptyValues } from '../../../shared/utils/object-utils';
import { YearMonthComponent } from '../fin11020/query-year-month/query-year-month.component';

export interface Option {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-fin15010',
  templateUrl: './fin15010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    InputTextComponent,
    TranslateModule,
    MultiSelectComponent,
    DropdownComponent,
    CommonModule,
    TableReportComponent,
    YearMonthComponent
  ]
})
export class FIN15010Component extends BasicQueryPageComponent<FIN15010Data> implements OnInit {
  queryForm = this.formBuilder.group({
    PUR_GUIDate_S: [null],                                      // 發票日期_起
    PUR_GUIDate_E: [null],                                      // 發票日期_迄
    PUR_VoucherType: [null],                                    // 發票格式
    GUI_Track: [null],                                          // 字軌
    InvoiceNo_S: ['', [Validators.maxLength(8)]],               // 發票號碼_起
    InvoiceNo_E: ['', [Validators.maxLength(8)]],               // 發票號碼_迄
    PUR_RepYYYYMM: ['', [Validators.required]], // 申報年月
    PUR_GUIDateYYYYMM_S: [''],         // 資料所屬年月_起
    PUR_GUIDateYYYYMM_E: [''],         // 資料所屬年月_迄
    PUR_Uniform_S: ['', [Validators.maxLength(10)]],            // 廠商統一編號_起
    PUR_Uniform_E: ['', [Validators.maxLength(10)]],            // 廠商統一編號_迄
    PUR_DiscNo: [null],                                         // 扣抵代號
    PUR_Type: [null],                                           // 類別區分
    PUR_TaxType: [null],                                        // 課稅別
    Source_Doc_No_S: ['', [Validators.maxLength(16)]],          // 憑證單號_起
    Source_Doc_No_E: ['', [Validators.maxLength(16)]],          // 憑證單號_迄
    Voucher_No_S: ['', [Validators.maxLength(16)]],             // 傳票號碼_起
    Voucher_No_E: ['', [Validators.maxLength(16)]],             // 傳票號碼_迄
    CRT_USR_Name: [null],                                       // 傳票建立者
    PUR_DirectType: [null],                                           // 直接扣抵法稅額分攤種類
    CRT_Date_S: [null],                                         // 建立日期_起
    CRT_Date_D: [null],                                         // 建立日期_迄
    SYS_ORIGIN: [null],                                         // 系統別
    ...createPaginationConfig([{ field: 'PUR_VoucherType', order: 1 }, { field: 'InvoiceNo', order: 1 }])
  });

  queryForm2 = this.formBuilder.group({
    IsMerge: ['0'],  // 預設為 '0' (分開列印)
    IsExcel: ['0']   // 預設為 '0' (PDF)
  });

  readonly tableData = signal<FIN15010Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: FIN15010QueryRequest;
  footerRow: Record<string, unknown> | null = null;

  selectedItems: FIN15010Data[] = [];
  btnLoading = false;

  columns: ReportColumn[] = [
    { field: 'No', header: '序號', visible: false },
    { field: 'PUR_VoucherType', header: '發票格式', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'InvoiceNo', header: '發票號碼', visible: true },
    { field: 'PUR_GUIDate', header: '發票日期', visible: true, format: formatDate },
    { field: 'PUR_GUIDateYYYYMM', header: '資料所屬年月', visible: true },
    { field: 'PUR_RepYYYYMM', header: '申報年月', visible: true },
    { field: 'PUR_Uniform', header: '廠商統一編號', visible: true },
    { field: 'PUR_Net', header: '發票金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'PUR_Tax', header: '發票稅額', visible: true, format: formatAmount, isTotal: true },
    { field: 'PUR_Amt', header: '發票總金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'PUR_TaxType', header: '課稅別', visible: true, format: (value: string) => this.taxTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'SYS_ORIGIN', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'PUR_DirectType', header: '直接扣抵法稅額分攤種類', visible: true, format: (value: string) => this.salTypeOptions.find(opt => opt.value === value)?.label ?? value },
  ];

  //#region 下拉選項
  // TDS1007
  invoiceFormatOptions: Option[] = [];   // 發票格式
  guiTrackOptions: Option[] = [];        // 字軌

  // SYS1000
  systemTypeOptions: Option[] = getSYS1000Options('SYS_ORIGIN');      // 系統別 (APS2002.SYS_ORIGIN, 下拉選單為SYS1000.SYS_ORIGIN)
  salTypeOptions: Option[] = getSYS1000Options('PUR_DirectType');     // 直接扣抵法稅額分攤種類 (APS2002.PUR_DirectType, 下拉選單為SYS1000.PUR_DirectType)
  taxTypeOptions: Option[] = getSYS1000Options('PUR_TaxType');        // 課稅別 (APS2002.PUR_TaxType, 下拉選單為SYS1000.PUR_TaxType)
  discountOptions: Option[] = [];   // 扣抵代號 (label: SYS_Code-SYS_Name)，在 ngOnInit 賦值
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
    this.discountOptions = SystemOptionsService.getOptions('PUR_DiscNo').map((item) => ({
      value: item.SYS_Code,
      label: `${item.SYS_Code}-${item.SYS_Name}`,
    }));
    this.loadDropdownOptions();
    // 設定PUR_RepYYYYMM預設值
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    if (currentMonth % 2 !== 0) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    this.queryForm.get('PUR_RepYYYYMM')?.setValue(this.datePipe.transform((currentDate), 'yyyyMM'));
  }

  private buildRequest(body?: { pageSize?: number; PageSize?: number; pageIndex?: number; PageIndex?: number; SortBy?: unknown }): FIN15010QueryRequest {
    const frm = this.queryForm;
    const pageSize = body?.pageSize ?? body?.PageSize ?? frm.get('pageSize')?.value ?? 30;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? frm.get('pageIndex')?.value ?? 1;
    const sortBy = body?.SortBy ?? frm.get('SortBy')?.value;
    const raw = {
      MID: 0,
      STO_No: '10',
      ...frm.getRawValue(),
      PUR_GUIDate_S: this.datePipe.transform(frm.get('PUR_GUIDate_S')?.value, 'yyyy-MM-dd') ?? '',
      PUR_GUIDate_E: this.datePipe.transform(frm.get('PUR_GUIDate_E')?.value, 'yyyy-MM-dd') ?? '',
      PUR_GUIDateYYYYMM_S: this.datePipe.transform(frm.get('PUR_GUIDateYYYYMM_S')?.value, 'yyyyMM') ?? '',
      PUR_GUIDateYYYYMM_E: this.datePipe.transform(frm.get('PUR_GUIDateYYYYMM_E')?.value, 'yyyyMM') ?? '',
      CRT_Date_S: this.datePipe.transform(frm.get('CRT_Date_S')?.value, 'yyyy-MM-dd') ?? '',
      CRT_Date_D: this.datePipe.transform(frm.get('CRT_Date_D')?.value, 'yyyy-MM-dd') ?? '',
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: Array.isArray(sortBy) ? sortBy : undefined,
    };
    return removeEmptyValues(raw) as FIN15010QueryRequest;
  }

  queryFunction = (body: any) => {
    const request = this.buildRequest(body);
    return this.fin15010Service.queryFIN15010(request).pipe(
      tap((response) => {
        const d = response?.Data;
        if (d && (d.TotalNet !== undefined || d.TotalTax !== undefined || d.TotalAmt !== undefined)) {
          this.footerRow = {
            group_name: '合計',
            PUR_Net: d.TotalNet,
            PUR_Tax: d.TotalTax,
            PUR_Amt: d.TotalAmt,
          };
        }
      }),
      map((response) => ({
        Data: response.Data?.APS2002_FIN15010s ?? [],
        TotalCount: response.Data?.TotalCount ?? 0,
      }))
    );
  };

  isRowSelectable = (_rowData: FIN15010Data): boolean => true;

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.lastQueryBody = this.buildRequest({
        pageSize: frm.get('pageSize')?.value ?? 30,
        pageIndex: frm.get('pageIndex')?.value ?? 1,
        SortBy: frm.get('SortBy')?.value,
      });

      this.tableLoading.set(true);
      this.queryStateService.setQueryState(this.ProgNo, frm.getRawValue());
      this.queryFunction(this.lastQueryBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => {
            this.tableLoading.set(false);
            this.loading = false;
          })
        )
        .subscribe({
          next: (res) => {
            this.tableData.set(res.Data);
            this.totalRecords.set(res.TotalCount);
          },
          error: () => {
            this.tableData.set([]);
            this.totalRecords.set(0);
          },
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

  loadGuiTrackOptions(event: any): void {
    // 選完申報年月 載入字軌下拉
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: event,
      MID: 0,
      STO_No: '10',
      GUI_Type: this.queryForm.controls.PUR_VoucherType.value ?? []
    }).subscribe(r => {
      this.guiTrackOptions = r.Data.GuiTracks.map((track: string) => ({ label: track, value: track }));
    });
  }

  onStartControlChange(event: any, controlName: string): void {
    switch (controlName) {
      case 'PUR_GUIDate_S':
        this.queryForm.controls.PUR_GUIDate_E.setValue(event);
        break;
      case 'InvoiceNo_S':
        this.queryForm.controls.InvoiceNo_E.setValue(event);
        break;
      case 'PUR_Uniform_S':
        this.queryForm.controls.PUR_Uniform_E.setValue(event);
        break;
      case 'Source_Doc_No_S':
        this.queryForm.controls.Source_Doc_No_E.setValue(event);
        break;
      case 'Voucher_No_S':
        this.queryForm.controls.Voucher_No_E.setValue(event);
        break;
      case 'CRT_Date_S':
        this.queryForm.controls.CRT_Date_D.setValue(event);
        break;
    }
  }
}
