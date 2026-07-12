import { Injectable } from '@angular/core';
import { ReportColumn } from '../table-report.model';

@Injectable()
export class TableReportWidthService {
  // 內部維護序號寬度狀態
  public serialColumnWidth = '60px';

  /**
   * 計算並固定每個欄位的寬度
   */
  public calculateAndFixColumnWidths(
    columns: ReportColumn[],
    data: any[],
    totalRecords: number,
    showReorder: boolean
  ): ReportColumn[] {
    const CHINESE_CHAR_WIDTH = 16;
    const ANY_CHAR_WIDTH = 9;
    const PADDING_BUFFER = 24;

    // 1. 動態計算序號欄寬度
    if (showReorder) {
      const headerWidth = 2 * CHINESE_CHAR_WIDTH;
      const maxSerialString = String(totalRecords || data.length || 1);
      const bodyWidth = maxSerialString.length * ANY_CHAR_WIDTH;
      const finalSerialWidth = Math.max(headerWidth, bodyWidth, 14);
      this.serialColumnWidth = `${finalSerialWidth}px`;
    }

    if (!data || data.length === 0 || !columns || columns.length === 0) {
      return columns;
    }

    const sampleData = data.slice(0, 100);

    // 2. 遍歷並計算欄位寬度
    return columns.map(col => {
      // 如果外部已經有設定 width，尊重原設定
      if (col.width) {
        return col;
      }

      let maxLength = 0;
      let minLength = Infinity;

      sampleData.forEach(row => {
        const rawValue = row[col.field];
        let displayValue = col.format ? String(col.format(rawValue, 0, row) ?? '') : String(rawValue ?? '');

        if (col.type === 'html') {
          displayValue = displayValue.replaceAll(/<[^>]*>/g, '');
        }

        const textWidth = this.estimateTextWidth(displayValue, CHINESE_CHAR_WIDTH, ANY_CHAR_WIDTH);
        if (textWidth > maxLength) maxLength = textWidth;
        if (textWidth < minLength) minLength = textWidth;
      });

      if (minLength === Infinity || maxLength === 0) {
        minLength = 50;
        maxLength = 96;
      }

      let finalMax = maxLength + PADDING_BUFFER;
      let finalMin = minLength + PADDING_BUFFER;

      if (col.format) {
        finalMin = Math.max(finalMax, 55);
        finalMax = Math.min(finalMin, 800);
      } else {
        finalMin = Math.max(finalMin, 55);
        finalMax = Math.min(Math.max(finalMax, 120), 200);
      }

      // 回傳全新計算好的 Column 物件
      return {
        ...col,
        dynamicMinWidth: `${finalMin}px`,
        dynamicWidth: `${finalMax}px`,
        dynamicMaxWidth: `${finalMax}px`
      };
    });
  }

  /**
   * 估算字串在畫面上實質佔用的像素寬度
   */
  private estimateTextWidth(text: string, chineseWidth: number, anyWidth: number): number {
    if (!text) return 0;
    let width = 0;
    for (let i = 0; i < text.length; i++) {
      if (text.charCodeAt(i) > 127) {
        width += chineseWidth;
      } else {
        width += anyWidth;
      }
    }
    return width;
  }
}
