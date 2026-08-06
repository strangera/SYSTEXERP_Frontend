import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { QueryTLS57100DetailResponse, QueryTLS57100Request, QueryTLS57100SummaryResponse, Tls57100Service } from '@service/api/tls/tls57100.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { Column, formatAmount, formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-tls57100',
  templateUrl: './tls57100.component.html',
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
    InputTextComponent,
    TableReportComponent,
    AsyncPipe
  ],
  providers: [DatePipe]
})
export class TLS57100Component extends BasicQueryPageComponent<QueryTLS57100DetailResponse | QueryTLS57100SummaryResponse> implements OnInit {
  queryForm = this.formBuilder.group({
    HOS_No: [null],
    LOGO_No: [null],
    VEN_No: [''],
    ODM_Date_Start: [null], // 修正為 ODM_Date_Start
    ODM_Date_End: [null], // 修正為 ODM_Date_End
    APRV_Date_Start: [null],
    APRV_Date_End: [null],
    ODM_Type: [null],
    Status: [null],
    ODM_No: ['', Validators.maxLength(16)],
    DisplayMode: [1, [Validators.required]],
  });
  totalRecords = 0;
  footerTotal: any
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
  warehouseOptions = this.dropdown.queryPos2034();
  brandCodeOptions = this.dropdown.queryPluLogo();
  vendorOptions = this.dropdown.queryPos2013TltTalent();
  data: (QueryTLS57100DetailResponse | QueryTLS57100SummaryResponse)[] = [];
  columns: Column[] = [];

  btnLoading = false;
  historyRequestBody: QueryTLS57100Request | null = null;

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls57100Service: Tls57100Service,
    private datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS57100', 'tls/tls57100cru');

    this.queryForm.controls.DisplayMode.valueChanges.pipe(untilDestroyed(this)).subscribe(mode => {
      this.updateTableColumns(mode);
    });
    this.updateTableColumns(this.queryForm.controls.DisplayMode.value);
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
        { field: 'ODD_SalePrc', header: '售價', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalSaleAmt', header: '售價小計', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyNet', header: '未稅金額', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyTax', header: '稅額', visible: true, showSort: true, format: formatAmount },
        { field: 'ODM_TotalBuyAmt', header: '應稅金額', visible: true, showSort: true, format: formatAmount },
      ];
      this.footerTotal = null;
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
        { field: 'PLU_Name', header: '商品名稱', visible: true, showSort: true },
        { field: 'ODD_ConfirmQty', header: '數量', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_SalePrc', header: '售價', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_SaleAmt', header: '售價小計', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_BuyNet', header: '未稅金額', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_BuyTax', header: '稅額', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
        { field: 'ODD_BuyAmt', header: '應稅金額', visible: true, showSort: true, format: formatAmount, isSubTotal: true },
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

      const requestBody: QueryTLS57100Request = {
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
        ODM_No: formValue.ODM_No,
        pageIndex: 1,
        pageSize: 500,
      };
      this.tls57100Service.queryTLS57100(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response: any) => {
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
    this.btnLoading = true;
    this.tls57100Service.exportTLS57100PDF(this.historyRequestBody).pipe(untilDestroyed(this), finalize(() => this.btnLoading = false)).subscribe({
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
    this.tls57100Service.exportTLS57100Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
    });
  }

  private handleFileExport(response: HttpResponse<Blob>, fileExtension: string): void {
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = this.getFilenameFromHeader(contentDisposition, fileExtension);
    const blob = response.body;

    if (blob && blob.size > 0) {
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
    }
  }

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
      } catch (error) {
        return filenameMatch[1];
      }
    }

    return `download${defaultExtension}`;
  }
}
