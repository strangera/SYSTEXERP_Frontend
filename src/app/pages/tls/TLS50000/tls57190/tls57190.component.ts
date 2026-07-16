import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TLS57190Data, TLS57190DetailRequest, TLS57190QueryRequest, TLS57190Service } from '@service/api/tls/tls57190.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ProductAutocompleteComponent } from '@shared/biz-components/product-autocomplete/product-autocomplete';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { ColumnGroup, ReportColumn } from '@shared/components/table-report/table-report.model';
import { Column, formatAmountCN } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize, map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-tls57190',
  templateUrl: './tls57190.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    CalendarRangeComponent,
    DropdownComponent,
    CommonModule,
    ButtonModule,
    TableReportComponent,
    InputTextComponent,
    ProductAutocompleteComponent
  ]
})
export class TLS57190Component extends BasicQueryPageComponent<TLS57190Data> implements OnInit {
  queryForm = this.formBuilder.group({
    DateFrom: [null, Validators.required],
    DateTo: [null, Validators.required],
    ShowType: ['M' as 'M' | 'D' | 'A', Validators.required], // 改回 Mode，預設 M (彙總)
    HOS_NO: [null],                                // 修正為 HOS_No
    LOGO_No: [null],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PLU_No: [null, [Validators.maxLength(20)]],
    PLU_Name: [null, [Validators.maxLength(60)]],
    pageSize: [30],
    pageIndex: [1],                                // SP 裡面註解寫從 1 開始
  });
  constructor(
    public readonly tls57190Service: TLS57190Service,
    private readonly datepipe: DatePipe,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService,
  ) {
    super();
  }
  currentDataKey = 'LOGO_No';
  data: TLS57190Data[] = [];
  footerData: TLS57190Data | null = null;
  selectedItems: TLS57190Data[] = [];
  totalRecords = 0;
  lastQueryBody: TLS57190QueryRequest | null = null;
  // 下拉選單選項
  HOS_NOOptions = this.dropdown.queryPos2034();
  LOGO_NoOptions = this.dropdown.queryPluLogo();
  ModeOptions = [
    { value: 'M', label: '彙總' },
    { value: 'D', label: '明細' },
    { value: 'A', label: '庫存異動明細' },
  ];
  columns: ReportColumn[] = [
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    // 明細欄位
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_No', header: '國際條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },

    // 數量成本資訊
    { field: 'BeginQty', header: '數量', visible: true, format: formatAmountCN, groupField: '期初', isSubTotal: true },
    { field: 'BeginCost', header: '成本', visible: true, format: formatAmountCN, groupField: '期初', isSubTotal: true },

    { field: 'InQty', header: '數量', visible: true, format: formatAmountCN, groupField: '進貨', isSubTotal: true },
    { field: 'InCost', header: '成本', visible: true, format: formatAmountCN, groupField: '進貨', isSubTotal: true },

    { field: 'InRtnQty', header: '數量', visible: true, format: formatAmountCN, groupField: '退貨', isSubTotal: true },
    { field: 'InRtnCost', header: '成本', visible: true, format: formatAmountCN, groupField: '退貨', isSubTotal: true },

    { field: 'SaleQty', header: '數量', visible: true, format: formatAmountCN, groupField: '銷貨', isSubTotal: true },
    { field: 'SaleCost', header: '成本', visible: true, format: formatAmountCN, groupField: '銷貨', isSubTotal: true },
    { field: 'TXN_Net', header: '售價', visible: true, format: formatAmountCN, groupField: '銷貨', isSubTotal: true },

    { field: 'EndQty', header: '數量', visible: true, format: formatAmountCN, groupField: '期末數量', isSubTotal: true },
    { field: 'EndCost', header: '成本', visible: true, format: formatAmountCN, groupField: '期末數量', isSubTotal: true },

    { field: 'EndSalePrcNet', header: '數量', visible: true, format: formatAmountCN, groupField: '期末售價' },
    { field: 'EndSalePrc', header: '成本', visible: true, format: formatAmountCN, groupField: '期末售價' },
    { field: 'AvgUnitCost', header: '平均成本', visible: true, format: formatAmountCN, isSubTotal: true },
    { field: 'SaleAmt', header: '銷貨合計', visible: true, format: formatAmountCN, isSubTotal: true },
    { field: 'GrossProfit', header: '銷貨毛利', visible: true, format: formatAmountCN, isSubTotal: true },
    {
      field: 'GrossMarginPct',
      header: '毛利率',
      visible: true,
      format: (val: number) => val ? val : '0.00%'
    },
  ];
  // 庫存異動明細 (ShowType = 'A') 專用的欄位
  detailMasterColumns: ReportColumn[] = [
    { field: 'HOS_No', header: '倉庫編號', visible: true },
    { field: 'HOS_NAME', header: '倉庫名稱', visible: true }, // 注意：Swagger Data 裡有 HOS_NAME
    { field: 'LOGO_No', header: '品牌編號', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },
    { field: 'VEN_No', header: '廠商編號', visible: true },
    { field: 'VEN_Name', header: '廠商名稱', visible: true },
  ];
  expansionColumns: Column[] = [];
  readonly DETAIL_COLUMNS: Column[] = [
    { field: 'DocDate', header: '單據日期', visible: true },
    { field: 'STK_TYPE', header: '單別', visible: true },
    { field: 'DocNo', header: '單據單號', visible: true },
    { field: 'MoveDate', header: '異動日期', visible: true },
    { field: 'MoveQty', header: '異動量', visible: true, format: formatAmountCN },
    { field: 'StockQty', header: '庫存量', visible: true, format: formatAmountCN },
    { field: 'SalePrice', header: '銷售單價', visible: true, format: formatAmountCN },
    { field: 'SaleChangeAmt', header: '銷售異動金額', visible: true, format: formatAmountCN },
    { field: 'SaleStockAmt', header: '銷售庫存金額', visible: true, format: formatAmountCN },
    { field: 'UnitCost', header: '單位成本', visible: true, format: formatAmountCN },
    { field: 'CostChangeAmt', header: '成本異動金額', visible: true, format: formatAmountCN },
    { field: 'CostStockAmt', header: '成本庫存金額', visible: true, format: formatAmountCN }
  ];

  originalColumns: ReportColumn[] = [];
  readonly ORIG_COLUMN_GROUP: ColumnGroup[] = [
    { field: '期初', header: '期初' },
    { field: '進貨', header: '進貨' },
    { field: '退貨', header: '退貨' },
    { field: '銷貨', header: '銷貨' },
    { field: '期末數量', header: '期末數量' },
    { field: '期末售價', header: '期末售價' },
  ];
  columnGroup: ColumnGroup[] = [...this.ORIG_COLUMN_GROUP];

  ngOnInit(): void {
    this.initializePage('TLS57190');
    this.originalColumns = [...this.columns];
  }
  queryProxy = (body: any) => {
    const showType = this.queryForm.get('ShowType')?.value;
    return showType === 'A'
      ? this.tls57190Service.queryTLS57190Detail_Master(body)
      : this.tls57190Service.queryTLS57190(body);
  }
  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const rawValue = form.getRawValue();
      const showType = rawValue.ShowType;

      const body = {
        ...rawValue,
        DateFrom: this.datepipe.transform(rawValue.DateFrom, 'yyyy-MM-dd'),
        DateTo: this.datepipe.transform(rawValue.DateTo, 'yyyy-MM-dd'),
        PLU_No: rawValue.PLU_No ? rawValue.PLU_No.trim() : null,
      };

      if (showType === 'A') {
        this.tls57190Service.queryTLS57190Detail_Master(body).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe(response => {
          this.currentDataKey = 'PLU_MagNo';
          this.columns = [...this.detailMasterColumns];
          this.columnGroup = []; // 清空 Group
          this.expansionColumns = [...this.DETAIL_COLUMNS];
          this.data = response.Data;
          this.totalRecords = response.TotalCount || response.Data?.length || 0;
          this.footerData = null;
          this.lastQueryBody = body;
        });
      } else {
        this.tls57190Service.queryTLS57190(body).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe(response => {
          this.currentDataKey = showType === 'M' ? 'LOGO_No' : 'PLU_MagNo';
          const isDetail = showType === 'D';
          // 1. 回復欄位與設定可見度
          this.columns = this.originalColumns.map(col => {
            const detailFields = ['PLU_MagNo', 'PLU_No', 'PLU_Name'];
            if (detailFields.includes(col.field)) {
              return { ...col, visible: isDetail };
            }
            return col;
          });

          // 2. 記得回復 Group 定義！
          this.columnGroup = [...this.ORIG_COLUMN_GROUP];
          this.expansionColumns = [];
          this.data = response.Data;
          this.footerData = {
            ...response.SumData,
            LOGO_No: '',
            LOGO_CH_NAME: '',
            EndSalePrcNet: '--',
            EndSalePrc: '--',
            AvgUnitCost: '--',
          };
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = body;
        });
      }
    });
  }
  // 實作展開載入邏輯
  expansionLoadFn = (rowData: any): Observable<any> => {
    const showType = this.queryForm.get('ShowType')?.value;

    if (showType === 'A') {
      const detailReq: TLS57190DetailRequest = {
        ...this.lastQueryBody,
        DateFrom: this.lastQueryBody?.DateFrom || '',
        DateTo: this.lastQueryBody?.DateTo || '',
        HOS_NO: rowData.HOS_No,
        LOGO_No: rowData.LOGO_No,
        PLU_MagNo: rowData.PLU_MagNo,
        PLU_No: null,
        PLU_Name: null,
        ShowType: 'A',
      };

      return this.tls57190Service.queryTLS57190Detail(detailReq).pipe(
        map(res => {
          if (res && res.Data && Array.isArray(res.Data)) {
            const dataLength = res.Data.length;

            const processedData = res.Data.map((item: any, index: number) => {
              // 判斷是否為最後一筆 (小計列)
              // 方式 1: 根據索引 (如果是最後一筆)
              // 方式 2: 根據 RowType (如果後端有回傳 RowType 區別，這通常更準確)
              const isLastRow = (index === dataLength - 1) || (item.RowType === 'S');

              if (isLastRow) {
                return {
                  ...item,
                  // 只有最後一筆的小計將這三個欄位清空
                  MoveQty: item.MoveQty === 0 ? '' : item.MoveQty,
                  SalePrice: item.SalePrice === 0 ? '' : item.SalePrice,
                  UnitCost: item.UnitCost === 0 ? '' : item.UnitCost
                };
              }
              // 非最後一筆則保持原樣
              return item;
            });

            return { ...res, Data: processedData };
          }
          return res;
        })
      );
    }
    return of({ Data: [] });
  };
  get exportFileName(): string {
    return this.lastQueryBody?.ShowType === 'A'
      ? '每日商品進銷存異動明細報表'
      : '每日商品進銷存報表';
  }
  btnLoading = false;
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.lastQueryBody.ShowType === 'A'
      ? this.tls57190Service.exportTLS57190DetailPDF(this.lastQueryBody as any)
      : this.tls57190Service.exportTLS57190PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }

    const export$ = this.lastQueryBody.ShowType === 'A'
      ? this.tls57190Service.exportTLS57190DetailExcel(this.lastQueryBody as any)
      : this.tls57190Service.exportTLS57190Excel(this.lastQueryBody);

    this.fileExportService.executeFileExport(
      export$.pipe(untilDestroyed(this)),
      '.xlsx',
      (isLoading) => this.btnLoading = isLoading
    ).subscribe();
  }
}
