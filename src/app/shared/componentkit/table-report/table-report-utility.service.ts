// table-utility.service.ts
import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { Column } from './table-report.model';

@Injectable({
  providedIn: 'root'
})
export class TableReportUtilityService {

  constructor(
    private readonly sanitizer: DomSanitizer
  ) { }

  // 判斷欄位是否可見
  isColumnVisible(col: Column): boolean {
    return col.visible !== false && col.hidden !== true;
  }

  // 計算分組欄位跨度
  getColumnSpan(columns: Column[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField && this.isColumnVisible(col)).length;
  }

  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
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
  /**
 * 取得分組小計的數值
 * @param row 當前分組的第一筆資料
 * @param col 當前的欄位定義
 * @returns 對應的小計數值，如果找不到或不是數值欄位則回傳空字串
 */
  getGroupSubtotal(rowData: any, footerSubtotal: any[], groupRowsBy: string | undefined): any {
    if (!footerSubtotal || !groupRowsBy || !rowData) {
      return undefined;
    }
    // 根據 groupRowsBy 屬性找到對應的小計物件
    return footerSubtotal.find(sub => sub[groupRowsBy] === rowData[groupRowsBy]);
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
}
