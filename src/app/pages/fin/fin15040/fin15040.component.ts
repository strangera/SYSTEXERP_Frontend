import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15040Data, FIN15040PrintRequest, FIN15040QueryRequest, FIN15040Service } from '@service/api/fin/fin15040.service';
import { getSYS1000, getSYS1000Options } from '@service/system/sys1000.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { CustomFooterTableComponent } from '@others/component/custom-footer-table/customFooterTable.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { ValidationService } from '@shared/service/validation.service';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputTextRangeComponent } from '../../../shared/components/input-text-range/input-text-range.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { Column, createPaginationConfig, formatAmount, formatDate } from '../../../others/component/table/table.model';
import { YearMonthComponent } from '../fin11020/query-year-month.component';

export interface Option {
  label: string;
  value: string | number | boolean;
}

@Component({
  selector: 'app-fin15040',
  templateUrl: './fin15040.component.html',
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
    DropdownComponent,
    CalendarComponent,
    CommonModule,
    MultiSelectComponent,
    CustomFooterTableComponent,
    YearMonthComponent,
    CheckboxModule
  ]
})
export class FIN15040Component extends BasicQueryPageComponent<FIN15040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    TXN_Date_S: [null],                                     // 發票日期起
    TXN_Date_E: [null],                                     // 發票日期訖
    PUR_VoucherType: [null],                                // 發票格式
    GUI_Track: ['', [
      Validators.maxLength(2),
      Validators.pattern(/^[A-Za-z]{0,2}$/)
    ]], // 字軌，只能輸入 2 碼英文                                    // 字軌
    INV_GUINumber_S: ['', [Validators.maxLength(8)]],       // 發票號碼起
    INV_GUINumber_E: ['', [Validators.maxLength(8)]],       // 發票號碼訖
    INV_YM1_S: [''],                                      // 資料所屬年月起
    INV_YM1_E: [''],                                      // 資料所屬年月訖
    INV_YM2_S: [''], // 申報年月起
    INV_YM2_E: [''], // 申報年月訖
    PUR_Uniform: ['', [Validators.maxLength(8)]],           // 廠商統一編號
    PUR_TaxType: [null],                                    // 課稅別
    Source_Doc_No_S: ['', [Validators.maxLength(16)]],      // 憑證單號起
    Source_Doc_No_E: ['', [Validators.maxLength(16)]],      // 憑證單號訖
    Voucher_No_S: ['', [Validators.maxLength(16)]],         // 傳票號碼起
    Voucher_No_E: ['', [Validators.maxLength(16)]],         // 傳票號碼訖
    SYS_ORIGIN: [null],                                    // 系統別
    SAL_Type: [null],                                       // 使用別
    CrtVouUsrNo: ['', [Validators.maxLength(20)]],          // 傳票建立者
    AssetType: [null],                                      // 資產註記
    HasUniform: [null],                                     // 是否有統一編號
    ECR_No: [null],                                         // 收銀機號                                     // 是否有統一編號
    PUR_DiscNo: [null],                                         // 折抵代號 (dropdown)
    IncludeNextDayVoid: [true],                              // 包含隔日作廢
    OnlyB2B: [false],                                        // 僅有B2B發票
    INV_Cancel: [null],                                      // 發票狀態
    ...createPaginationConfig([{ field: 'INV_GUIType', order: 1 }, { field: 'INV_GUINumber', order: 1 }])
  });

  queryForm2 = this.formBuilder.group({
    IsMerge: ['0'],  // 預設為 '0' (分開列印)
    IsExcel: ['0']   // 預設為 '0' (PDF)
  });

  totalRecords = 0;
  data: FIN15040Data[] = [];
  selectedItems: FIN15040Data[] = [];
  btnLoading = false;
  footerData: any[] = [];

  columns: Column[] = [
    { field: 'INV_GUIType', header: '發票格式', visible: true, format: (value: string) => this.invoiceFormatOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'INV_GUITrack', header: '字軌', visible: true },
    { field: 'INV_GUINumber', header: '發票號碼', visible: true },
    { field: 'TXN_Date', header: '發票日期', visible: true, format: formatDate },
    { field: 'INV_Cancel', header: '發票狀態', visible: true },
    { field: 'INV_YM1', header: '資料所屬年月', visible: true },
    { field: 'INV_YM2', header: '申報年月', visible: true },
    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_Net', header: '發票金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_Tax', header: '發票稅額', visible: true, format: formatAmount, isTotal: true },
    { field: 'TXN_SaleAmt', header: '發票總金額', visible: true, format: formatAmount, isTotal: true },
    { field: 'PLU_TaxType', header: '課稅別', visible: true, format: (value: string) => this.taxTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'Voucher_No', header: '傳票號碼', visible: true },
    { field: 'SYS_ORIGIN', header: '系統別', visible: true, format: (value: string) => this.systemTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'SAL_Type', header: '使用別', visible: true, format: (value: string) => this.salTypeOptions.find(opt => opt.value === value)?.label ?? value },
    { field: 'AssetType', header: '資產註記', visible: true, format: v => getSYS1000('AssetType', v) },
  ];

  //#region
  // TDS1007
  invoiceFormatOptions: Option[] = [];   // 發票格式
  guiTrackOptions: Option[] = [];        // 字軌

  // SYS1000
  systemTypeOptions = getSYS1000Options('SYS_ORIGIN');      // 系統別 (POS4023.SYS_ORIGIN)
  salTypeOptions = getSYS1000Options('T205');                 // 使用別 (POS4023.SAL_Type)
  taxTypeOptions = [...getSYS1000Options('PLU_TaxType'), { label: '零稅率', value: '3' }];  // 課稅別 (POS4023.PLU_TaxType) + 零稅率(INV_NoneTax='1')
  assetNotationOptions = getSYS1000Options('AssetType');   // 資產註記

  // 收銀機號
  ecrOptions: Option[] = [];

  // 是否有統一編號
  hasUniformOptions: Option[] = [
    { label: '有', value: true },
    { label: '無', value: false }
  ];

  // 列印方式
  mergeOptions: Option[] = [
    { label: '分開列印', value: '0' },
    { label: '合併列印', value: '1' }
  ];
  exportOptions: Option[] = [
    { label: 'PDF', value: '0' },
    { label: 'Excel', value: '1' }
  ];

  // 發票狀態
  invStatusOptions: Option[] = [
    { label: '開立', value: 'N' },
    { label: '作廢', value: 'Y' }
  ];
  //#endregion

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
    // 設定申報年月起訖預設值（當期雙月）
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    if (currentMonth % 2 !== 0) {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const defaultYM = this.datePipe.transform(currentDate, 'yyyyMM') ?? '';
    this.queryForm.get('INV_YM2_S')?.setValue(defaultYM);
    this.queryForm.get('INV_YM2_E')?.setValue(defaultYM);
    this.queryForm.controls.GUI_Track.valueChanges.subscribe(value => {
      if (value) {
        const formattedValue = value
          .replace(/[^A-Za-z]/g, '') // 只留英文
          .slice(0, 2)               // 最多兩碼
          .toUpperCase();            // 自動轉大寫

        if (value !== formattedValue) {
          this.queryForm.controls.GUI_Track.setValue(formattedValue, {
            emitEvent: false
          });
        }
      }
    });
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
      };

      this.fin15040Service.queryFIN15040(requestData)
        .pipe(untilDestroyed(this), finalize(() => this.loading = false))
        .subscribe((res) => {
          this.data = res.Data.QueryData;
          this.footerData = [{
            group_name: '合計',
            TXN_Net: res.Data.TotalNet,
            TXN_Tax: res.Data.TotalTax,
            TXN_SaleAmt: res.Data.TotalAmt
          }];
          this.totalRecords = res.Data.TotalCount;
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
      this.messageService.errorBubble('請確認查詢條件是否填寫正確');
      return false;
    }
    return true;
  }

  private openDownloadWindow(printUrl: string): void {
    const downloadUrl = `${environment.ApiUrl}${printUrl}`;
    globalThis.open(downloadUrl, '_blank', 'width=1024,height=768,scrollbars=yes,resizable=yes');
  }

  private loadDropdownOptions(): void {
    // 發票格式
    this.dropDownListService.queryTDS1007_DropDownList({ mid: 0 }).subscribe(r => {
      this.invoiceFormatOptions = r.Data.INV_GUITypes
        .filter(item => ['31', '32', '35', '36', '37'].includes(item.INV_GUIType))
        .sort((a, b) => a.INV_GUIType.localeCompare(b.INV_GUIType))
        .map(item => ({ label: `${item.INV_GUIType}-${item.INV_GUIName}`, value: item.INV_GUIType }));
    });

    // 收銀機號
    this.dropDownListService.queryPOS1002_DropDownList().pipe(untilDestroyed(this)).subscribe(options => {
      this.ecrOptions = options.Data.map(item => ({
        label: `${item.No} - ${item.Name}`,
        value: item.No
      }));
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
}
