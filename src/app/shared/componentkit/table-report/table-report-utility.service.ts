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

  // 取得可見欄位總數
  getVisibleColumnCount(columns: Column[]): number {
    if (!Array.isArray(columns)) { return 0; }
    return columns.filter(col => this.isColumnVisible(col)).length;
  }
  // 計算全表總計
  getTotal(data: any[], field: string): number {
    return data.reduce((sum: number, row: any) => sum + (row[field] || 0), 0);
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
