import { Injectable } from '@angular/core';
import { ReportColumn } from '../table-report.model';

/** 單一欄位算好的寬度；px 為最終實際套用寬度，truncated 表示內容超過上限需截斷 */
export interface ColumnWidthInfo {
  px: string;
  truncated: boolean;
}

@Injectable()
export class TableReportWidthService {
  // 內部維護序號寬度狀態
  public serialColumnWidth = '60px';

  /** 單欄寬度上限 (px) */
  public static readonly MAX_COLUMN_WIDTH = 600;
  private static readonly DEFAULT_MIN_WIDTH = 55;
  private static readonly CHINESE_CHAR_WIDTH = 16;
  private static readonly ANY_CHAR_WIDTH = 9;
  private static readonly PADDING_BUFFER = 24;
  private static readonly LINK_BUTTON_EXTRA = 16;

  /**
   * 依前端已載入的全部資料估算每個文字類欄位的寬度（col.width 視為最小寬度）。
   * 回傳以 field 為 key 的寬度表；image/button/自訂 template/無法解析單位的欄位不在表內，維持原本 col.width/預設值。
   */
  public calculateColumnWidths(
    columns: ReportColumn[],
    data: any[],
    totalRecords: number,
    showReorder: boolean,
    customTemplateFields: ReadonlySet<string>
  ): Record<string, ColumnWidthInfo> {
    // 1. 動態計算序號欄寬度
    if (showReorder) {
      const headerWidth = 2 * TableReportWidthService.CHINESE_CHAR_WIDTH;
      const maxSerialString = String(totalRecords || data?.length || 1);
      const bodyWidth = maxSerialString.length * TableReportWidthService.ANY_CHAR_WIDTH;
      const finalSerialWidth = Math.max(headerWidth, bodyWidth, 14);
      this.serialColumnWidth = `${finalSerialWidth}px`;
    }

    const result: Record<string, ColumnWidthInfo> = {};
    if (!data || data.length === 0 || !columns || columns.length === 0) {
      return result;
    }

    const rootFontPx = this.getRootFontSize();
    for (const col of columns) {
      if (col.type === 'image' || col.type === 'button' || customTemplateFields.has(col.field)) continue;

      let minPx = TableReportWidthService.DEFAULT_MIN_WIDTH;
      if (col.width) {
        const parsed = this.parseWidthToPx(col.width, rootFontPx);
        if (parsed === null) continue;
        minPx = parsed;
      }

      let maxTextWidth = 0;
      for (const row of data) {
        const rawValue = row?.[col.field];
        let displayValue = col.format ? String(col.format(rawValue, 0, row) ?? '') : String(rawValue ?? '');
        if (col.type === 'html') {
          displayValue = this.stripHtml(displayValue);
        }
        const textWidth = this.estimateTextWidth(displayValue);
        if (textWidth > maxTextWidth) maxTextWidth = textWidth;
      }

      const extra = col.type === 'link' ? TableReportWidthService.LINK_BUTTON_EXTRA : 0;
      const estimated = maxTextWidth === 0 ? 0 : Math.ceil(maxTextWidth + TableReportWidthService.PADDING_BUFFER + extra);
      const colMaxPx = col.maxWidth ? this.parseWidthToPx(col.maxWidth, rootFontPx) : null;
      const maxPx = Math.min(colMaxPx ?? TableReportWidthService.MAX_COLUMN_WIDTH, TableReportWidthService.MAX_COLUMN_WIDTH);
      const cappedEstimate = Math.min(estimated, maxPx);
      const finalPx = Math.max(minPx, cappedEstimate);

      result[col.field] = {
        px: `${finalPx}px`,
        truncated: estimated > maxPx && estimated > minPx,
      };
    }
    return result;
  }

  /** 合併欄寬：每欄取較大值（只增不減）；truncated 一旦成立就保留；next 沒有的欄位保留 previous */
  public mergeGrowOnly(
    previous: Record<string, ColumnWidthInfo>,
    next: Record<string, ColumnWidthInfo>
  ): Record<string, ColumnWidthInfo> {
    const merged: Record<string, ColumnWidthInfo> = { ...previous };
    for (const field of Object.keys(next)) {
      const prev = previous[field];
      const cur = next[field];
      if (!prev) {
        merged[field] = cur;
        continue;
      }
      merged[field] = {
        px: Number.parseFloat(cur.px) > Number.parseFloat(prev.px) ? cur.px : prev.px,
        truncated: prev.truncated || cur.truncated,
      };
    }
    return merged;
  }

  /** 去除 HTML 標籤與實體，回傳畫面上實際顯示的純文字 */
  public stripHtml(html: string): string {
    return html.replaceAll(/<[^>]*>/g, '').replaceAll(/&[a-zA-Z#0-9]+;/g, ' ');
  }

  /**
   * 估算字串在畫面上實質佔用的像素寬度
   */
  private estimateTextWidth(text: string): number {
    if (!text) return 0;
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      width += text.charCodeAt(i) > 127
        ? TableReportWidthService.CHINESE_CHAR_WIDTH
        : TableReportWidthService.ANY_CHAR_WIDTH;
    }
    return width;
  }

  /** 僅支援 px / rem；其他單位回傳 null（交還給 col.width 原樣處理） */
  private parseWidthToPx(width: string, rootFontPx: number): number | null {
    const match = /^\s*(\d+(?:\.\d+)?)\s*(px|rem)?\s*$/i.exec(width);
    if (!match) return null;
    const value = Number.parseFloat(match[1]);
    return match[2]?.toLowerCase() === 'rem' ? value * rootFontPx : value;
  }

  private getRootFontSize(): number {
    if (typeof document === 'undefined') return 16;
    const size = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    return Number.isFinite(size) && size > 0 ? size : 16;
  }
}
