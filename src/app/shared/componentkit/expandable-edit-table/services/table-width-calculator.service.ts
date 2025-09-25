import { ColumnDef } from '@shared/componentkit/expandable-edit-table/expandable-edit-table.component';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TableWidthCalculatorService {
  private widthCache = new Map<string, number>();

  calculateOptimalWidths(
    data: any[],
    columns: ColumnDef[],
    containerWidth: number,
    options: {
      minColumnWidth: number;
      maxColumnWidth: number;
      fixedColumnsWidth: number;
    }
  ): { [field: string]: number } {
    const availableWidth = containerWidth - options.fixedColumnsWidth - 20;
    const columnWidths: { [field: string]: number } = {};

    // 計算各欄位內容寬度
    columns.forEach(column => {
      if (!column.hidden) {
        const contentWidth = this.getColumnContentWidth(data, column);
        const headerWidth = this.estimateTextWidth(column.header, 'header');

        let calculatedWidth = Math.max(contentWidth, headerWidth);
        calculatedWidth = Math.max(calculatedWidth, options.minColumnWidth);
        calculatedWidth = Math.min(calculatedWidth, options.maxColumnWidth);

        columnWidths[column.field] = calculatedWidth;
      }
    });

    // 如果總寬度超出，按比例縮放
    const totalCalculated = Object.values(columnWidths).reduce((sum, w) => sum + w, 0);
    if (totalCalculated > availableWidth) {
      const scale = availableWidth / totalCalculated;
      Object.keys(columnWidths).forEach(field => {
        columnWidths[field] = Math.max(options.minColumnWidth, columnWidths[field] * scale);
      });
    }

    return columnWidths;
  }

  private getColumnContentWidth(data: any[], column: ColumnDef): number {
    const cacheKey = `${column.field}_${data.length}`;
    if (this.widthCache.has(cacheKey)) {
      return this.widthCache.get(cacheKey)!;
    }

    let maxWidth = 0;
    const sampleData = data.length > 100 ? data.slice(0, 100) : data;

    sampleData.forEach(row => {
      const value = row[column.field];
      const displayValue = this.getDisplayValueForWidth(value, column);
      const estimatedWidth = this.estimateTextWidth(displayValue, column.type);
      maxWidth = Math.max(maxWidth, estimatedWidth);
    });

    maxWidth += this.getExtraWidthForType(column.type);
    this.widthCache.set(cacheKey, maxWidth);
    return maxWidth;
  }

  private getDisplayValueForWidth(value: any, column: ColumnDef): string {
    if (value === null || value === undefined) return '';

    switch (column.type) {
      case 'date': return '2024/12/31'; // 固定最長格式估算
      case 'number': return typeof value === 'number' ? value.toLocaleString() : String(value);
      case 'checkbox': return '☑';
      default: return String(value);
    }
  }

  private estimateTextWidth(text: string, fieldType?: string): number {
    if (!text) return 50;

    const baseCharWidth = 8;
    const typeMultipliers: { [key: string]: number } = {
      'header': 1.2, 'number': 0.8, 'date': 0.9,
      'dropdown': 1.1, 'text': 1.0, 'checkbox': 0.5
    };

    const multiplier = typeMultipliers[fieldType || 'text'] || 1.0;
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const otherChars = text.length - chineseChars;

    return Math.ceil((chineseChars * baseCharWidth * 1.8 + otherChars * baseCharWidth) * multiplier);
  }

  private getExtraWidthForType(type?: string): number {
    const extraSpace: { [key: string]: number } = {
      'checkbox': 20, 'date': 40, 'dropdown': 30,
      'number': 20, 'button': 20, 'text': 25
    };
    return extraSpace[type || 'text'] || 25;
  }

  clearCache(): void {
    this.widthCache.clear();
  }
}
