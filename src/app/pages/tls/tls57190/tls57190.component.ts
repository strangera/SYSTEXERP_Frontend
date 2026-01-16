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
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount } from '@shared/componentkit/table/table.model';
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
    DateFrom: [null, Validators.required],  // 存貨年月 - 必填
    DateTo: [null, Validators.required],    // 存貨年月 - 必填
    Mode: ['S' as 'S' | 'D', Validators.required],       // 查詢模式
    HOS_No: [null],                         // 倉別
    LOGO_No: [null],                        // 品牌
    PLU_MagNo: [null, [Validators.maxLength(20)]],                      // 管理編號
    PLU_No: [null, [Validators.maxLength(20)]],                         // 國際條碼
    PLU_Name: [null, [Validators.maxLength(50)]],                       // 商品名稱
    pageSize: [30],
    pageIndex: [1],
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
  selectedItems: TLS57190Data[] = [];
  totalRecords = 0;
  lastQueryBody: TLS57190QueryRequest | null = null;
  // 下拉選單選項
  HOS_NOOptions = this.dropdown.queryPos2034();
  LOGO_NoOptions = this.dropdown.queryPluLogo();
  ModeOptions = [
    { value: 'S', label: '彙總' },
    { value: 'D', label: '明細' },
  ];
  columns: ReportColumn[] = [
    { field: 'LOGO_No', header: '品牌', visible: true },
    { field: 'LOGO_CH_NAME', header: '品牌名稱', visible: true },
    { field: 'HOS_NAME', header: '倉別', visible: true },

    // 明細欄位
    { field: 'PLU_MagNo', header: '管理編號', visible: true },
    { field: 'PLU_No', header: '商品條碼', visible: true },
    { field: 'PLU_Name', header: '商品名稱', visible: true },

    // 數量成本資訊
    { field: 'BeginQty', header: '期初數量', visible: true, format: formatAmount },
    { field: 'BeginCost', header: '期初成本', visible: true, format: formatAmount },

    { field: 'InQty', header: '進貨數量', visible: true, format: formatAmount },
    { field: 'InCost', header: '進貨成本', visible: true, format: formatAmount },

    { field: 'SaleQty', header: '銷貨數量', visible: true, format: formatAmount },
    { field: 'SaleAmt', header: '銷貨收入', visible: true, format: formatAmount },
    { field: 'SaleCost', header: '銷貨成本', visible: true, format: formatAmount },

    { field: 'EndQty', header: '期末數量', visible: true, format: formatAmount },
    { field: 'EndCost', header: '期末成本', visible: true, format: formatAmount },

    { field: 'GrossProfit', header: '銷貨毛利', visible: true, format: formatAmount, isSubTotal: true },
    {
      field: 'GrossMarginPct',
      header: '毛利率%',
      visible: true,
      format: (val: number) => val ? val.toFixed(2) + '%' : '0.00%'
    },
  ];

  ngOnInit(): void {
    this.initializePage('TLS57190');
  }

  onSubmit(form: FormGroup) {
    this.handleSubmit(form, () => {
      const body = {
        ...form.getRawValue(),
        DateFrom: this.datepipe.transform(form.value.DateFrom, 'yyyy-MM-dd'),
        DateTo: this.datepipe.transform(form.value.DateTo, 'yyyy-MM-dd'),
      }
      this.tls57190Service.queryTLS57190(body).pipe(untilDestroyed(this), finalize(() => (this.loading = false))).subscribe(response => {
        this.data = response.Data;
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
