import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15030Data, FIN15030PrintRequest, FIN15030QueryRequest, FIN15030Service } from '@service/api/fin/fin15030.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ReportColumn, formatAmount, formatDate } from '@shared/components/table-report/table-report.model';
import { ValidationService } from '@shared/service/validation.service';
import { removeEmptyValues } from '@shared/utils/object-utils';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { InputTextComponent } from 'src/app/shared/components/input-text/input-text.component';
import { environment } from '../../../../environments/environment';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { createPaginationConfig } from '../../../others/component/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

export interface Option {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-fin15030',
  templateUrl: './fin15030.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    InputTextRangeComponent,
    CalendarRangeComponent,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    DropdownComponent,
    CalendarComponent,
    MultiSelectComponent,
    CommonModule,
    TableReportComponent,
    YearMonthComponent,
    CheckboxModule,
    InputTextComponent,
  ]
})
export class FIN15030Component extends BasicQueryPageComponent<FIN15030Data> implements OnInit {
  queryForm = this.formBuilder.group({
    INV_Remark_S: ['', [Validators.maxLength(16)]],             // 退出/折讓單號起 (string(10))
    INV_Remark_E: ['', [Validators.maxLength(16)]],             // 退出/折讓單號訖 (string(20))
    INV_GUIType: [null],                                        // 發票格式 (dropdown)
    GUI_Track: [null],                                          // 字軌 (string(2))
    TXN_GUINo_S: ['', [Validators.maxLength(8)]],               // 發票號碼起 (string(8))
    TXN_GUINo_E: ['', [Validators.maxLength(8)]],               // 發票號碼訖 (string(8))
    TXN_Date_S: [null],                                         // 退出/折讓日期起 (date picker)
    TXN_Date_E: [null],                                         // 退出/折讓日期訖 (date picker)
    Credit_Type: [null],                                        // 區別 (dropdown)
    INV_YM: ['', [Validators.required]],                      // 申報年月 (必填, date picker)
    INV_Data_YM_S: [''],                                      // 資料所屬年月起 (date picker)
    INV_Data_YM_E: [''],                                      // 資料所屬年月訖 (date picker)
    Source_Doc_No_S: ['', [Validators.maxLength(16)]],          // 憑證單號起 (string(16))
    Source_Doc_No_E: ['', [Validators.maxLength(16)]],          // 憑證單號訖 (string(16))
    Voucher_No_S: ['', [Validators.maxLength(16)]],             // 傳票號碼起 (string(16))
    Voucher_No_E: ['', [Validators.maxLength(16)]],             // 傳票號碼訖 (string(16))
    SAL_Type: [null],           // 使用別 (dropdown)
    SYS_ORIGIN: [null],         // 系統別 (dropdown)
    IncludeNextDayVoid: [true], // 包含隔日作廢 (預設打勾)
    ...createPaginationConfig([{ field: 'INV_GUIType', order: 1 }, { field: 'TXN_GUINo', order: 1 }])
  });

  queryForm2 = this.formBuilder.group({
    IsMerge: ['0'],  // 預設為 '0' (分開列印)
    IsExcel: ['0']   // 預設為 '0' (PDF)
  });

  readonly tableData = signal<FIN15030Data[]>([]);
  readonly totalRecords = signal<number>(0);
  readonly tableLoading = signal<boolean>(false);
  lastQueryBody?: FIN15030QueryRequest;
  footerRow: Record<string, unknown> | null = null;

  selectedItems: FIN15030Data[] = [];
  btnLoading = false;

  columns: ReportColumn[] = [
   
    { field: 'INV_Remark', header: '退出/折讓單號', visible: true },
    { field: 'INV_GUIType', header: '發票格式', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'GUI_Track', header: '字軌', visible: true },
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },
    { field: 'TXN_Date', header: '退出/折讓日期', visible: true, format: formatDate },
    { field: 'Credit_Type', header: '區別', visible: true, format: (value: string) => this.creditTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'INV_DeclareYM', header: '申報年月', visible: true },
    { field: 'TXN_Net', header: '退出折讓單金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_Tax', header: '退出折讓單稅額', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_TotalAmt', header: '折讓總金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'Source_Doc_No', header: '憑證單號', visible: true },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'SYS_ORIGIN', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'SAL_Type', header: '使用別', visible: true, format: (value: string) => this.salTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_VoidDT', header: '作廢日期', visible: true, format: formatDate }
  ];

  //#region
  // TDS1007
  invoiceFormatOptions: Option[] = [];   // 發票格式
  guiTrackOptions: Option[] = [];        // 字軌

  creditTypeOptions: Option[] = getSYS1000Options('Credit_Type');     // 區別 (APS2002.Credit_Type, 下拉選單為SYS1000.Credit_Type)
  systemTypeOptions = getSYS1000Options('SYS_ORIGIN');      // 系統別 (POS4023.SYS_ORIGIN)
  salTypeOptions = getSYS1000Options('T205');                 // 使用別 (POS4023.SAL_Type)

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
    private readonly dropDownListService: DropDownListService,
    private readonly validationService: ValidationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('FIN15030', 'fin/fin15030', this.queryForm, (form) => this.onSubmit(form));
    this.loadDropdownOptions();
    // 設定INV_YM預設值
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
    if (currentMonth % 2 !== 0) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    this.queryForm.get('INV_YM')?.setValue(this.datePipe.transform((currentDate), 'yyyyMM'));
  }

  private buildRequest(body?: { pageSize?: number; PageSize?: number; pageIndex?: number; PageIndex?: number; SortBy?: unknown }): FIN15030QueryRequest {
    const frm = this.queryForm;
    const pageSize = body?.pageSize ?? body?.PageSize ?? frm.get('pageSize')?.value ?? 30;
    const pageIndex = body?.pageIndex ?? body?.PageIndex ?? frm.get('pageIndex')?.value ?? 1;
    const sortBy = body?.SortBy ?? frm.get('SortBy')?.value;
    const raw = {
      MID: 0,
      STO_No: '10',
      ...frm.getRawValue(),
      TXN_Date_S: this.datePipe.transform(frm.get('TXN_Date_S')?.value, 'yyyy-MM-dd') ?? '',
      TXN_Date_E: this.datePipe.transform(frm.get('TXN_Date_E')?.value, 'yyyy-MM-dd') ?? '',
      INV_Data_YM_S: this.datePipe.transform(frm.get('INV_Data_YM_S')?.value, 'yyyyMM') ?? '',
      INV_Data_YM_E: this.datePipe.transform(frm.get('INV_Data_YM_E')?.value, 'yyyyMM') ?? '',
      PageSize: pageSize,
      PageIndex: pageIndex,
      SortBy: Array.isArray(sortBy) ? sortBy : undefined,
    };
    return removeEmptyValues(raw) as FIN15030QueryRequest;
  }

  queryFunction = (body: any) => {
    const request = this.buildRequest(body);
    return this.fin15030Service.queryFIN15030(request).pipe(
      tap((response) => {
        const d = response?.Data;
        if (d && (d.TotalNet !== undefined || d.TotalTax !== undefined)) {
          this.footerRow = {
            group_name: '合計',
            TXN_Net: d.TotalNet,
            TXN_Tax: d.TotalTax,
            TXN_TotalAmt: (d.TotalNet ?? 0) + (d.TotalTax ?? 0),
          };
        }
      }),
      map((response) => ({
        Data: response.Data?.FIN15030s ?? [],
        TotalCount: response.Data?.TotalCount ?? 0,
      }))
    );
  };

  isRowSelectable = (_rowData: FIN15030Data): boolean => true;

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
    const exportRequest: FIN15030PrintRequest = {
      MID: 0,
      STO_No: '10',
      ...frm1.value,
      TXN_Date_S: this.datePipe.transform(frm1.get('TXN_Date_S')?.value, 'yyyy-MM-dd') ?? '',
      TXN_Date_E: this.datePipe.transform(frm1.get('TXN_Date_E')?.value, 'yyyy-MM-dd') ?? '',
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
    globalThis.open(downloadUrl, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
  }

  private loadDropdownOptions(): void {
    // 載入發票格式
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).subscribe(r => {
      this.invoiceFormatOptions = r.Data.INV_GUITypes
        .filter(item => ['33', '34', '38'].includes(item.INV_GUIType))
        .sort((a, b) => a.INV_GUIType.localeCompare(b.INV_GUIType))
        .map(item => ({ label: `${item.INV_GUIType}-${item.INV_GUIName}`, value: item.INV_GUIType }));
    });
  }

  // 選完申報年月 載入字軌下拉
  loadGuiTrackOptions(event: any): void {
    this.dropDownListService.queryPOS1018_GUI_TRACK_DropDownList({
      GUI_YYMM: event,
      MID: 0,
      STO_No: '10',
      GUI_Type: this.queryForm.controls.INV_GUIType.value ?? []
    }).subscribe(r => {
      this.guiTrackOptions = r.Data.GuiTracks.map((track: string) => ({ label: track, value: track }));
    });
  }
}
