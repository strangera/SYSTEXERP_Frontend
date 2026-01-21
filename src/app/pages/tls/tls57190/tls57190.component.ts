import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { IQueryPOS2004DetailResponse, Tls52010Service } from '@service/api/tls/tls52010.service';
import { TLS57190Data, TLS57190QueryRequest, TLS57190Service } from '@service/api/tls/tls57190.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropdownTableComponent, FieldsConfig } from '@shared/componentkit/dropdown-table/dropdown-table.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmountCN } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';

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
    CalendarRangeQuickComponent,
    DropdownComponent,
    CommonModule,
    ButtonModule,
    TableReportComponent,
    DropdownTableComponent,
    InputTextComponent
  ]
})
export class TLS57190Component extends BasicQueryPageComponent<TLS57190Data> implements OnInit {
  queryForm = this.formBuilder.group({
    DateFrom: [null, Validators.required],
    DateTo: [null, Validators.required],
    ShowType: ['M' as 'M' | 'D', Validators.required], // 改回 Mode，預設 M (彙總)
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
    private readonly tls52010Service: Tls52010Service
  ) {
    super();
  }
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

  columnGroup: ColumnGroup[] = [
    { field: '期初', header: '期初' },
    { field: '進貨', header: '進貨' },
    { field: '退貨', header: '退貨' },
    { field: '銷貨', header: '銷貨' },
    { field: '期末數量', header: '期末數量' },
    { field: '期末售價', header: '期末售價' },
  ]

  ngOnInit(): void {
    this.initializePage('TLS57190');
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const rawValue = form.getRawValue();

      const body = {
        ...rawValue,
        DateFrom: this.datepipe.transform(rawValue.DateFrom, 'yyyy-MM-dd'),
        DateTo: this.datepipe.transform(rawValue.DateTo, 'yyyy-MM-dd'),
        PLU_No: rawValue.PLU_No ? rawValue.PLU_No.trim() : null,
      };

      this.tls57190Service.queryTLS57190(body)
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false))
        )
        .subscribe(response => {
          // --- 動態調整欄位顯示邏輯 ---
          const isDetail = body.ShowType === 'D';
          this.columns = this.columns.map(col => {
            // 定義哪些欄位是明細專屬
            const detailFields = ['PLU_MagNo', 'PLU_No', 'PLU_Name'];
            if (detailFields.includes(col.field)) {
              return { ...col, visible: isDetail };
            }
            return col;
          });

          // 依照你的要求，維持此寫法
          this.data = response.Data;
          this.footerData = {
            ...response.SumData,
            LOGO_No: '',
            LOGO_CH_NAME: '',
            EndSalePrcNet: '--',
            EndSalePrc: '--',
            AvgUnitCost: '--',
          }
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = body;
        });
    });
  }
  btnLoading = false;
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57190Service.exportTLS57190PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57190Service.exportTLS57190Excel(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }

  // 管理編號
  suggestions: IQueryPOS2004DetailResponse[] = [];
  fieldsConfig: FieldsConfig[] = [
    { field: 'PLU_MagNo', header: '商品管理編號/國際條碼/廠商貨號', mainDataField: true },
  ];
  onAutoCompleteInputChange(event: any) {
    const inputString = event.PLU_MagNo || '';
    const body = {
      ...event,
      VEN_No: '',
      LOGO_No: '',
      queryNo: inputString,
      pageSize: 30,
      pageIndex: 1,
      SortBy: [{ field: 'PLU_MagNo', order: 1 }],
    }
    this.tls52010Service.queryPOS2004Detail(body).pipe(untilDestroyed(this)).subscribe((results) => {
      this.suggestions = results.Data.map(item => ({
        ...item,
        label: `${item.PLU_MagNo} - ${item.PLU_Name} - ${item.PLU_No} - ${item.PLU_OrgPLUNo}`,
      }));
    });
  }
}
