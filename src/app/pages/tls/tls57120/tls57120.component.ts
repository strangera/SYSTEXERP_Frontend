import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import {
  QueryTLS57120DataItem,
  QueryTLS57120Request,
  QueryTLS57120ShowType,
  Tls57120Service
} from '@service/api/tls/tls57120.service';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ColumnGroup, formatAmount, formatDate, ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { convertDateToYYYYMM } from '@shared/componentkit/table/table.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';

@Component({
  selector: 'app-tls57120',
  templateUrl: './tls57120.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownComponent,
    CalendarComponent,
    CalendarRangeComponent,
    InputNumberComponent,
    ButtonComponent,
    ButtonModule,
    TranslateModule,
    TableReportComponent,
    AsyncPipe,
  ]
})
export class TLS57120Component extends BasicQueryPageComponent<QueryTLS57120DataItem> implements OnInit {
  queryForm = this.formBuilder.nonNullable.group({
    /** 顯示方式 */
    ShowType: [QueryTLS57120ShowType.Summary, Validators.required],
    /** 基準月份 */
    BaseYM: [new Date(), Validators.required],
    /** 倉別 */
    HOS_No: [null as string | null],
    /** 品牌 */
    LOGO_No: [null as string | null],
    /** 日期時間範圍(起) */
    DateFrom: [null as Date | null],
    /** 日期時間範圍(訖) */
    DateTo: [null as Date | null],
    /** 期間天數 */
    PeriodDays: [null as number | null],
    /** 顯示行數 */
    PageSize: [30],
  });

  // Dropdown options
  /** 倉別選項 */
  warehouseOptions = this.dropdown.queryPos2034();
  /** 品牌選項 */
  brandCodeOptions = this.dropdown.queryPluLogo();
  /** 顯示方式選項 */
  showTypeOptions = [
    { value: QueryTLS57120ShowType.Summary, label: '彙總' },
    { value: QueryTLS57120ShowType.Detail, label: '明細' },
  ];

  // Table data
  data: QueryTLS57120DataItem[] = [];
  totalRecords = 0;
  lastQueryBody: QueryTLS57120Request | null = null;
  columns: ReportColumn[] = [];
  columnGroup: ColumnGroup[] = [];
  footerData: QueryTLS57120DataItem | null = null;
  btnPDFLoading = false;
  btnExcelLoading = false;

  constructor(
    private readonly dropdown: DropdownApiService,
    public readonly tls57120Service: Tls57120Service,
    private readonly datePipe: DatePipe,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('TLS57120');

    // 監聽「顯示方式」變更，切換表格欄位
    this.queryForm.controls.ShowType.valueChanges.pipe(untilDestroyed(this)).subscribe(mode => {
      this.updateTableColumns(mode);
    });
    this.updateTableColumns(this.queryForm.controls.ShowType.value);
  }

  /**
   * 根據顯示模式切換表格欄位
   * @param showType M: 彙總, D: 明細
   */
  updateTableColumns(showType: QueryTLS57120ShowType | null) {
    if (showType === QueryTLS57120ShowType.Summary) {
      // 彙總模式
      this.columnGroup = [{ field: 'slowMoving', header: '滯銷品' }];
      this.columns = [
        { field: 'LOGO_NAME', header: '品牌名稱' },
        { field: 'TOT_STK_CurrentQty', header: '期末數量', format: formatAmount },
        { field: 'TOT_STK_CurrentCost', header: '期末成本', format: formatAmount },
        { field: 'STK_CurrentQty', header: '庫存數量', groupField: 'slowMoving', format: formatAmount },
        { field: 'StockCost', header: '庫存成本', groupField: 'slowMoving', format: formatAmount },
        { field: 'CostPercentage', header: '成本佔比', groupField: 'slowMoving' },
      ];
    } else if (showType === QueryTLS57120ShowType.Detail) {
      // 明細模式
      this.columnGroup = [];
      this.columns = [
        { field: 'LOGO_NAME', header: '品牌名稱' },
        { field: 'PLU_MagNo', header: '商品管理編號' },
        { field: 'PLU_Name', header: '品名' },
        { field: 'PLU_NO', header: '國際條碼' },
        { field: 'PLU_OrgPLUNo', header: '廠商貨號' },
        { field: 'PLU_SalePrc', header: '售價', format: formatAmount },
        { field: 'STK_UnitCost', header: '平均成本', format: formatAmount },
        { field: 'TOT_STK_CurrentQty', header: '期末數量', format: formatAmount },
        { field: 'TOT_STK_CurrentCost', header: '期末成本', format: formatAmount },
        { field: 'StockCost', header: '庫存成本', format: formatAmount },
        { field: 'MAX_SALE_DATE', header: '最近銷貨日期', format: formatDate },
      ];
    }
    this.data = [];
    this.totalRecords = 0;
    this.footerData = null;
  }

  /**
   * 自訂驗證：日期範圍 與 期間天數 二擇一必填
   */
  validateDateOrPeriod(): boolean {
    const { DateFrom, DateTo, PeriodDays } = this.queryForm.value;
    const hasDateRange = DateFrom != null && DateTo != null;
    const hasPeriodDays = PeriodDays != null && PeriodDays > 0;
    return hasDateRange || hasPeriodDays;
  }

  onSubmit(frm: FormGroup) {
    // 自訂驗證
    if (!this.validateDateOrPeriod()) {
      this.messageService.errorBubble('日期時間範圍(起訖) 與 期間天數 請擇一填寫');
      return;
    }

    this.handleSubmit(frm, () => {
      const formValue = frm.value;
      const requestBody: QueryTLS57120Request = {
        ShowType: formValue.ShowType,
        BaseYM: convertDateToYYYYMM(formValue.BaseYM),
        HOS_NO: formValue.HOS_No || undefined,
        LOGO_No: formValue.LOGO_No || undefined,
        DateFrom: formValue.DateFrom ? this.datePipe.transform(formValue.DateFrom, 'yyyy-MM-dd') || undefined : undefined,
        DateTo: formValue.DateTo ? this.datePipe.transform(formValue.DateTo, 'yyyy-MM-dd') || undefined : undefined,
        PeriodDays: formValue.PeriodDays || undefined,
        PageIndex: 1,
        PageSize: formValue.PageSize || 30,
        SortBy: formValue.ShowType === QueryTLS57120ShowType.Summary
          ? [{ field: 'LOGO_NAME', order: 1 }]
          : [{ field: 'LOGO_NAME', order: 1 }, { field: 'PLU_MagNo', order: 1 }],
      };

      this.tls57120Service.queryTLS57120(requestBody).pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false)
      ).subscribe(response => {
        this.lastQueryBody = requestBody;
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount || 0;
        this.footerData = response.TotalData;
      });
    });
  }

  onExportPDF() {
    if (!this.lastQueryBody) return;
    this.btnPDFLoading = true;
    this.tls57120Service.exportTLS57120PDF(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnPDFLoading = false)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
    });
  }

  onExportXLSX() {
    if (!this.lastQueryBody) return;
    this.btnExcelLoading = true;
    this.tls57120Service.exportTLS57120(this.lastQueryBody).pipe(untilDestroyed(this), finalize(() => this.btnExcelLoading = false)).subscribe({
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
      // this.messageService.warnBubble('沒有找到符合條件的資料，無法生成報表。');
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
