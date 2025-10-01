import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { formatAmount, formatDate } from '@shared/componentkit/table/table.model';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeQuickComponent } from '@shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import {
  QueryTLS57090Request,
  QueryTLS57090DetailResponse,
  QueryTLS57090SummaryResponse,
  Tls57090Service
} from '@service/api/tls/tls57090.service';
import { finalize } from 'rxjs';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { HttpResponse } from '@angular/common/http';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';

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
    CalendarRangeQuickComponent,
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
  }
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
  vendorOptions = this.dropdown.queryPos2013({ VEN_Flag: '' }); // 廠商下拉選單選項
  data: (QueryTLS57090DetailResponse | QueryTLS57090SummaryResponse)[] = [];
  columns: ReportColumn[] = [];

  btnLoading = false;
  historyRequestBody: QueryTLS57090Request | null = null;

  constructor(
    private readonly dropDownListService: DropDownListService,
    private readonly dropdown: DropdownApiService,
    public readonly tls57090Service: Tls57090Service,
    private datePipe: DatePipe
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
        { field: 'HOS_NAME', header: '倉別', visible: true, showSort: true },
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true, showSort: true },
        { field: 'ODM_Date', header: '申請日期', visible: true, showSort: true, format: formatDate },
        { field: 'APRV_Date', header: '審核日期', visible: true, showSort: true, format: formatDate },
        { field: 'ODM_No', header: '單號', visible: true, showSort: true },
        { field: 'ODM_Type', header: '單據類型', visible: true, showSort: true },
        { field: 'ODM_Status', header: '單據狀態', visible: true, showSort: true },
        { field: 'ODD_ConfirmQty', header: '數量', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyNet', header: '未稅金額', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyTax', header: '稅額', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyAmt', header: '應稅金額', visible: true, showSort: true, format: formatAmount },
      ];
      this.data = [];
    } else if (displayMode === 2) { // 明細模式
      this.columns = [
        { field: 'HOS_NAME', header: '倉別', visible: true, showSort: true },
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true, showSort: true },
        { field: 'ODM_Date', header: '申請日期', visible: true, showSort: true, format: formatDate },
        { field: 'APRV_Date', header: '審核日期', visible: true, showSort: true, format: formatDate },
        { field: 'ODM_No', header: '單號', visible: true, showSort: true },
        { field: 'ODM_Type', header: '單據類型', visible: true, showSort: true },
        { field: 'ODM_Status', header: '單據狀態', visible: true, showSort: true },
        { field: 'PLU_MagNo', header: '商品管理編號', visible: true, showSort: true },
        { field: 'PLU_Name', header: '品名', visible: true, showSort: true },
        { field: 'ODD_ConfirmQty', header: '數量', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_BuyNet', header: '未稅金額', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_BuyTax', header: '稅額', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_BuyAmt', header: '應稅金額', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_SalePrc', header: '售價', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_SaleAmt', header: '售價小計', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
      ];
      this.data = [];
    } else {
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
        pageSize: 30,
        SortBy: [{ field: 'ODM_No', order: 1 }],
      };

      this.tls57090Service.queryTLS57090(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        if (response.Data) {
          console.log('response', response);
          this.totalRecords = response.TotalCount || 0;
          this.footerTotal = response.GrandTotal;
          this.historyRequestBody = requestBody;
          this.data = response.Data;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        } else {
          this.data = [];
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
    this.btnLoading = true;
    this.tls57090Service.exportTLS57090PDF(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
    });
  }

  onExportXLSX() {
    if (!this.historyRequestBody) {
      this.messageService.warnBubble('請先執行查詢以產生報表。');
      return;
    }
    this.btnLoading = true;
    this.tls57090Service.exportTLS57090Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
    });
  }

  // 處理檔案匯出的通用邏輯
  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
    }
  }

  // 輔助方法：從 header 獲取檔名
  private getFilenameFromHeader(contentDisposition: string | null, defaultExtension: string): string {
    if (!contentDisposition) {
      return `download${defaultExtension}`;
    }

    const filenameStarMatch = /filename\*=([^;]+)/.exec(contentDisposition);
    if (filenameStarMatch && filenameStarMatch.length > 1) {
      const encodedFilename = filenameStarMatch[1];
      try {
        const decoded = decodeURIComponent(encodedFilename.replace(/^UTF-8''/, ''));
        return decoded;
      } catch (error) {
        console.error('Failed to decode filename*', error);
        return encodedFilename;
      }
    }

    const filenameMatch = /filename="([^"]+)"/.exec(contentDisposition);
    if (filenameMatch && filenameMatch.length > 1) {
      try {
        return decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
      } catch {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
