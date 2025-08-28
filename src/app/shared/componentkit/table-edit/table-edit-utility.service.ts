import { Injectable } from '@angular/core';
import { Column } from './table-edit.model';

@Injectable({
  providedIn: 'root'
})
export class TableUtilityService {
  // 新增一個方法來檢查新增模式下的資料是否被修改
  isNewRowUnchanged(rowData: any, columns: Column[], dataKey: string, defaultInsertData: any): boolean {
    const otherColumns = columns.filter(col => col.field !== dataKey);
    return otherColumns.every(col => {
      const currentValue = rowData[col.field];
      const defaultValue = (defaultInsertData && defaultInsertData[col.field] !== undefined)
        ? defaultInsertData[col.field]
        : null;
      return currentValue === defaultValue;
    });
  }
  // 驗證整行資料
  validateRowData(rowData: any, columns: Column[], data: any, messageService: any): boolean {
    // 檢查所有欄位是否都符合各自的驗證規則
    return columns.every(col =>
      !(col.validate?.some(validateFn => {
        const { isValid, errorMessage } = validateFn(rowData[col.field], rowData, data, col.field, col.header);
        if (!isValid) {
          const [message, title] = errorMessage;
          messageService.errorBubble(message, title);
        }
        return !isValid;
      }))
    );
  }
  insertNewRow(data: any[], originalColumns: Column[], dataKey: string, defaultInsertData: any): { newRowData: any, data: any[] } {
    const newRowData: Record<string, any> = {};
    originalColumns.forEach(col => {
      newRowData[col.field] = defaultInsertData[col.field] !== undefined
        ? defaultInsertData[col.field] : null;
    });
    // 產生一個臨時 ID
    const tempId = `temp-${new Date().getTime()}`;
    newRowData[dataKey] = tempId;
    // 將新資料加入到資料陣列的開頭
    const updatedData = [newRowData, ...data];
    // 回傳新資料和更新後的資料陣列
    return { newRowData, data: updatedData };
  }
}
