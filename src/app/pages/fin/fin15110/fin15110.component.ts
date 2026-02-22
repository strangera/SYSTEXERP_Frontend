import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FIN15110Service } from '@service/api/fin/fin15110.service';
import { CustomFooterTableComponent } from '@shared/componentkit/custom-footer-table/customFooterTable.component';
import { DropdownRangeComponent } from '@shared/componentkit/dropdown-range/dropdown-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import {
  Column,
  createPaginationConfig,
  formatAmount,
  formatDate,
} from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
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
    CalendarRangeQuickComponent,
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
    DropdownComponent
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
    DataType: [['1', '2'] as string[]],
    displayMode: ['1'],
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

  /** 下拉選項 */
  ECRNoOptions: IDropdownItem[] = [];
  DATE_TYPEOptions = [
    { label: '開立', value: '1' },
    { label: '作廢', value: '2' },
  ];
  displayModeOptions = [
    { value: '1', label: '二電發票表' },
    { value: '2', label: '發票報表依機台加總' },
    { value: '3', label: '發票報表依機台明細' },
    { value: '4', label: '跨日作廢發票報表' },
    { value: '5', label: '跨期作廢發票報表' },
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
        header: '銷售金額',
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
            header: '銷售金額',
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

      default:
        // 預設使用 ReportType 1 的欄位
        return this.getColumnsByReportType('1');
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
    this.columns = this.getColumnsByReportType(this.queryForm.value.displayMode || '1');

    this.setupDisplayModeWatcher();
    // 根據目前 displayMode 設定初始欄位狀態
    this.updateControlsByDisplayMode(this.queryForm.value.displayMode || '1');
  }

  /** 監聽報表類型變化，自動調整日期範圍 */
  private setupDisplayModeWatcher(): void {
    this.queryForm.get('displayMode')?.valueChanges.subscribe(value => {
      // 更新欄位啟用/停用狀態
      this.updateControlsByDisplayMode(value);
      // 當為 2/3 時自動把結束日設為起始日（UI 會把結束日停用）
      if (value === '2' || value === '3') {
        const startDate = this.queryForm.get('TXN_DT_S')?.value;
        if (startDate) {
          this.queryForm.patchValue({ TXN_DT_E: startDate }, { emitEvent: false });
        }
      }
      // 同步欄位配置（表格欄位會隨報表格式切換）
      this.columns = this.getColumnsByReportType(value || '1');
    });
  }

  /** 根據 displayMode 啟用 / 停用查詢欄位 */
  private updateControlsByDisplayMode(mode: string): void {
    const ecrS = this.queryForm.get('ECR_No_S');
    const ecrE = this.queryForm.get('ECR_No_E');
    const dataType = this.queryForm.get('DataType');
    const txnEs = this.queryForm.get('TXN_DT_E');

    if (!ecrS || !ecrE || !dataType || !txnEs) return;

    switch (mode) {
      case '1': // 二電發票表: ECR 起訖、資料種類、結束日 都可用
        ecrS.enable({ emitEvent: false });
        ecrE.enable({ emitEvent: false });
        dataType.enable({ emitEvent: false });
        txnEs.enable({ emitEvent: false });
        break;
      case '2':
      case '3': // 發票報表依機台加總/明細: 起始銷售日期為主要搜尋欄位，可使用收銀機號，資料種類不可用，結束日可輸入
        ecrS.enable({ emitEvent: false });
        ecrE.enable({ emitEvent: false });
        dataType.disable({ emitEvent: false });
        // 清除 DataType 值
        dataType.patchValue([], { emitEvent: false });
        txnEs.enable({ emitEvent: false });
        break;
      case '4':
      case '5': // 跨日/跨期作廢發票報表: 收銀機號與資料種類不可使用
        ecrS.disable({ emitEvent: false });
        ecrE.disable({ emitEvent: false });
        ecrS.patchValue('', { emitEvent: false });
        ecrE.patchValue('', { emitEvent: false });
        dataType.disable({ emitEvent: false });
        dataType.patchValue([], { emitEvent: false });
        txnEs.enable({ emitEvent: false });
        break;
      default:
        // 預設行為，啟用所有
        ecrS.enable({ emitEvent: false });
        ecrE.enable({ emitEvent: false });
        dataType.enable({ emitEvent: false });
        txnEs.enable({ emitEvent: false });
        break;
    }
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
      this.columns = this.getColumnsByReportType(v.displayMode || '1');
      const payload = {
        PageSize: v.pageSize || 30,
        PageIndex: v.pageIndex ?? 1,
        OrderBy: '',
        Offset: 0,
        SortBy: v.SortBy ?? [],
        TXN_DT_S: this.datePipe.transform(v.TXN_DT_S, 'yyyy-MM-dd'),
        TXN_DT_E: this.datePipe.transform(v.TXN_DT_E, 'yyyy-MM-dd'),
        DataType: v.DataType || [],
        ECR_No_S: v.ECR_No_S || '',
        ECR_No_E: v.ECR_No_E || '',
        ReportType: v.displayMode || '1', // 根據選擇的報表格式添加 ReportType 參數
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
              this.totalRecords = d.TotalCount ?? this.data.length;

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
    const reportType = v.displayMode || '1';

    // ReportType "2" 需要確保日期為同一天
    const startDate = v.TXN_DT_S;
    let endDate = v.TXN_DT_E;

    if (reportType === '2' || reportType === '3') {
      // 發票報表一機台加總/明細需要同一天的日期
      endDate = startDate;
    }

    // ReportType "2" 可能需要不同的參數配置
    const isMerge = reportType === '2' ? false : true;

    const payload = {
      PageSize: 0,
      PageIndex: 0,
      OrderBy: '',
      Offset: 0,
      SortBy: v.SortBy ?? [],
      TXN_DT_S: this.datePipe.transform(startDate, 'yyyy-MM-dd'),
      TXN_DT_E: this.datePipe.transform(endDate, 'yyyy-MM-dd'),
      DataType: v.DataType || [],
      ECR_No_S: v.ECR_No_S || '',
      ECR_No_E: v.ECR_No_E || '',
      ReportType: reportType, // 添加報表類型參數
      IsMerge: isMerge, // ReportType "2" 使用 false，其他使用 true
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
