import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { Tls57010DataItem, Tls57010Request, Tls57010Service } from '@service/api/tls/tls57010.service';
import { Tls57040Service } from '@service/api/tls/tls57040.service';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { convertDateToYYYYMM, formatAmount } from '@others/component/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { ProductAutocompleteComponent } from 'src/app/shared/biz-components/product-autocomplete/product-autocomplete';
@Component({
  selector: 'app-tls57010',
  templateUrl: './tls57010.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectComponent,
    ButtonComponent,
    ButtonModule,
    TranslateModule,
    AsyncPipe,
    DropdownComponent,
    CalendarRangeComponent,
    InputTextComponent,
    TableReportComponent,
    ProductAutocompleteComponent
  ],
})
export class TLS57010Component extends BasicQueryPageComponent<Tls57010DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    pageIndex: [1],
    pageSize: [500],
    SortBy: [[{ field: 'PO_No', order: 1 }]], // 預設排序
    APPLY_Date_Start: [new Date()],
    APPLY_Date_End: [new Date()],
    PO_NO: [null, [Validators.maxLength(16)]],
    VEN_No: [null],
    PLU_MagNo: [null, [Validators.maxLength(20)]],
    PO_StatusList: [null],
    LOGO_NoList: [null],
    ShowType: ['M', [Validators.required]],
  });
  VEN_NoOptions = this.dropdown.queryPos2013TltTalent(); // 廠商選項
  PO_StatusListOptions = getSYS1000Options('PO_Status');
  LOGO_NoListOptions = this.dropdown.queryPluLogo(); // 品牌選項
  showTypeOptions = [
    { label: '彙總', value: 'M' },
    { label: '明細', value: 'D' },
  ]
  totalRecords = 0;
  lastQueryBody: Tls57010Request | null = null;
  DetailSumData: Tls57010DataItem[] = [];
  footerData: Tls57010DataItem[] = [];
  data: Tls57010DataItem[] = [];
  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [
    { field: 'POD', header: '採購金額' },
  ]
  btnLoading = false;
  constructor(
    public readonly tls57040Service: Tls57040Service,
    public readonly tls57010Service: Tls57010Service,
    private readonly dropdown: DropdownApiService,
    private readonly fileExportService: FileExportService,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57010');
  }
  updateTableColumns(displayMode: string | null) {
    if (displayMode === 'M') { // 彙總模式
      this.columns = [
        // 採購單資訊 (作為彙總依據)
        { field: 'APPLY_Date', header: '採購日期' },
        { field: 'PO_No', header: '採購單號' },
        { field: 'SYS_Name', header: '單據狀態' }, // 明細/總會都有
        // 彙總數量 (明細和彙總都有這些欄位)
        { field: 'OrderedQty', header: '採購量', format: formatAmount, isSubTotal: true },
        { field: 'ReceivedQty', header: '已進量', format: formatAmount, isSubTotal: true },
        // 彙總金額
        { field: 'POD_BuyNet', header: '進價(未稅)', format: formatAmount, isSubTotal: true, groupField: 'POD' },
        { field: 'POD_SaleAmt', header: '定價(含稅)', format: formatAmount, isSubTotal: true, groupField: 'POD' },
      ];
    } else if (displayMode === 'D') { // 明細模式
      this.columns = [
        // 基本資訊
        { field: 'APPLY_Date', header: '採購日期' }, // 明細/總會都有
        { field: 'PO_No', header: '採購單號' },     // 明細/總會都有
        { field: 'SYS_Name', header: '單據狀態' }, // 明細/總會都有
        // 商品資訊 (明細獨有)
        { field: 'PLU_No', header: '國際條碼' },
        { field: 'PLU_MagNo', header: '管理編號' },
        { field: 'PLU_Name', header: '品名' },
        // 數量
        { field: 'OrderedQty', header: '採購量', format: formatAmount, isSubTotal: true, isTotal: true },
        { field: 'ReceivedQty', header: '已進量', format: formatAmount, isSubTotal: true, isTotal: true },
        // 金額
        { field: 'POD_BuyNet', header: '進價(未稅)', format: formatAmount, isSubTotal: true, groupField: 'POD' },
        { field: 'POD_SaleAmt', header: '定價(含稅)', format: formatAmount, isSubTotal: true, groupField: 'POD' },
      ];
    } else {
      this.columns = [];
      this.data = [];
    }
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        STK_YM: convertDateToYYYYMM(frm.value.STK_YM),
        APPLY_Date_Start: this.datePipe.transform(frm.value.APPLY_Date_Start, 'yyyy-MM-dd') || undefined,
        APPLY_Date_End: this.datePipe.transform(frm.value.APPLY_Date_End, 'yyyy-MM-dd') || undefined,
        SortBy: frm.value.ShowType === 'M' ?
          [{ field: 'APPLY_Date', order: 1 }, { field: 'PO_No', order: 1 }]
          : [{ field: 'PO_No', order: 1 }, { field: 'PLU_MagNo', order: 1 }],
      }
      this.tls57010Service.queryTLS57010(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((res) => {
        this.DetailSumData = res.DetailSumData;
        this.lastQueryBody = body;
        this.footerData = res.SumData;
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.updateTableColumns(frm.value.ShowType);
      })
    })
  }
  onExportPDF() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57010Service.exportTLS57010PDF(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
  onExportXLSX() {
    if (!this.lastQueryBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57010Service.exportTLS57010(this.lastQueryBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading).subscribe();
  }
}
