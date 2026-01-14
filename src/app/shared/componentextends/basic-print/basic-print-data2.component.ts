import { saveAs } from 'file-saver';
import { CurrentPageService } from './../../../core/layout/app.menulist/current-page.service';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '@angular/common/http';
import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SystemDataService } from '@service/system/system-data.service';
import { AuthService } from '../../../service/system/auth.service';
import { REPORT_TITLES } from '../../componentkit/table/report-titles';
import { TableService } from '../../componentkit/table/report.service';
import { TableExport2 } from '../../componentkit/table2/table-export2/table-export2.component';
import { Column } from '../../componentkit/table2/table2.model';
import { QueryStateService } from '../../service/query-state.service';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class BasicPrintData2Component {
  IsPrint = true;
  exportDialog = false;
  exportStatus: 'PDF' | 'Excel' = 'PDF';

  cdr = inject(ChangeDetectorRef);
  queryState = inject(QueryStateService);
  currentPage = inject(CurrentPageService);
  tableService = inject(TableService);
  authService = inject(AuthService);
  systemDataService = inject(SystemDataService);

  /**
   * PDF 匯出
   * columns 由 Table2 傳進來，會帶有 exportFormat（若有設定）
   * 這裡只在 exportFormat 是「字串」時才送給後端
   */
  exportPDFDownload(event: TableExport2, columns: Column[], apiUrl?: string): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`query${ProgNo}`);
    const userInfo = this.authService.currentUserValue;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;

    const pdfColumns = columns.map(col => {
      const c: any = {
        field: col.field,
        header: col.header,
        visible: col.visible !== false
      };

      // ⭐ 只有在 exportFormat 是非空字串時才加到 body
      if (typeof (col as any).exportFormat === 'string' && (col as any).exportFormat.trim() !== '') {
        c.exportFormat = (col as any).exportFormat.trim();
      }

      return c;
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: queryState?.value || []
      },
      report_title: REPORT_TITLES[`query${ProgNo}`] || funInfo?.prog_name,
      columns: pdfColumns,
      config: {
        ...event,
        footer_DataType: ProgNo
      },
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`
    };

    this.tableService.exportPDF(body).pipe(untilDestroyed(this)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
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
          console.error('Response body is empty!');
        }
        this.exportDialog = false;
      },
      error: (err: any) => {
        console.error('Error downloading PDF:', err);
        this.exportDialog = false;
      }
    });
  }

  /**
   * Excel 匯出
   * 同樣只在 exportFormat 是「字串」時才送給後端
   */
  exportExcelDownload(event: TableExport2, columns: Column[], apiUrl?: string): void {
    const ProgNo = this.currentPage.currentPageProgNoSubject.getValue() as string;
    const funInfo = this.systemDataService.getUserPermissions(ProgNo); // 取得權限
    const queryState = this.queryState.getQueryState(`query${ProgNo}`);
    const userInfo = this.authService.currentUserValue;

    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedToday = `${year}${month}${day}`;

    const excelColumns = columns.map(col => {
      const c: any = {
        field: col.field,
        header: col.header,
        visible: col.visible !== false
      };

      // ⭐ 只有在 exportFormat 是非空字串時才加到 body
      if (typeof (col as any).exportFormat === 'string' && (col as any).exportFormat.trim() !== '') {
        c.exportFormat = (col as any).exportFormat.trim();
      }

      return c;
    });

    const body = {
      query_condition: {
        ServiceName: apiUrl ? `${apiUrl}` : `query${ProgNo}`,
        Conditions: queryState?.value || []
      },
      report_title: REPORT_TITLES[`query${ProgNo}`] || funInfo?.prog_name,
      columns: excelColumns,
      config: event,
      file_name: `${userInfo?.user_No}_${funInfo?.prog_id}_${formattedToday}`
    };

    this.tableService.exportExcel(body).pipe(untilDestroyed(this)).subscribe({
      next: (response: HttpResponse<Blob>) => {
        if (response.body) {
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `${body.file_name}.xlsx`;
          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''(.+?)(?:\.xlsx)?$|filename="(.+?)(?:\.xlsx)?"$/;
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || filename;
              filename = decodeURIComponent(filename);
            }
            filename = filename.replace(/["']/g, '');
          }
          const blob = new Blob(
            [response.body],
            { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
          );
          saveAs(blob, filename);
        } else {
          console.error('Response body is empty!');
        }
        this.exportDialog = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error downloading Excel:', err);
        this.exportDialog = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleVisibility(): void {
    this.IsPrint = !this.IsPrint;
  }
}
