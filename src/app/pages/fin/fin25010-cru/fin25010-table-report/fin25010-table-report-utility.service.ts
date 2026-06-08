import { Injectable } from '@angular/core';
import { ReportColumn } from './fin25010-table-report.model';

@Injectable({
  providedIn: 'root'
})
export class TableReportUtilityService {
  // 判斷欄位是否可見
  isColumnVisible(col: ReportColumn): boolean {
    return col.visible !== false;
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
}
