// table-utility.service.ts
import { Injectable } from '@angular/core';
import { Column, ColumnGroup } from './table.model';
import { finalize, Observable, tap } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { NotificationService } from '@shared/component/notification-message/notification.service';

@Injectable({
  providedIn: 'root'
})
export class TableUtilityService {

  constructor(private messageService: NotificationService) { }

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
    const groupFields = columnGroup.map(g => g.field);
    return columns.filter(
      col =>
        (!col.groupField || !groupFields.includes(col.groupField)) &&
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

  /**
   * 處理全部展開/收合的邏輯。
   * @param data 所有資料
   * @param expression 展開狀態
   * @param dataKey 唯一識別鍵
   * @param expansionDataKey 展開資料的鍵名
   * @param expansionLoadFn 載入展開資料的函數
   * @param expandedRows 已展開行的映射表
   * @param hostComponent 用來處理 `untilDestroyed` 的元件
   */
  toggleExpandCollapseLogic(
    data: any[],
    expression: boolean,
    dataKey: string,
    expansionDataKey: string,
    expansionLoadFn: ((data: any) => Observable<any>) | undefined,
    expandedRows: Record<string, boolean>,
    hostComponent: any
  ): void {
    if (expression) {
      data.forEach(rowData => {
        const rowKey = rowData[dataKey];
        if (!expandedRows[rowKey]) {
          this.toggleRowExpansionLogic(rowData, dataKey, expansionDataKey, expansionLoadFn, expandedRows, hostComponent);
        }
      });
    } else {
      // 收合所有行
      Object.keys(expandedRows).forEach(key => delete expandedRows[key]);
    }
  }
  // 新增一個方法來驗證行數據
  validateRowData(rowData: any, columns: Column[], data: any, messageService: NotificationService, dataKey: string, defaultInsertData?: any): boolean {
    // 新增的預設判斷：檢查除了 dataKey 以外的所有欄位是否都為 null/undefined/空字串
    const otherColumns = columns.filter(col => col.field !== dataKey);
    // 檢查 rowData 的值是否都與 defaultInsertData 的值完全相同
    // 這才是判斷「使用者是否修改過任何欄位」的正確方式
    const isRowUnchangedFromDefault = otherColumns.every(col => {
      const currentValue = rowData[col.field];
      // 判斷 defaultInsertData 中是否存在該欄位，如果沒有則預設為 null (與 newRowData 的初始化邏輯一致)
      const defaultValue = (defaultInsertData && defaultInsertData[col.field] !== undefined)
        ? defaultInsertData[col.field]
        : null;
      // 比較當前值與預設值是否相同
      return currentValue === defaultValue;
    });

    // 如果 rowData 保持未變動，則顯示錯誤訊息並返回 false
    if (isRowUnchangedFromDefault) {
      messageService.errorBubble('請輸入至少一個欄位的值', '未輸入任何值');
      return false; // 驗證失敗
    }

    // 原始的驗證邏輯
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
}
