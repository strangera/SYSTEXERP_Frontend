import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15110Service } from '@service/api/fin/fin15110.service';
import { CustomFooterTableComponent } from '@others/component/custom-footer-table/customFooterTable.component';
import { DropdownRangeComponent } from '@shared/components/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from "@shared/components/input-text/input-text.component";
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import {
  Column,
  createPaginationConfig,
  formatAmount,
  formatDate,
} from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { debounceTime, finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import {
  DropDownListService,
  IDropdownItem,
} from './../../../service/utility/dropDownList.service';

@Component({
  selector: 'app-fin15110',
  templateUrl: './fin15110.component.html',
  styleUrls: ['./fin15110.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TranslateModule,
    CalendarRangeComponent,
    TableModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ButtonModule,
    CustomFooterTableComponent,
    DatePipe,
    MultiSelectComponent,
    DropdownRangeComponent,
    DropdownComponent,
    InputTextComponent,
    CheckboxModule,
    NgIf,
    NgFor,
  ],
})
export class FIN15110Component
  extends BasicQueryPageComponent<any>
  implements OnInit {
  /** 查詢條件表單 */
  queryForm = this.formBuilder.nonNullable.group({
    TXN_DT_S: [new Date(), [Validators.required]],
    TXN_DT_E: [new Date(), [Validators.required]],
    ECR_No_S: [''],
    ECR_No_E: [''],
    Data_Source: [''],
    INV_GUIType: [''],
    IncludeExchange: [false],
    displayMode: ['2'],
    ...createPaginationConfig([{ field: 'Ecr_No', order: 1 }]),
    pageSize: [30],
  });

  /** 表格資料 */
  data: any[] = [];
  totalRecords = 0;
  footerData: any[] = [];

  /** 匯出按鈕 Loading 狀態 */
  btnLoading = false;
  btnLoading2 = false;

  /** 金額格式化（供 template 使用） */
  readonly fmt = formatAmount;

  /** Type 7 彙總表：17 個資料欄位名稱（不含發票日期） */
  readonly type7DataFields = [
    'ConvCashRegTaxableTotalAmount',
    'ConvCashRegTaxFreeAmount',
    'ConvCashRegZeroTaxAmount',
    'ConvElectronicNoUniformTaxableTotalAmount',
    'ConvElectronicWithUniformNetAmount',
    'ConvElectronicWithUniformTaxAmount',
    'ConvElectronicTaxFreeAmount',
    'ConvElectronicZeroTaxAmount',
    'VoidCashRegTaxableTotalAmount',
    'VoidCashRegTaxFreeAmount',
    'VoidCashRegZeroTaxAmount',
    'VoidElectronicNoUniformTaxableTotalAmount',
    'VoidElectronicWithUniformNetAmount',
    'VoidElectronicWithUniformTaxAmount',
    'VoidElectronicTaxFreeAmount',
    'VoidElectronicZeroTaxAmount',
    'NoOriginalTxnSalesAmount',
  ];

  /** Type 7 合計列各欄加總 */
  getType7Sum(field: string): string {
    const sum = this.data.reduce((acc, row) => acc + (row[field] ?? 0), 0);
    return this.fmt(sum);
  }

  /** Type 7 單列前16欄金額加總（不含無原交易資料銷售總額） */
  getType7RowTotal(row: any): number {
    return this.type7DataFields.slice(0, 16).reduce((sum, field) => sum + (row[field] ?? 0), 0);
  }

  /** Type 7 合計金額欄的最終總計 */
  getType7TotalSum(): string {
    const sum = this.data.reduce((acc, row) => acc + this.getType7RowTotal(row), 0);
    return this.fmt(sum);
  }

  /** 下拉選項 */
  ECRNoOptions: IDropdownItem[] = [];
  displayModeOptions = [
    // { value: '1', label: '二電發票表' }, // 暫時隱藏
    { value: '2', label: '發票報表依機台加總' },
    { value: '3', label: '發票報表依機台明細' },
    { value: '4', label: '跨日作廢發票報表' },
    { value: '5', label: '跨期作廢發票報表' },
    { value: '6', label: 'POS發票明細表' },
    { value: '7', label: 'POS發票彙總表' },
  ];
  dataSourceOptions = [
    { label: '轉檔報表', value: '1' },
    { label: '跨日作廢', value: '2' },
  ];
  /** 表格欄位設定 */
  columns: Column[] = [];

  /** 不同 ReportType 的欄位配置 */
  private getColumnsByReportType(reportType: string): Column[] {
    const baseColumns = {
      No: { field: 'No', header: '序號', visible: false, showSort: true },
      DataType: { field: 'DataType', header: '資料種類', visible: true, showSort: true },
      StoreNo: { field: 'StoreNo', header: '店號', visible: true, showSort: true },
      Ecr_No: { field: 'Ecr_No', header: '收銀機號', visible: true, showSort: true },
      TXN_Date: { field: 'TXN_Date', header: '發票日期', visible: true, showSort: true },
      INV_YM: { field: 'INV_YM', header: '發票年月', visible: true, showSort: true },
      TXN_GUINo: { field: 'TXN_GUINo', header: '發票號碼', visible: true, showSort: true },
      TXN_Uniform: { field: 'TXN_Uniform', header: '統一編號', visible: true, showSort: true },
      TXN_SaleAmt: {
        field: 'TXN_SaleAmt',
        header: '發票總金額',
        visible: true,
        showSort: true,
        format: formatAmount,
        isTotal: true,
      },
      TXN_SaleTax: {
        field: 'TXN_SaleTax',
        header: '應稅銷售金額',
        visible: true,
        showSort: true,
        format: formatAmount,
        isTotal: true,
      },
      TXN_SaleNoTax: {
        field: 'TXN_SaleNoTax',
        header: '免稅銷售金額',
        visible: true,
        showSort: true,
        format: formatAmount,
        isTotal: true,
      },
      TXN_SaleZeroTax: {
        field: 'TXN_SaleZeroTax',
        header: '零稅率銷售金額',
        visible: true,
        showSort: true,
        format: formatAmount,
        isTotal: true,
      },
      TXN_Net: {
        field: 'TXN_Net',
        header: '未稅銷售金額',
        visible: true,
        showSort: true,
        format: formatAmount,
        isTotal: true,
      },
      TXN_Tax: {
        field: 'TXN_Tax',
        header: '稅額',
        visible: true,
        showSort: true,
        format: formatAmount,
        isTotal: true,
      },
      TXN_VoidDT: { field: 'TXN_VoidDT', header: '發票作廢日期', visible: true, showSort: true, format: formatDate },
      INVStatus: { field: 'INVStatus', header: '發票狀態', visible: true, showSort: true },
      GUIType: { field: 'GUIType', header: '發票類型', visible: true, showSort: true },
      PLU_TaxType: { field: 'PLU_TaxType', header: '稅別', visible: true, showSort: true },
    };

    switch (reportType) {
      case '1': // 二電發票明細報表
        return [
          baseColumns.Ecr_No,
          baseColumns.TXN_Date,
          baseColumns.TXN_GUINo,
          baseColumns.TXN_Uniform,
          baseColumns.TXN_SaleAmt,
          baseColumns.TXN_SaleTax,
          baseColumns.TXN_SaleNoTax,
          baseColumns.TXN_Net,
          baseColumns.TXN_Tax,
          baseColumns.TXN_VoidDT,
        ];

      case '2': // 發票報表一機台加總
        return [

          baseColumns.Ecr_No,
          baseColumns.TXN_Date,
          baseColumns.TXN_SaleAmt,
          baseColumns.TXN_SaleTax,
          baseColumns.TXN_SaleNoTax,
          baseColumns.TXN_SaleZeroTax,
        ];

      case '3': // 發票報表一機台明細
        return [

          baseColumns.Ecr_No,
          baseColumns.TXN_Date,
          baseColumns.TXN_GUINo,
          baseColumns.TXN_SaleAmt,
          baseColumns.TXN_SaleTax,
          baseColumns.TXN_SaleNoTax,
          baseColumns.TXN_SaleZeroTax,
          baseColumns.INVStatus,
        ];

      case '4': // 作廢發票報表
        return [
          { field: 'TXN_VoidDT', header: '跨日作廢日期', visible: true, showSort: true },
          { field: 'TXN_Date', header: '原始交易日期', visible: true, showSort: true },
          { field: 'Ecr_No', header: '收銀機號', visible: true, showSort: true },
          { field: 'TXN_GUINo', header: '發票號碼', visible: true, showSort: true },
          { field: 'TXN_Uniform', header: '統一編號', visible: true, showSort: true },
          {
            field: 'TXN_SaleAmt',
            header: '發票總金額',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
          {
            field: 'TXN_SaleTax',
            header: '應稅銷售金額',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
          {
            field: 'TXN_SaleNoTax',
            header: '免稅銷售金額',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
          {
            field: 'TXN_Net',
            header: '未稅銷售金額',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
          {
            field: 'TXN_Tax',
            header: '稅額',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
        ];


      case '5': // 對帳格式
        return [
          { field: 'TXN_Date', header: '退出/折讓日期', visible: true, showSort: true },
          { field: 'Ecr_No', header: '收銀機號', visible: true, showSort: true },
          { field: 'TXN_GUINo', header: '發票號碼', visible: true, showSort: true },
          { field: 'GUIType', header: '發票格式', visible: true, showSort: true },
          { field: 'PLU_TaxType', header: '課稅別', visible: true, showSort: true },
          {
            field: 'TXN_Net',
            header: '退出折讓金額',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
          {
            field: 'TXN_Tax',
            header: '退出折讓稅額',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
          {
            field: 'TXN_SaleAmt',
            header: '合計',
            visible: true,
            showSort: true,
            format: formatAmount,
            isTotal: true
          },
        ];

      case '6': // 二收及二電發票表-明細表
        return [
          { field: 'InvoiceTypeName', header: '發票類別', visible: true, showSort: true },
          { field: 'DataSourceName', header: '資料來源', visible: true, showSort: true },
          { field: 'EcrNo', header: '收銀機號', visible: true, showSort: true },
          { field: 'InvoiceDate', header: '發票日期', visible: true, showSort: true },
          { field: 'InvoiceNoStart', header: '發票號碼起', visible: true, showSort: true },
          { field: 'InvoiceNoEnd', header: '發票號碼迄', visible: true, showSort: true },
          { field: 'UniformNo', header: '統一編號', visible: true, showSort: true },
          { field: 'TaxableTotalAmount', header: '應稅總金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'TaxAmount', header: '稅額', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'TaxFreeAmount', header: '免稅金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ZeroTaxAmount', header: '零稅金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'SalesTotalAmount', header: '銷售總金額', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'InvoiceStatusName', header: '發票狀態', visible: true, showSort: true },
          { field: 'DeclareYM', header: '申報年月', visible: true, showSort: true },
          { field: 'CombineFlagName', header: '彙加註記', visible: true, showSort: true },
        ];

      case '7': // 二收及二電發票表-彙總表
        return [
          { field: 'InvoiceDate', header: '發票日期', visible: true, showSort: true },
          { field: 'ConvCashRegTaxableTotalAmount', header: '轉檔/非電子/應稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvCashRegTaxFreeAmount', header: '轉檔/非電子/免稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvCashRegZeroTaxAmount', header: '轉檔/非電子/零稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvElectronicTaxableTotalAmount', header: '轉檔/電子/應稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvElectronicTaxFreeAmount', header: '轉檔/電子/免稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvElectronicZeroTaxAmount', header: '轉檔/電子/零稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvElectronicNoUniformTaxableTotalAmount', header: '轉檔/電子/無統編應稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvElectronicWithUniformNetAmount', header: '轉檔/電子/有統編未稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'ConvElectronicWithUniformTaxAmount', header: '轉檔/電子/有統編稅額', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidCashRegTaxableTotalAmount', header: '跨日作廢/非電子/應稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidCashRegTaxFreeAmount', header: '跨日作廢/非電子/免稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidCashRegZeroTaxAmount', header: '跨日作廢/非電子/零稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidElectronicTaxableTotalAmount', header: '跨日作廢/電子/應稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidElectronicTaxFreeAmount', header: '跨日作廢/電子/免稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidElectronicZeroTaxAmount', header: '跨日作廢/電子/零稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidElectronicNoUniformTaxableTotalAmount', header: '跨日作廢/電子/無統編應稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidElectronicWithUniformNetAmount', header: '跨日作廢/電子/有統編未稅', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'VoidElectronicWithUniformTaxAmount', header: '跨日作廢/電子/有統編稅額', visible: true, showSort: true, format: formatAmount, isTotal: true },
          { field: 'NoOriginalTxnSalesAmount', header: '無原交易資料銷售總額', visible: true, showSort: true, format: formatAmount, isTotal: true },
        ];

      default:
        return this.getColumnsByReportType('2');
    }
  }


  constructor(
    private readonly fin15110Service: FIN15110Service,
    private readonly dropDownListService: DropDownListService,
    private readonly datePipe: DatePipe
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage(
      'FIN15110',
      '/FIN/FIN15110CRU',
      this.queryForm,
      (frm) => this.onSubmit(frm)
    );

    this.dropDownListService
      .queryPOS1002_DropDownList()
      .subscribe((res) => {
        const list = res?.Data ?? [];
        this.ECRNoOptions = list.map((item: any) => ({
          No: item.No ?? '',
          Name: `${item.No ?? ''}-${item.Name ?? ''}`,
          label: `${item.No ?? ''}-${item.Name ?? ''}`,
          value: item.No ?? '',
        }));
      });

    // 初始化預設欄位配置
    this.columns = this.getColumnsByReportType(this.queryForm.value.displayMode || '2');

    this.setupDisplayModeWatcher();
    // 根據目前 displayMode 設定初始欄位狀態
    this.updateControlsByDisplayMode(this.queryForm.value.displayMode || '2');
  }

  /** 監聽報表類型變化，自動調整日期範圍 */
  private setupDisplayModeWatcher(): void {
    this.queryForm.get('displayMode')?.valueChanges.pipe(debounceTime(200), untilDestroyed(this)).subscribe(value => {
      // 更新欄位啟用/停用狀態（不會立刻改變表格欄位）
      this.updateControlsByDisplayMode(value);
      // 當為 2/3 時自動把結束日設為起始日（UI 會把結束日停用）
      if (value === '2' || value === '3') {
        const startDate = this.queryForm.get('TXN_DT_S')?.value;
        if (startDate) {
          this.queryForm.patchValue({ TXN_DT_E: startDate }, { emitEvent: false });
        }
      }

      // 立即自動查詢，避免保留先前報表資料
      if (!this.loading) {
        this.onSubmit(this.queryForm);
      }
    });
  }

  /** 根據 displayMode 啟用 / 停用查詢欄位 */
  private updateControlsByDisplayMode(mode: string): void {
    const ecrS = this.queryForm.get('ECR_No_S');
    const ecrE = this.queryForm.get('ECR_No_E');
    const dataSource = this.queryForm.get('Data_Source');
    const invGUIType = this.queryForm.get('INV_GUIType');
    const txnEs = this.queryForm.get('TXN_DT_E');
    const includeExchange = this.queryForm.get('IncludeExchange');

    if (!ecrS || !ecrE || !dataSource || !invGUIType || !txnEs || !includeExchange) return;

    // 收銀機號：mode '4', '5' 時停用並清空
    if (mode === '4' || mode === '5') {
      ecrS.disable({ emitEvent: false });
      ecrE.disable({ emitEvent: false });
      ecrS.patchValue('', { emitEvent: false });
      ecrE.patchValue('', { emitEvent: false });
    } else {
      ecrS.enable({ emitEvent: false });
      ecrE.enable({ emitEvent: false });
    }

    // 資料來源條件 / 發票格式代號：只有 mode '6', '7' 才啟用
    if (mode === '6' || mode === '7') {
      dataSource.enable({ emitEvent: false });
      invGUIType.enable({ emitEvent: false });
    } else {
      dataSource.disable({ emitEvent: false });
      dataSource.patchValue('', { emitEvent: false });
      invGUIType.disable({ emitEvent: false });
      invGUIType.patchValue('', { emitEvent: false });
    }

    // 包含換開發票：mode 2, 3, 6, 7 才啟用，其餘停用並清空
    if (mode === '2' || mode === '3' || mode === '6' || mode === '7') {
      includeExchange.enable({ emitEvent: false });
    } else {
      includeExchange.disable({ emitEvent: false });
      includeExchange.patchValue(false, { emitEvent: false });
    }

    // mode '2', '3' 時結束日自動同步起始日（由 setupDisplayModeWatcher 處理），此處保持啟用
    txnEs.enable({ emitEvent: false });
  }

  /** 根據 ReportType 設置 footerData */
  private setFooterDataByReportType(data: any, reportType: string): void {
    switch (reportType) {
      case '1': // 二電發票明細報表
        this.footerData = [
          {
            TXN_SaleAmt: data.TotalTXN_SaleAmt,
            TXN_SaleTax: data.TotalTXN_SaleTax,
            TXN_SaleNoTax: data.TotalTXN_SaleNoTax,
            TXN_Net: data.TotalNet,
            TXN_Tax: data.TotalTax,
          },
        ];
        break;
      case '2': // 發票報表一機台加總
      case '3': // 發票報表一機台明細
        this.footerData = [
          {
            TXN_SaleAmt: data.TotalTXN_SaleAmt,
            TXN_SaleTax: data.TotalTXN_SaleTax,
            TXN_SaleNoTax: data.TotalTXN_SaleNoTax,
            TXN_SaleZeroTax: data.TotalTXN_SaleZeroTax,
          },
        ];
        break;
      case '4': // 作廢發票報表
        this.footerData = [
          {
            TXN_SaleAmt: data.TotalTXN_SaleAmt,
            TXN_SaleTax: data.TotalTXN_SaleTax,
            TXN_SaleNoTax: data.TotalTXN_SaleNoTax,
            TXN_Net: data.TotalNet,
            TXN_Tax: data.TotalTax,
          },
        ];
        break;
      case '5': // 對帳格式
        this.footerData = [
          {
            TXN_SaleAmt: data.TotalTXN_SaleAmt,
            TXN_Net: data.TotalNet,
            TXN_Tax: data.TotalTax,
          },
        ];
        break;
      case '6': // 二收及二電發票表-明細表
        this.footerData = [
          {
            group_name: '合計',
            TaxableTotalAmount: data.TaxableTotalAmount,
            TaxAmount: data.TaxAmount,
            TaxFreeAmount: data.TaxFreeAmount,
            ZeroTaxAmount: data.ZeroTaxAmount,
            SalesTotalAmount: data.SalesTotalAmount,
          },
        ];
        break;
      case '7': // 二收及二電發票表-彙總表
        this.footerData = [
          {
            ConvSalesTotalAmount: data.ConvSalesTotalAmount,
            ConvTaxableTotalAmount: data.ConvTaxableTotalAmount,
            ConvTaxAmount: data.ConvTaxAmount,
            ConvTaxFreeAmount: data.ConvTaxFreeAmount,
            ConvZeroTaxAmount: data.ConvZeroTaxAmount,
            VoidSalesTotalAmount: data.VoidSalesTotalAmount,
            VoidTaxableTotalAmount: data.VoidTaxableTotalAmount,
            VoidTaxAmount: data.VoidTaxAmount,
            VoidTaxFreeAmount: data.VoidTaxFreeAmount,
            VoidZeroTaxAmount: data.VoidZeroTaxAmount,
            GrandSalesTotalAmount: data.GrandSalesTotalAmount,
          },
        ];
        break;
      default:
        this.footerData = [
          {
            TXN_SaleAmt: data.TotalTXN_SaleAmt,
            TXN_SaleTax: data.TotalTXN_SaleTax,
            TXN_SaleNoTax: data.TotalTXN_SaleNoTax,
            TXN_Net: data.TotalNet,
            TXN_Tax: data.TotalTax,
          },
        ];
    }
  }

  /** 查詢 */
  onSubmit(frm: FormGroup): void {
    if (this.loading) return;

    this.handleSubmit(frm, () => {
      this.loading = true;
      const v = frm.value;

      // 在查詢時更新表格欄位配置
      this.columns = this.getColumnsByReportType(v.displayMode || '2');
      const isSummary = v.displayMode === '7';
      const payload = {
        // 彙總表不套用分頁，傳 0 取全部
        PageSize: isSummary ? 0 : (v.pageSize || 30),
        PageIndex: isSummary ? 0 : (v.pageIndex ?? 1),
        OrderBy: '',
        Offset: 0,
        SortBy: v.SortBy ?? [],
        TXN_DT_S: this.datePipe.transform(v.TXN_DT_S, 'yyyy-MM-dd'),
        TXN_DT_E: this.datePipe.transform(v.TXN_DT_E, 'yyyy-MM-dd'),
        ECR_No_S: v.ECR_No_S || '',
        ECR_No_E: v.ECR_No_E || '',
        Data_Source: v.Data_Source || '',
        INV_GUIType: v.INV_GUIType || '',
        IncludeExchange: v.IncludeExchange ? 1 : 0,
        ReportType: v.displayMode || '2',
      };

      this.fin15110Service
        .QueryFIN15110(payload)
        .pipe(finalize(() => (this.loading = false)))
        .subscribe({
          next: (res) => {
            if (res?.Data) {
              // 兼容 Data 是物件 或 陣列的情況
              const d = Array.isArray(res.Data) ? res.Data[0] : res.Data;

              this.data = d.FIN15110s ?? [];
              console.log('[FIN15110] response d keys:', Object.keys(d));
              // 彙總表不使用後端 TotalCount，直接以資料筆數呈現
              this.totalRecords = isSummary ? this.data.length : (d.TotalCount ?? this.data.length);

              // 根據 ReportType 設置不同的 footerData
              this.setFooterDataByReportType(d, v.displayMode);
            } else {
              this.data = [];
              this.footerData = [];
              this.totalRecords = 0;
            }
          },

        });
    });
  }

  /** 分頁／懶加載 */
  override onLazyLoadData(event: any): void {
    if (this.loading) return;

    this.queryForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy,
    });

    this.onSubmit(this.queryForm);
  }

  /** 匯出 PDF */
  onExportPDF(): void {
    this.exportReport(false);
  }

  /** 匯出 Excel */
  onExportExcel(): void {
    this.exportReport(true);
  }

  /** 匯出共用邏輯 */
  private exportReport(isExcel: boolean): void {
    if (isExcel) this.btnLoading2 = true;
    else this.btnLoading = true;

    const v = this.queryForm.value;
    const reportType = v.displayMode || '2';

    const startDate = v.TXN_DT_S;
    const endDate = v.TXN_DT_E;
    const isMerge = reportType === '2' ? false : true;

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: v.SortBy ?? [],
      TXN_DT_S: this.datePipe.transform(startDate, 'yyyy-MM-dd'),
      TXN_DT_E: this.datePipe.transform(endDate, 'yyyy-MM-dd'),
      ECR_No_S: v.ECR_No_S || '',
      ECR_No_E: v.ECR_No_E || '',
      Data_Source: v.Data_Source || '',
      INV_GUIType: v.INV_GUIType || '',
      IncludeExchange: v.IncludeExchange ? 1 : 0,
      ReportType: reportType,
      IsMerge: isMerge,
      IsExcel: isExcel,
    };

    console.log('匯出 payload (ReportType: ' + reportType + '):', payload);

    this.fin15110Service
      .printFIN15110(payload)
      .pipe(
        finalize(() => {
          if (isExcel) this.btnLoading2 = false;
          else this.btnLoading = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (!res || res.Status !== '0000') {
            this.messageService.errorBubble(res?.Message ?? '匯出失敗');
            return;
          }

          const url = res?.Data?.Print_URL;
          if (!url) {
            this.messageService.warnBubble('後端未回傳報表連結');
            return;
          }

          const fileUrl = `${environment.ApiUrl.replace(/\/$/, '')}${url}`;
          const a = document.createElement('a');
          a.href = fileUrl;
          a.setAttribute(
            'download',
            decodeURIComponent(
              url.split('/').pop() ??
              (isExcel ? '二電發票表.xlsx' : '二電發票表.pdf')
            )
          );
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          this.messageService.successBubble(
            `匯出 ${isExcel ? 'Excel' : 'PDF'} 成功`
          );
        },
      });
  }
}
