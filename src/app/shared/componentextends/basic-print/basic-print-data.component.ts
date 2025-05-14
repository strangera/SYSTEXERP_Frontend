import { CurrentPageService } from './../../../layout/app.menulist/current-page.service';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { QueryStateService } from '../../service/query-state.service';
import { TableService } from '../../componentkit/table/table.service';

export interface ReportHead {
  exporttime?: Date | string; //報表產出時間
  exportuser?: string; //使用者
  exportNo?: string; //使用者代號
  systemtime?: Date | string; //系統日期
  reporttitle?: string; //報表名稱
  reportname?: string; //報表檔名
}

@Injectable({
  providedIn: 'root'
})
export class BasicPrintDataComponent {
  IsPrint = true;
  isPDFDownloading = false;
  isExcelDownloading = false;

  cdr = inject(ChangeDetectorRef);
  queryState = inject(QueryStateService);
  currentPage = inject(CurrentPageService);
  tableService = inject(TableService);

  exportPDFDownload(): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const queryState = this.queryState.getQueryState(ProgNo);

    const body = {
      "query_condition": {
        "ServiceName": "queryTLS51010",
        "Conditions": {
          "CAT_LNo": "",
          "CAT_LName": "",
          "pageSize": 1000,
          "pageIndex": 1,
          "SortBy": [
            {
              "field": "CAT_LNo",
              "order": 1
            }
          ]
        }
      },
      "report_title": "PDF測試",
      "columns": [
        { "field": "CAT_LNo", "header": "大分類代碼", "visible": true },
        { "field": "CAT_LName", "header": "大分類名稱", "visible": true },
        {
          "field": "CAT_LRemark",
          "header": "備註",
          "visible": true
        }
      ],
      "config": {
        "print_reportTitle": "Y",
        "print_reportTitle_per_page": "Y",
        "print_eject": "Y",
        "print_field_title": "Y",
        "print_reportFooter": "Y",
        "print_reportFooter_per_page": "Y",
        "page_lines": 30
      },
      "file_name": "admin_TLS51010_20250514.pdf"
    }


    console.log(body);
    this.tableService.exportPDF(body).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
      }
    });
  }
  exportExcelDownload(): void {

  }
  toggleVisibility(): void {
    this.IsPrint = !this.IsPrint;
  }
}
