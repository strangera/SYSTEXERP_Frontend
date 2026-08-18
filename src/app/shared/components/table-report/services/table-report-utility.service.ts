import { Injectable } from '@angular/core';
import { SafeUrl } from '@angular/platform-browser';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { finalize, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReportColumn } from '../table-report.model';

@UntilDestroy()
@Injectable({
  providedIn: 'root'
})
export class TableReportUtilityService {

  constructor(
    private readonly messageService: NotificationService,
  ) { }

  // 判斷欄位是否可見
  isColumnVisible(col: ReportColumn): boolean {
    return col.visible !== false;
  }

  // 計算分組欄位跨度
  getColumnSpan(columns: ReportColumn[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField && this.isColumnVisible(col)).length;
  }

  // 判斷是否應該渲染分組標題
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

  // 計算第三層（topGroupField）分組跨度
  getTopGroupColumnSpan(columns: ReportColumn[], topGroupField: string): number {
    return columns.filter(col => col.topGroupField === topGroupField && this.isColumnVisible(col)).length;
  }

  // 判斷是否應該渲染第三層分組標題
  shouldRenderTopGroupHeader(col: ReportColumn, index: number, columns: ReportColumn[]): boolean {
    if (!col.topGroupField || !this.isColumnVisible(col)) {
      return false;
    }
    const currentGroup = col.topGroupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i];
      if (prev.topGroupField === currentGroup && this.isColumnVisible(prev)) {
        return false;
      }
    }
    return true;
  }

  private readonly safeUrlCache = new Map<string, SafeUrl>();

  getImage(url: any): SafeUrl | string {
    // 1. 基本防呆：如果是空值，直接回傳一個透明或佔位圖的 base64，或是一個空字串
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

      // 2. 處理路徑：統一移除 ~ 並確保開頭沒有 /
      let cleanPath = url.replaceAll('~', '');
      if (cleanPath.startsWith('/')) {
        cleanPath = cleanPath.slice(1);
      }

      // 3. 拼接並處理可能的重複斜線
      const finalUrl = `${baseUrl}/${cleanPath}`;

      const safeUrl = finalUrl;
      this.safeUrlCache.set(url, safeUrl);
      return safeUrl;
    } catch (e) {
      console.error('URL轉換出錯:', e);
      return '';
    }
  }
  /**
   * 判斷當前行是否為該分組的最後一筆。
   * @param rowData 當前行資料。
   * @param rowIndex 當前行索引。
   * @returns 如果是最後一筆則回傳 true，否則為 false。
   */
  isGroupLastRow(rowData: any, rowIndex: number, groupRowsBy: string, data: any): boolean {
    // 1. 確保 rowData 存在，並且有分組欄位 (雖然 HTML 應該已經檢查過 rowData)
    if (!rowData || !groupRowsBy) {
      return false; // 或者根據邏輯回傳 true
    }

    // 取得當前行和下一行在分組依據欄位上的值
    const currentRowGroupValue = rowData[groupRowsBy];

    // 檢查是否為最後一行
    if (rowIndex === data.length - 1) {
      return true;
    }

    // 安全存取下一行資料 (使用 ?. 運算子)
    const nextRow = data[rowIndex + 1];
    const nextRowGroupValue = nextRow?.[groupRowsBy];

    // 如果下一行不存在或下一行的分組值未定義，則視為當前分組的最後一筆
    if (!nextRow || nextRowGroupValue === undefined) {
      return true;
    }

    // 如果當前行的分組值與下一行不同，表示當前行是該分組的最後一筆
    return currentRowGroupValue !== nextRowGroupValue;
  }
  /**
     * 處理單一行的展開/收合邏輯。
     * @param rowData 該行資料
     * @param dataKey 唯一識別鍵
     * @param expansionDataKey 展開資料的鍵名
     * @param expansionLoadFn 載入展開資料的函數
     * @param expandedRows 已展開行的映射表
     * @param hostComponent 用來處理 `untilDestroyed` 的元件
     */
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
      // 如果已經有資料，直接切換狀態
      if (expandedRows[rowKey]) {
        delete expandedRows[rowKey]; // 收合
      } else {
        expandedRows[rowKey] = true; // 展開
      }
    } else if (expansionLoadFn) {
      // 第一次展開，沒有資料，才呼叫 API 載入
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

  // 找到第一個被標記為 isSubTotal 的欄位索引
  getFirstSubtotalIndex(columns: ReportColumn[]): number {
    const index = columns.findIndex(col => col.isSubTotal);
    return index === -1 ? 0 : index;
  }

  // 找到總計資料中第一個有值的欄位索引 (避免前面沒值的欄位也被空著)
  getFirstFooterIndex(columns: ReportColumn[], footerData: any): number {
    if (!footerData) return 0;
    const index = columns.findIndex(col => footerData[col.field] !== undefined && footerData[col.field] !== null && footerData[col.field] !== '');
    return index === -1 ? 0 : index;
  }

  // 取得欄位在 footerSpanConfig 中的 colspan 數（沒設定時回傳 1）
  getColSpanForField(config: { field: string; colSpan: number }[] | undefined, field: string): number {
    if (!config) return 1;
    const found = config.find(c => c.field === field);
    return found ? found.colSpan : 1;
  }

  // 判斷欄位是否被前一個 span 欄位覆蓋（應跳過不渲染）
  isSpannedByPrevious(config: { field: string; colSpan: number }[] | undefined, columns: ReportColumn[], field: string): boolean {
    if (!config) return false;
    for (const c of config) {
      const startIdx = columns.findIndex(col => col.field === c.field);
      if (startIdx === -1) continue;
      const currentIdx = columns.findIndex(col => col.field === field);
      if (currentIdx > startIdx && currentIdx < startIdx + c.colSpan) return true;
    }
    return false;
  }

  /**
 * 取得當前行的分組顯示名稱
 */
  getGroupValue(rowData: any, groupRowsBy: string, columns: ReportColumn[]): string {
    if (!groupRowsBy) return '';

    const rawValue = rowData[groupRowsBy];
    const groupColumn = columns.find(c => c.field === groupRowsBy);

    // 如果該分組欄位有定義 format，就用 format 過的值，否則直接轉字串
    if (groupColumn?.format) {
      return String(groupColumn.format(rawValue, 0, rowData) ?? '');
    }
    return String(rawValue ?? '');
  }

  /**
  * 格式化數據(目前可自動抓sys1000的值，未來可擴充其他類型的格式化)
  */
  getFormattedValue(col: ReportColumn, val: any, rowIndex: number, rowData: any): any {
    // 1. 優先使用明確定義的 format
    if (col.format) {
      return col.format(val, rowIndex, rowData);
    }
    // 2. 預設回傳原始值
    return val;
  }
}
