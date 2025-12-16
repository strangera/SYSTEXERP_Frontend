import { AsyncPipe, DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core'; // Add this import as requested
import { QueryTLS27040Request, TLS27040Data, TLS27040Service, TotalData } from '@service/api/tls/tls27040.service';
import { getSYS1000Options, SystemOptionsService } from '@service/system/sys1000.service';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { CalendarRangeComponent } from '@shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '@shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '@shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '@shared/componentkit/radiobutton/radiobutton.component';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { formatDateToYYYY_MM_DD } from '@shared/componentkit/table/table.model';
import { getDateTime, toHHmm } from '@shared/models/system/query-form.model';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { DropdownApiService } from './../../../service/utility/dropdown-api.service';
import { columns, POS611XOptions, queryCrdTxnFgOptions, queryFilterOptions, queryTxnTypeOptions } from './tls27040.model';
@Component({
  selector: 'app-tls27040',
  templateUrl: './tls27040.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TranslateModule,
    DropdownModule,
    TableReportComponent,
    MultiSelectComponent,
    InputNumberRangeComponent,
    CalendarRangeComponent,
    RadiobuttonComponent,
    DropdownComponent,
    AsyncPipe,
    ButtonModule
  ]
})
export class TLS27040Component extends BasicQueryPageComponent<TLS27040Data> implements OnInit {
  queryForm = this.formBuilder.group({
    tableNameList: [null],
    ECR_No: [null, [Validators.maxLength(10)]], // ECR編號
    TXN_No: [null, [Validators.maxLength(8)]], // 交易編號
    TLT_No: [null, [Validators.maxLength(12)]], // 專櫃編號
    TxnTypeList: [null],         // 銷售狀況
    PayCrdTypeList: [null],    // 卡別
    TxnAmt_Start: [null, [Validators.max(9999999999)]],       // 交易金額起 decimal 12, 2
    TxnAmt_End: [null, [Validators.max(9999999999)]],      // 交易金額迄 decimal 12, 2
    TxnDate_Start: [null],    // 交易日期起
    TxnDate_End: [null],    // 交易日期迄
    TxnTime_Start: [getDateTime()],  // 交易時間起
    TxnTime_End: [getDateTime(undefined, 23, 59, 59, 999)],  // 交易時間迄
    CrdNo: [null, [Validators.maxLength(32)]],       // 卡號
    TmID: [null, [Validators.maxLength(8)]],      //EDC號碼
    ReqDate_Start: [null], // 請款日期起
    ReqDate_End: [null], // 請款日期迄
    CrdTxnFgList: [null],      // 交易類別 資料型態，C=一般交易、I=分期交易、R=紅利交易
    EntryFgList: [null],       // 輸入狀態
    ApprovalCode: [null, [Validators.maxLength(6)]],  // 核准碼
    TermNoList: [null],      // 分期期數
    radioBtn: [null], // 查詢篩選
    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'ID', order: 1 }]],
  });
  data: TLS27040Data[] = [];
  footerData: TotalData = { group_name: '總計', TxnAmt: 0 };
  selectedItems: TLS27040Data[] = [];
  columns: ReportColumn[] = columns;
  totalRecords = 0;
  lastQueryBody: any;
  POS611XOptions = POS611XOptions;                // 收單銀行
  ECR_NoOptions = this.dropdown.queryPos1002();   // ECR編號
  TLT_NoOptions = this.dropdown.queryTltTalent(); // 專櫃編號
  TxnTypeOptions = queryTxnTypeOptions;                // 銷售狀況
  PayCrdTypeOptions = getSYS1000Options('NCML_PayCrdType');// 卡別
  CrdTxnFgOptions = queryCrdTxnFgOptions;
  CheckOptions = getSYS1000Options('CTBC_Check');
  EntryFgOptions = getSYS1000Options('EntryFg');
  TermNoOptions = SystemOptionsService.getOptions('T109');
  queryFilterOptions = queryFilterOptions;
  btnLoading = false;
  historyRequestBody: QueryTLS27040Request | null = null;

  constructor(
    public readonly tls27040Service: TLS27040Service,
    private readonly dropdown: DropdownApiService,
    private readonly datePipe: DatePipe
  ) { super(); }

  ngOnInit(): void {
    this.initializePage('TLS27040', 'tls/tls27040cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const body = {
        ...frm.value,
        TxnDate_Start: formatDateToYYYY_MM_DD(frm.value.TxnDate_Start),
        TxnDate_End: formatDateToYYYY_MM_DD(frm.value.TxnDate_End),
        TxnTime_Start: toHHmm(frm.value.TxnTime_Start),
        TxnTime_End: toHHmm(frm.value.TxnTime_End),
        TxnTypeList: processSelectedCodes(frm.value.TxnTypeList),
        CrdTxnFgList: processSelectedCodes(frm.value.CrdTxnFgList),
        ReqDate_End: this.datePipe.transform(frm.value.ReqDate_End, 'yyyy-MM-dd'),
        ReqDate_Start: this.datePipe.transform(frm.value.ReqDate_Start, 'yyyy-MM-dd'),
      }
      this.tls27040Service.queryTLS27040(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
        this.data = res.Data;
        this.historyRequestBody = body;
        this.footerData = res.footerData && res.footerData.length > 0 ? res.footerData[0] : { group_name: '總計', TxnAmt: 0 };
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body;
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
      });
    });
  }
  onDelete(selectedItems: TLS27040Data[]) {
    this.loading = true;
    const body = {
      selectList: selectedItems.map(item => ({
        id: item.ID,
        tableName: item.tableName,
        TxnAmt: item.TxnAmt,
        ECR_No: item.ECR_No,
        TXN_Date: new Date(item.TxnDate),
      })),
    }
    this.tls27040Service.deleteTLS27040(body).pipe(finalize(() => this.loading = false), untilDestroyed(this)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.onSubmit(this.queryForm);
    });
  }

  /**
   *  新增：匯出 PDF 報表 (呼叫 tls27040Service.exportTLS27040PDF)
   */
  onExportPDF() {
    if (!this.historyRequestBody) {
      return;
    }
    this.btnLoading = true;
    this.tls27040Service.exportTLS27040PDF(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.pdf');
      },
      error: (err) => {
        console.error('PDF 匯出失敗:', err);
        //  可以在這裡添加錯誤提示邏輯
      }
    });
  }

  /**
   * 新增：匯出 Excel 報表 (呼叫 tls27040Service.exportTLS27040Excel)
   */
  onExportXLSX() {
    if (!this.historyRequestBody) {
      return;
    }
    this.btnLoading = true;
    this.tls27040Service.exportTLS27040Excel(this.historyRequestBody).pipe(
      untilDestroyed(this),
      finalize(() => this.btnLoading = false)
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.handleFileExport(response, '.xlsx');
      },
      error: (err) => {
        console.error('Excel 匯出失敗:', err);
        //  可以在這裡添加錯誤提示邏輯
      }
    });
  }

  /**
   *  複製自 tls27040.component.ts 的通用檔案處理邏輯
   * 處理檔案匯出的通用邏輯
   */
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
    }
  }

  /**
   *  複製自 tls27040.component.ts 的通用檔案處理邏輯
   * 輔助方法：從 header 獲取檔名
   */
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

  editDisabled = (rowData: TLS27040Data): boolean => {
    return (rowData.Check_Status === 'Y' || rowData.isClose === 'Y'); // 已審核或已關帳的資料不可編輯
  };

  isRowSelectable(rowData: TLS27040Data): boolean {
    return rowData.isClose === 'N' && rowData.Check_Status === 'N';
  }
}
function processSelectedCodes(selectedValues: string[][]) {
  if (selectedValues) {
    return selectedValues.flat();
  }
  return null;
}
