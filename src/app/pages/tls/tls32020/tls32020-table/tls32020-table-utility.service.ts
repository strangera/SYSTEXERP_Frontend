import { Injectable } from '@angular/core';
import { ReportColumn } from './tls32020-report-table.model';

@Injectable({
  providedIn: 'root'
})
export class TableReportUtilityService {
  // 計算分組欄位跨度 (第二層)
  getColumnSpan(columns: ReportColumn[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField).length;
  }

  // 計算最外層群組欄位跨度 (第一層，例如：比較期/基準期/差異)
  getTopGroupSpan(columns: ReportColumn[], topGroupField: string): number {
    return columns.filter(col => col.topGroupField === topGroupField).length;
  }

  // 判斷是否應該渲染分組標題 (第二層)
  shouldRenderGroupHeader(col: ReportColumn, index: number, columns: ReportColumn[]): boolean {
    if (!col.groupField) {
      return false;
    }
    const currentGroup = col.groupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i];
      if (prev.groupField === currentGroup) {
        return false;
      }
    }
    return true;
  }

  // 判斷是否應該渲染最外層分組標題 (第一層)
  shouldRenderTopGroupHeader(col: ReportColumn, index: number, columns: ReportColumn[]): boolean {
    if (!col.topGroupField) {
      return false;
    }
    const currentGroup = col.topGroupField;
    for (let i = 0; i < index; i++) {
      const prev = columns[i];
      if (prev.topGroupField === currentGroup) {
        return false;
      }
    }
    return true;
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
}
