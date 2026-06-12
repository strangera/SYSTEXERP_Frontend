import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { finalize, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReportColumn } from './tls2f010-table-report.model';

@Injectable({
  providedIn: 'root'
})
export class Tls2f010TableReportUtilityService {

  constructor(
    private readonly messageService: NotificationService,
  ) { }

  isColumnVisible(col: ReportColumn): boolean {
    return col.visible !== false;
  }

  getColumnSpan(columns: ReportColumn[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField && this.isColumnVisible(col)).length;
  }

  shouldRenderGroupHeader(col: ReportColumn, index: number, columns: ReportColumn[]): boolean {
    if (!col.groupField || !this.isColumnVisible(col)) {
      return false;
    }
    const currentGroup = col.groupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i];
      if (prev.groupField === currentGroup && this.isColumnVisible(prev)) {
        return false;
      }
    }
    return true;
  }

  private readonly safeUrlCache = new Map<string, SafeUrl>();

  getImage(url: any): SafeUrl | string {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return '';
    }

    if (this.safeUrlCache.has(url)) {
      return this.safeUrlCache.get(url)!;
    }

    try {
      const baseUrl = environment.ApiUrl.endsWith('/')
        ? environment.ApiUrl.slice(0, -1)
        : environment.ApiUrl;

      let cleanPath = url.replaceAll('~', '');
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.slice(1);
      }

      const finalUrl = `${baseUrl}/${cleanPath}`;

      const safeUrl = finalUrl;
      this.safeUrlCache.set(url, safeUrl);
      return safeUrl;
    } catch (e) {
      console.error('URL轉換出錯:', e);
      return '';
    }
  }

  isGroupLastRow(rowData: any, rowIndex: number, groupRowsBy: string, data: any): boolean {
    if (!rowData || !groupRowsBy) {
      return false;
    }
    const currentRowGroupValue = rowData[groupRowsBy];
    if (rowIndex === data.length - 1) {
      return true;
    }
    const nextRow = data[rowIndex + 1];
    const nextRowGroupValue = nextRow?.[groupRowsBy];
    if (!nextRow || nextRowGroupValue === undefined) {
      return true;
    }
    return currentRowGroupValue !== nextRowGroupValue;
  }

  toggleRowExpansionLogic(
    rowData: any,
    dataKey: string,
    expansionDataKey: string,
    expansionLoadFn: ((data: any) => Observable<any>) | undefined,
    expandedRows: Record<string, boolean>,
    hostComponent: any
  ): void {
    const rowKey = rowData[dataKey];
    const hasDetails = rowData[expansionDataKey] && rowData[expansionDataKey]?.length > 0;
    if (hasDetails) {
      if (expandedRows[rowKey]) {
        delete expandedRows[rowKey];
      } else {
        expandedRows[rowKey] = true;
      }
    } else if (expansionLoadFn) {
      rowData.expansionLoading = true;
      expansionLoadFn(rowData).pipe(untilDestroyed(hostComponent), finalize(() => {
        rowData.expansionLoading = false;
      }), tap(response => {
        const responseData = response.Data;
        if (responseData && Array.isArray(responseData) && responseData.length > 0) {
          rowData[expansionDataKey] = responseData;
          expandedRows[rowKey] = true;
        } else {
          this.messageService.infoBubble('查無詳細資料。');
        }
      })).subscribe();
    }
  }
}
