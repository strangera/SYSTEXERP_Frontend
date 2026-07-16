// table-utility.service.ts
import { Injectable } from '@angular/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { finalize, Observable, tap } from 'rxjs';
import { Column, ColumnGroup } from './table.model';

@Injectable({
  providedIn: 'root'
})
export class TableUtilityService {

  constructor(
    private readonly messageService: NotificationService,
  ) { }

  // 判斷欄位是否可見
  isColumnVisible(col: Column): boolean {
    return col.visible !== false && col.hidden !== true;
  }

  // 計算分組欄位跨度
  getColumnSpan(columns: Column[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField && this.isColumnVisible(col)).length;
  }

  // 取得沒有分組的欄位
  getUngroupedColumns(columns: Column[], columnGroup: ColumnGroup[]): Column[] {
    const groupFields = new Set(columnGroup.map(g => g.field));
    return columns.filter(
      col =>
        (!col.groupField || !groupFields.has(col.groupField)) &&
        this.isColumnVisible(col)
    );
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

  // 計算分組小計
  getGroupSubtotal(data: any[], groupRowsBy: string, groupValue: any, field: string): number {
    const rows = data.filter(item => item[groupRowsBy] === groupValue);
    return rows.reduce((sum: number, row: any) => sum + (row[field] || 0), 0);
  }

  // 計算全表總計
  getTotal(data: any[], field: string): number {
    return data.reduce((sum: number, row: any) => sum + (row[field] || 0), 0);
  }

  /**
   * 處理單一行的展開/收合邏輯。
   * @param rowData 該行資料
   * @param dataKey 唯一識別鍵
   * @param expansionDataKey 展開資料的鍵名
   * @param expansionLoadFn 載入展開資料的函數
   * @param expandedRows 已展開行的映射表
   * @param hostComponent 用來處理 `untilDestroyed` 的元件
   */
  toggleRowExpansionLogic(
    rowData: any,
    dataKey: string,
    expansionDataKey: string,
    expansionLoadFn: ((data: any) => Observable<any>) | undefined,
    expandedRows: Record<string, boolean>,
    hostComponent: any
  ): void {
    const rowKey = rowData[dataKey];
    const hasDetails = rowData[expansionDataKey] && rowData[expansionDataKey]?.length > 0;

    if (hasDetails) {
      // 如果已經有資料，直接切換狀態
      if (expandedRows[rowKey]) {
        delete expandedRows[rowKey]; // 收合
      } else {
        expandedRows[rowKey] = true; // 展開
      }
    } else if (expansionLoadFn) {
      // 第一次展開，沒有資料，才呼叫 API 載入
      rowData.expansionLoading = true;
      expansionLoadFn(rowData)
        .pipe(
          untilDestroyed(hostComponent),
          finalize(() => {
            rowData.expansionLoading = false;
          }),
          tap(response => {
            const responseData = response.Data;
            if (responseData && Array.isArray(responseData) && responseData.length > 0) {
              rowData[expansionDataKey] = responseData;
              expandedRows[rowKey] = true;
            } else {
              this.messageService.infoBubble('查無詳細資料。');
            }
          })
        )
        .subscribe();
    }
  }

  // 新增一個方法來驗證行數據
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

  // 新增一個方法來檢查新增模式下的資料是否被修改
  isNewRowUnchanged(rowData: any, columns: Column[], dataKey: string, defaultInsertData: any): boolean {
    const otherColumns = columns.filter(col => col.field !== dataKey);
    return otherColumns.every(col => {
      const currentValue = rowData[col.field];
      const defaultValue = (defaultInsertData?.[col.field] !== undefined)
        ? defaultInsertData[col.field]
        : null;
      return currentValue === defaultValue;
    });
  }

  validateSingleField(value: any, rowData: any, data: any[], column: Column, messageService: any): boolean {
    if (!column.validate) {
      return true; // 沒有驗證規則，直接通過
    }

    const hasValidationError = column.validate.some(validateFn => {
      const { isValid, errorMessage } = validateFn(value, rowData, data, column.field, column.header);
      if (!isValid) {
        const [message, title] = errorMessage;
        messageService.errorBubble(message, title);
      }
      return !isValid;
    });

    return !hasValidationError; // 回傳是否通過驗證
  }

  insertNewRow(data: any[], originalColumns: Column[], dataKey: string, defaultInsertData: any): { newRowData: any, data: any[] } {
    const newRowData: Record<string, any> = {};
    for (const col of originalColumns) {
      newRowData[col.field] = defaultInsertData[col.field] !== undefined
        ? defaultInsertData[col.field] : null;
    }

    // 產生一個臨時 ID
    const tempId = `temp-${Date.now()}`;
    newRowData[dataKey] = tempId;

    // 將新資料加入到資料陣列的底部
    const updatedData = [...data, newRowData];

    // 回傳新資料和更新後的資料陣列
    return { newRowData, data: updatedData };
  }
}
