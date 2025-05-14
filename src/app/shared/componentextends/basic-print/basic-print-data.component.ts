import { saveAs } from 'file-saver';
import { CurrentPageService } from './../../../layout/app.menulist/current-page.service';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { QueryStateService } from '../../service/query-state.service';
import { TableService } from '../../componentkit/table/table.service';
import { HttpResponse } from '@angular/common/http';
import { Column } from '../../componentkit/table/table.model';
import { AuthService } from '../../../service/system/auth.service';

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
  authService = inject(AuthService);

  exportPDFDownload(columns: Column[],): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const queryState = this.queryState.getQueryState(ProgNo);
    const userInfo = this.authService.currentUserValue;
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // getMonth() 返回 0-11，所以要 +1
    const day = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;
    const pdfColumns = columns.map(col => {
      return {
        field: col.field,
        header: col.header,
        visible: col.visible !== undefined ? col.visible : true
      };
    });


    const body = {
      query_condition: {
        ServiceName: `query${ProgNo}`,
        Conditions: queryState
      },
      "report_title": "PDF測試",
      columns: pdfColumns,
      "config": {
        "print_reportTitle": "Y",
        "print_reportTitle_per_page": "Y",
        "print_eject": "Y",
        "print_field_title": "Y",
        "print_reportFooter": "Y",
        "print_reportFooter_per_page": "Y",
        "page_lines": 30
      },
      file_name: `${userInfo?.user_No}_${ProgNo}_${formattedToday}`
    }

    this.tableService.exportPDF(body).subscribe({
      next: (response: HttpResponse<Blob>) => {
        console.log("Response:", response); // 打印完整的回应
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
          console.log(contentDisposition);

          let filename = `${body.file_name}.pdf`;

          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.pdf)?$|filename="(.+?)(?:\.pdf)?"$/;
            const matches = contentDisposition.match(filenameRegex);

            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }

          const blob = new Blob([response.body], { type: 'application/pdf' });
          saveAs(blob, filename);
        } else {
          console.error("Response body is empty!");
          // Handle the empty response appropriately (e.g., show an error message to the user)
        }
      },
      error: (err: any) => {
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
