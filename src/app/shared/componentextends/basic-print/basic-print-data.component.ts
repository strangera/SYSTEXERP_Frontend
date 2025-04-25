/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectorRef, inject, Injectable } from '@angular/core';
import { Column } from '../../componentkit/table/table.model';
import { DatePipe } from '@angular/common';

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

  BasicPrinting(selectColumns: Column[], data: any[], reportHead: ReportHead, printColumns?: Column[]): void {
    this.isPDFDownloading = true;
    const columnsToUse = printColumns?.length ? printColumns : selectColumns;
    const cleanColumns = (columns: Column[]) =>
      columns.map(({ field, header, visible }) => ({ field, header, visible }));
    const columnsWithoutFormat = cleanColumns(columnsToUse);
    const tableColumns = columnsWithoutFormat.filter(col => col.visible != false).map(col => col.header);
    const tableRows = data.map(row => columnsWithoutFormat.filter(col => col.visible != false).map(col => row[col.field]));
    const UserInfo = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    // 設定日期格式化
    const datePipe = new DatePipe('en-US');
    const now = datePipe.transform(new Date(), 'yyyy/MM/dd HH:mm') || '';
    const systemDate = datePipe.transform(new Date(), 'yyyy/MM/dd') || '';
    // 設置報表標題與默認值
    reportHead = {
      exporttime: now,
      exportNo: UserInfo.code,
      exportuser: UserInfo.CName,
      systemtime: systemDate,
      reporttitle: 'Report Title',
      reportname: 'Report Name',
      ...reportHead  // 将传入的 reportHead 覆盖默认值
    };
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('../../workers/pdf-worker.worker', import.meta.url), { type: 'module' });
      worker.postMessage({ columns: tableColumns, data: tableRows, reportHead });
      worker.onmessage = ({ data }) => {
        try {
          const blob = new Blob([data], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${reportHead.reportname}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Error during PDF generation:', error);
        } finally {
          this.isPDFDownloading = false; // 确保设置为 false
          this.cdr.detectChanges();  // 手动触发变更检测
          worker.terminate();
        }
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
        this.isPDFDownloading = false;  // 确保设置为 false
        this.cdr.detectChanges();  // 手动触发变更检测
        worker.terminate();
      };
    } else {
      console.error('Web Worker is not supported in this browser.');
      this.isPDFDownloading = false;  // 在不支持 Web Worker 时也设置为 false
    }
  }
  exportFunction(selectedColumns: Column[], data: any[], exportFilename: string, printColumns?: Column[]): void {
    this.isExcelDownloading = true;  // 开始导出时设置为 true
    const columns = printColumns && printColumns.length > 0 ? printColumns : selectedColumns;
    const dataToExport = data.map((row: any) => {
      const rowData: any = {};
      columns.forEach(col => { rowData[col.field] = row[col.field] ?? ''; });
      return rowData;
    });
    if (typeof Worker !== 'undefined') {
      const worker = new Worker(new URL('../../workers/excel-worker.worker', import.meta.url), { type: 'module' });
      worker.postMessage({ dataToExport, exportFilename });
      // 接收 Worker 的消息
      worker.onmessage = ({ data }) => {
        if (data.success) {
          // 导出成功，创建下载链接
          const blob = new Blob([data.file], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${data.exportFilename}.xlsx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          console.error('导出失败:', data.error);
        }

        // 导出完成，更新状态
        this.isExcelDownloading = false;
        this.cdr.detectChanges();  // 确保视图刷新，隐藏 loading 状态
        worker.terminate();  // 终止 Worker
      };

      worker.onerror = (error) => {
        console.error('Worker 错误:', error);
        this.isExcelDownloading = false;
        this.cdr.detectChanges();
        worker.terminate();
      };
    } else {
      console.error('Web Worker 不被当前浏览器支持');
      this.isExcelDownloading = false;
      this.cdr.detectChanges();
    }
  }
  toggleVisibility(): void {
    this.IsPrint = !this.IsPrint;
  }
}
