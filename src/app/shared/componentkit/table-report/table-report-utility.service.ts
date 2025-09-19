// table-utility.service.ts
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { ReportColumn } from './table-report.model';

@Injectable({
  providedIn: 'root'
})
export class TableReportUtilityService {

  constructor(
    private readonly sanitizer: DomSanitizer
  ) { }

  // 判斷欄位是否可見
  isColumnVisible(col: ReportColumn): boolean {
    return col.visible !== false && col.hidden !== true;
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

  private safeUrlCache = new Map<string, SafeUrl>();
  getImage(url: string): SafeUrl | undefined {
    if (!url) { return undefined; }
    if (this.safeUrlCache.has(url)) {
      return this.safeUrlCache.get(url);
    }
    const match = url.match(/(.*\/)([^/]*)/);
    let finalUrl: string;

    if (match && match.length === 3) {
      const path = match[1].replace(/~/g, '');
      const filename = match[2];
      const baseUrl = environment.ApiUrl.endsWith('/') ? environment.ApiUrl.slice(0, -1) : environment.ApiUrl;
      const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
      finalUrl = `${baseUrl}/${sanitizedPath}${filename}`;
    } else {
      const sanitizedUrl = url.replace(/~/g, '');
      const baseUrl = environment.ApiUrl.endsWith('/') ? environment.ApiUrl.slice(0, -1) : environment.ApiUrl;
      const imagePath = sanitizedUrl.startsWith('/') ? sanitizedUrl.slice(1) : sanitizedUrl;
      finalUrl = `${baseUrl}/${imagePath}`;
    }
    const safeUrl = this.sanitizer.bypassSecurityTrustUrl(finalUrl);
    this.safeUrlCache.set(url, safeUrl);

    return safeUrl;
  }
  /**
   * 判斷當前行是否為該分組的最後一筆。
   * @param rowData 當前行資料。
   * @param rowIndex 當前行索引。
   * @returns 如果是最後一筆則回傳 true，否則為 false。
   */
  isGroupLastRow(rowData: any, rowIndex: number, groupRowsBy: string, data: any): boolean {
    // 取得當前行和下一行在分組依據欄位上的值
    const currentRowGroupValue = rowData[groupRowsBy];
    if (groupRowsBy === undefined || rowIndex === data.length - 1 || data[rowIndex + 1] === undefined || data[rowIndex + 1][groupRowsBy] === undefined) {
      return true;
    }
    const nextRowGroupValue = data[rowIndex + 1][groupRowsBy];

    // 如果當前行的分組值與下一行不同，表示當前行是該分組的最後一筆
    return currentRowGroupValue !== nextRowGroupValue;
  }
  /**
 * 依據群組標示，計算並取得該欄位的小計數值。
 * @param rowData 當前行的資料。
 * @param col 當前的欄位定義。
 * @returns 該欄位的小計數值，如果找不到或不是數值欄位則回傳空字串。
 */
  getGroupSubtotal(rowData: any, col: ReportColumn, groupRowsBy: string, data: any): any {
    // 2. 找到屬於同一個群組的所有資料
    const groupValue = rowData[groupRowsBy];
    // 這裡使用 'this.data' 是關鍵，它必須在正確的元件上下文裡
    const groupRows = data.filter((item: any) => item[groupRowsBy!] === groupValue);
    // 3. 對找到的資料進行加總，並將值轉為數字
    const total = groupRows.reduce((sum: number, item: Record<string, any>) => {
      const value = Number(item[col.field]) || 0;
      return sum + value;
    }, 0);
    // 4. 回傳加總後的數值
    return col.format ? col.format(total) : total;
  }
}
