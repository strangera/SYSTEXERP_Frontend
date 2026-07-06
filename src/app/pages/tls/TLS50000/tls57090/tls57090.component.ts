import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  QueryTLS57090DetailResponse,
  QueryTLS57090Request,
  QueryTLS57090SummaryResponse,
  Tls57090Service
} from '@service/api/tls/tls57090.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { FileExportService } from '@shared/service/file-export.service';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls57090',
  templateUrl: './tls57090.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    MultiSelectComponent,
    CalendarRangeComponent,
    ButtonComponent,
    TranslateModule,
    ButtonModule,
    TableReportComponent,
    AsyncPipe
  ],
  providers: [DatePipe]
})
export class TLS57090Component extends BasicQueryPageComponent<QueryTLS57090DetailResponse | QueryTLS57090SummaryResponse> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    HOS_No: [null],
    LOGO_No: [null],
    VEN_No: [null],
    ODM_Date_Start: [null],
    ODM_Date_End: [null],
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    ODM_Type: [null],
    Status: [null],
    DisplayMode: [1, [Validators.required]],
  });
  totalRecords = 0;
  footerTotal?: {
    ODD_ConfirmQty: string, ODD_BuyNet?: string, ODD_BuyTax?: string, ODD_BuyAmt?: string, ODD_SalePrc?: string, ODD_SaleAmt?: string, ODM_TotalBuyNet?: string, ODM_TotalBuyTax?: string, ODM_TotalBuyAmt?: string
  } | null;
  documentTypeOptions = [
    { value: 1, label: '進貨單' },
    { value: 2, label: '退貨單' }
  ];
  documentStatusOptions = [
    { value: '1', label: '已申請' },
    { value: '2', label: '已審核' },
    { value: '9', label: '已作廢' },
  ];
  displayModeOptions = [
    { value: 1, label: '彙總' },
    { value: 2, label: '明細' },
  ];
  warehouseOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];
  vendorOptions = this.dropdown.queryPos2013TltTalent(); // 廠商下拉選單選項
  data: (QueryTLS57090DetailResponse | QueryTLS57090SummaryResponse)[] = [];
  columns: ReportColumn[] = [];

  btnLoading = false;
  historyRequestBody: QueryTLS57090Request | null = null;

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly dropdown: DropdownApiService,
    public readonly tls57090Service: Tls57090Service,
    private readonly datePipe: DatePipe,
    private readonly fileExportService: FileExportService
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57090', 'tls/tls57090cru');

    this.queryForm.controls.DisplayMode.valueChanges.pipe(untilDestroyed(this)).subscribe(mode => {
      this.updateTableColumns(mode);
    });
    this.updateTableColumns(this.queryForm.controls.DisplayMode.value);

    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandCodeOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  updateTableColumns(displayMode: number | null) {
    if (displayMode === 1) { // 彙總模式
      this.columns = [
        { field: 'HOS_No', header: '倉別代號', width: '55px' },
        { field: 'HOS_NAME', header: '倉別名稱', align: 'left', width: '55px' },
        { field: 'LOGO_No', header: '品牌代號', width: '55px' },
        { field: 'LOGO_CH_NAME', header: '品牌名稱', align: 'left', width: '150px' },
        { field: 'ODM_Date', header: '申請日期', format: formatDate, width: '70px' },
        { field: 'APRV_Date', header: '審核日期', format: formatDate, width: '70px' },
        { field: 'ODM_No', header: '單號', width: '110px' },
        { field: 'ODM_Type', header: '單據類型', width: '70px' },
        { field: 'ODM_Status', header: '單據狀態', width: '70px' },
        { field: 'ODD_ConfirmQty', header: '數量', format: formatAmount, align: 'right', width: '80px' },
        { field: 'ODM_TotalBuyNet', header: '未稅金額', format: formatAmount, align: 'right', width: '150px' },
        { field: 'ODM_TotalBuyTax', header: '稅額', format: formatAmount, align: 'right', width: '90px' },
        { field: 'ODM_TotalBuyAmt', header: '應稅金額', format: formatAmount, align: 'right', width: '150px' },
      ];
      this.footerTotal = null;
      this.data = [];
    } else if (displayMode === 2) { // 明細模式
      this.columns = [
        { field: 'HOS_NAME', header: '倉別', width: '55px' },
        { field: 'LOGO_CH_NAME', header: '品牌', width: '150px' },
        { field: 'ODM_Date', header: '申請日期', format: formatDate, width: '70px' },
        { field: 'APRV_Date', header: '審核日期', format: formatDate, width: '70px' },
        { field: 'ODM_No', header: '單號', width: '110px' },
        { field: 'ODM_Type', header: '單據類型', width: '70px' },
        { field: 'ODM_Status', header: '單據狀態', width: '70px' },
        { field: 'PLU_MagNo', header: '商品管理編號', width: '95px' },
        { field: 'PLU_Name', header: '商品名稱', align: 'left' },
        { field: 'ODD_ConfirmQty', header: '數量', format: formatAmount, isSubTotal: true, align: 'right', width: '80px' },
        { field: 'ODD_BuyNet', header: '未稅金額', format: formatAmount, isSubTotal: true, align: 'right', width: '110px' },
        { field: 'ODD_BuyTax', header: '稅額', format: formatAmount, isSubTotal: true, align: 'right', width: '90px' },
        { field: 'ODD_BuyAmt', header: '應稅金額', format: formatAmount, isSubTotal: true, align: 'right', width: '110px' },
        { field: 'ODD_SalePrc', header: '售價', format: formatAmount, isSubTotal: true, align: 'right', width: '100px' },
        { field: 'ODD_SaleAmt', header: '售價小計', format: formatAmount, isSubTotal: true, align: 'right', width: '130px' },
      ];
      this.footerTotal = null;
      this.data = [];
    } else {
      this.footerTotal = null;
      this.columns = [];
      this.data = [];
    }
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const displayMode = formValue.DisplayMode;
      const requestBody: QueryTLS57090Request = {
        ReportType: displayMode === 1 ? '彙總' : '明細',
        HOS_No: formValue.HOS_No,
        LOGO_No: formValue.LOGO_No,
        VEN_No: formValue.VEN_No,
        ODM_Date_Start: formValue.ODM_Date_Start ? this.datePipe.transform(formValue.ODM_Date_Start, 'yyyy-MM-dd') ?? undefined : undefined,
        ODM_Date_End: formValue.ODM_Date_End ? this.datePipe.transform(formValue.ODM_Date_End, 'yyyy-MM-dd') ?? undefined : undefined,
        APRV_Date_Start: formValue.APRV_Date_Start ? this.datePipe.transform(formValue.APRV_Date_Start, 'yyyy-MM-dd') ?? undefined : undefined,
        APRV_Date_End: formValue.APRV_Date_End ? this.datePipe.transform(formValue.APRV_Date_End, 'yyyy-MM-dd') ?? undefined : undefined,
        ODM_Type: formValue.ODM_Type,
        Status: formValue.Status,
        pageIndex: 1,
        pageSize: 500,
        SortBy: [{ field: 'ODM_No', order: 1 }],
      };

      this.tls57090Service.queryTLS57090(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Data) {
          this.totalRecords = response.TotalCount || 0;
          this.footerTotal = response.GrandTotal;
          this.historyRequestBody = requestBody;
          this.data = response.Data;
        } else {
          this.data = [];
          this.footerTotal = null;
          this.totalRecords = 0;
          this.messageService.warnBubble(response.Message || '沒有找到符合條件的資料。');
        }
      });
    });
  }

  onExportPDF() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57090Service.exportTLS57090PDF(this.historyRequestBody);

    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.pdf', (isLoading) => this.btnLoading = isLoading, `${this.ProgNo}_產出進貨退貨單據統計表_${this.getTimestamp()}`).subscribe();
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    const export$ = this.tls57090Service.exportTLS57090Excel(this.historyRequestBody);
    this.fileExportService.executeFileExport(export$.pipe(untilDestroyed(this)), '.xlsx', (isLoading) => this.btnLoading = isLoading, `${this.ProgNo}_產出進貨退貨單據統計表_${this.getTimestamp()}`).subscribe();
  }

  private getTimestamp(): string {
    const now = new Date();
    return now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0');
  }
}
