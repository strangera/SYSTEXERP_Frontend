import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DropDownListService, IDropdownItem } from '@service/utility/dropDownList.service';
import { MenubarComponent } from '@shared/components/menubar/menubar.component';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { CalendarRangeComponent } from '@shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/components/dropdown/dropdown.component';
import { MultiSelectComponent } from '@shared/components/multi-select/multi-select.component';
import { TableReportComponent } from '@shared/components/table-report/table-report.component';
import { formatAmountWithDecimals, ReportColumn } from '@shared/components/table-report/table-report.model';
import { formatDate } from '@others/component/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox'; // 引入 Checkbox 模組
import { finalize } from 'rxjs';

// TLS57150 專屬匯入
import {
  QueryTLS57150DetailGrandTotal,
  QueryTLS57150DetailResponse,
  QueryTLS57150DetailSubTotal,
  QueryTLS57150Request,
  QueryTLS57150SummaryResponse,
  QueryTLS57150SummaryTotal,
  Tls57150Service
} from '@service/api/tls/tls57150.service';

// 引入商品下拉表格所需的組件和服務
import { InputTextComponent } from '@shared/components/input-text/input-text.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ProductAutocompleteComponent } from 'src/app/shared/biz-components/product-autocomplete/product-autocomplete';

@Component({
  selector: 'app-tls57150',
  templateUrl: './tls57150.component.html',
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
    CheckboxModule, // 新增 Checkbox 模組
    InputTextComponent, // 新增 InputText
    RadioButtonModule,
    ProductAutocompleteComponent
  ],
  providers: [DatePipe]
})
// 繼承 BasicQueryPageComponent 並使用 150 的回傳類型
export class TLS57150Component extends BasicQueryPageComponent<QueryTLS57150DetailResponse | QueryTLS57150SummaryResponse> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    HOS_No: [null as string[] | null], // 倉別代碼
    LOGO_No: [null as string[] | null], // 品牌代碼
    PST_Date_Start: [new Date(), [Validators.required]], // 盤點調整日期起
    PST_Date_End: [new Date(), [Validators.required]], // 盤點調整日期迄
    PST_NO: ['', [Validators.maxLength(20)]], // 盤點單號
    PLU_MagNo: [null, [Validators.maxLength(20)]], // 商品管理編號 (單選)
    IsOnlyShowDiff: [true], // 是否只顯示差異 (預設為 true)
    DisplayMode: [1, [Validators.required]], // 1: 彙總, 2: 明細
  });

  totalRecords = 0;
  // 總計資料模型改為 150 的結構
  footerTotal?: QueryTLS57150DetailGrandTotal | QueryTLS57150SummaryTotal;

  displayModeOptions = [
    { value: 1, label: '彙總' },
    { value: 2, label: '明細' },
  ];

  warehouseOptions: IDropdownItem[] = [];
  brandCodeOptions: IDropdownItem[] = [];

  // 數據模型變更為 150 的回傳類型
  data: (QueryTLS57150DetailResponse | QueryTLS57150SummaryResponse)[] = [];
  columns: ReportColumn[] = [];

  btnLoading = false;
  historyRequestBody: QueryTLS57150Request | null = null;
  subTotalData: QueryTLS57150DetailSubTotal[] = [];

  constructor(
    private readonly dropDownListService: DropDownListService,
    public readonly tls57150Service: Tls57150Service, // 替換為 150 Service
    private datePipe: DatePipe,
  ) { super(); } // 傳遞 formBuilder 給父類別

  ngOnInit(): void {
    this.initializePage('TLS57150'); // 更改程式代號

    this.queryForm.controls.DisplayMode.valueChanges.pipe(untilDestroyed(this)).subscribe(mode => {
      this.updateTableColumns(mode);
    });
    this.updateTableColumns(this.queryForm.controls.DisplayMode.value);

    // 載入倉別和品牌代碼選項
    this.dropDownListService.getPOS2034Options().pipe(untilDestroyed(this)).subscribe(response => {
      this.warehouseOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
    this.dropDownListService.queryPLULOGO_DropDownList().pipe(untilDestroyed(this)).subscribe(response => {
      this.brandCodeOptions = response.Data.map(item => ({ ...item, label: `${item.No} - ${item.Name}` }));
    });
  }

  /**
   * 根據顯示模式切換表格欄位
   * @param displayMode 1: 彙總, 2: 明細
   */
  updateTableColumns(displayMode: number | null) {
    if (displayMode === 1) { // 彙總模式 (QueryTLS57150SummaryResponse)
      this.columns = [
        { field: 'HOS_NAME', header: '倉別', visible: true },
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true },
        { field: 'PST_Date', header: '盤點日期', visible: true, format: formatDate },
        { field: 'PST_NO', header: '盤點單號', visible: true },
        { field: 'DIFF_Qty', header: '盤差數量', visible: true },
        { field: 'DIFF_AMT', header: '盤差成本', visible: true, format: (v) => formatAmountWithDecimals(v) },
        { field: 'DIFF_SalePrc', header: '盤差售價', visible: true, format: (v) => formatAmountWithDecimals(v) },
      ];
      this.data = [];
      this.totalRecords = 0;
      this.subTotalData = [];
      this.footerTotal = undefined;
    } else if (displayMode === 2) { // 明細模式 (QueryTLS57150DetailResponse)
      this.columns = [
        { field: 'HOS_NAME', header: '倉別', visible: true },
        { field: 'LOGO_CH_NAME', header: '品牌', visible: true },
        { field: 'PST_Date', header: '盤點日期', visible: true, format: formatDate },
        { field: 'PST_NO', header: '盤點單號', visible: true },
        { field: 'PLU_MagNo', header: '商品管理編號', visible: true },
        { field: 'PLU_Name', header: '商品名稱', visible: true },
        { field: 'DIFF_Qty', header: '盤差數量', visible: true, isSubTotal: true },
        { field: 'DIFF_AMT', header: '盤差成本', visible: true, format: (v) => formatAmountWithDecimals(v), isSubTotal: true },
        { field: 'DIFF_SalePrc', header: '盤差售價', visible: true, format: (v) => formatAmountWithDecimals(v), isSubTotal: true },
      ];
      this.data = [];
      this.totalRecords = 0;
      this.subTotalData = [];
      this.footerTotal = undefined;
    } else {
      this.columns = [];
      this.data = [];
      this.totalRecords = 0;
      this.subTotalData = [];
      this.footerTotal = undefined;
    }
  }

  /**
   * 執行查詢
   * @param frm 查詢表單
   */
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const displayMode = formValue.DisplayMode;

      // 調整 Request Body 以符合 QueryTLS57150Request
      const requestBody: QueryTLS57150Request = {
        ReportType: displayMode === 1 ? '彙總' : '明細',
        HOS_No: formValue.HOS_No,
        LOGO_No: formValue.LOGO_No,
        PST_Date_Start: formValue.PST_Date_Start ? this.datePipe.transform(formValue.PST_Date_Start, 'yyyy-MM-dd') ?? undefined : undefined,
        PST_Date_End: formValue.PST_Date_End ? this.datePipe.transform(formValue.PST_Date_End, 'yyyy-MM-dd') ?? undefined : undefined,
        PST_NO: formValue.PST_NO || undefined,
        PLU_MagNo: formValue.PLU_MagNo || undefined,
        IsOnlyShowDiff: formValue.IsOnlyShowDiff, // 是否只顯示差異
        pageIndex: 1,
        pageSize: 500,
        SortBy: displayMode === 1 ?
          [
            { field: 'PST_Date', order: 1 },
            { field: 'LOGO_No', order: 1 },
            { field: 'PST_NO', order: 1 },
          ] :
          [
            { field: 'PST_Date', order: 1 },
            { field: 'LOGO_No', order: 1 },
            { field: 'PST_NO', order: 1 },
            { field: 'PLU_MagNo', order: 1 }
          ],
      };

      this.tls57150Service.queryTLS57150(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.historyRequestBody = requestBody;
        if (response.Data && response.Data.length > 0) {
          this.totalRecords = response.TotalCount || 0;
          this.footerTotal = response.GrandTotal || response.SummaryTotal; // 根據 ReportType 取得總計
          this.subTotalData = response.SubTotals;
          this.data = response.Data;
        } else {
          this.data = [];
          this.subTotalData = [];
          this.totalRecords = 0;
        }
      });
    });
  }

  /**
   * 匯出 PDF 報表
   */
  onExportPDF() {
    if (!this.historyRequestBody) {
      return;
    }
    this.btnLoading = true;
    this.tls57150Service.exportTLS57150PDF(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
    });
  }

  /**
   * 匯出 Excel 報表
   */
  onExportXLSX() {
    if (!this.historyRequestBody) {
      return;
    }
    this.btnLoading = true;
    this.tls57150Service.exportTLS57150Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
    });
  }

  // 處理檔案匯出的通用邏輯 (與 090 相同，可保留)
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
    }
  }

  // 輔助方法：從 header 獲取檔名 (與 090 相同，可保留)
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
