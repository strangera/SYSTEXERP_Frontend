import { Injectable } from '@angular/core';
import { EditColumn } from './table-edit.model';

@Injectable({
  providedIn: 'root'
})
export class TableUtilityService {
  /**
   * 驗證整行資料。此方法將返回一個包含所有欄位錯誤的物件。
   * @param rowData 當前行資料
   * @param columns 欄位配置
   * @param data 完整的表格資料 (用於跨行驗證)
   * @returns {isValid: boolean, errors: { [field: string]: string[] }} 驗證結果
   */
  validateRowData(rowData: any, columns: EditColumn[], data: any): { isValid: boolean, errors: Record<string, string[]> } {
    const allFieldErrors: Record<string, string[]> = {};
    let isRowValid = true;

    // 檢查所有欄位是否都符合各自的驗證規則
    for (const col of columns) {
      if (col.validate) {
        for (const validateFn of col.validate) {
          const { isValid, errorMessage } = validateFn(rowData[col.field], rowData, data, col.field, col.header);
          if (!isValid) {
            isRowValid = false;
            if (!allFieldErrors[col.field]) {
              allFieldErrors[col.field] = [];
            }
            allFieldErrors[col.field].push(...errorMessage); // 收集所有錯誤訊息
          }
        }
      }
    }
    return { isValid: isRowValid, errors: allFieldErrors };
  }
  insertNewRow(
    data: any[],
    originalColumns: EditColumn[],
    dataKey: string,
    defaultInsertData: any,
    dataStatusField: string, // 新增參數
    dataStatusValue: { Original: string; New: string; Modified: string; Deleted: string; } // 新增參數
  ): { newRowData: any, data: any[] } {
    const newRowData: Record<string, any> = {};
    originalColumns.forEach(col => {
      newRowData[col.field] = defaultInsertData[col.field] !== undefined
        ? defaultInsertData[col.field] : null;
    });
    const tempId = `temp-${new Date().getTime()}`;
    newRowData[dataKey] = tempId;
    newRowData[dataStatusField] = dataStatusValue.New; // 現在使用傳入的參數設定狀態
    newRowData['_isAutoInsertCandidate'] = true; // 新增旗標
    const updatedData = [...data, newRowData];
    return { newRowData, data: updatedData };
  }
  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: EditColumn, index: number, columns: EditColumn[]): boolean {
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

  // 取得可見欄位總數
  getVisibleColumnCount(columns: EditColumn[]): number {
    if (!Array.isArray(columns)) { return 0; }
    return columns.length;
  }
  // 計算分組欄位跨度
  getColumnSpan(columns: EditColumn[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField).length;
  }
}
