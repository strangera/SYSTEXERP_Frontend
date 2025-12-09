import { Injectable } from '@angular/core';
import { TableColumnReorderEvent } from 'primeng/table';
import { ColumnGroup, EditColumn } from '../fin32020table-edit.model';

@Injectable({
  providedIn: 'root'
})
export class TableUtilityService {
  insertNewRow(
    data: any[],
    originalColumns: EditColumn[],
    dataKey: string,
    defaultInsertData: any,
    dataStatusField: string, // 新增參數
    dataStatusValue: { Original: string; New: string; Modified: string; Deleted: string; } // 新增參數
  ): { newRowData: any, data: any[] } {
    // 1. 將 defaultInsertData 中的所有屬性複製到新行資料中
    // 這樣就可以包含 'QQQ' 這樣未在 columns 中定義的欄位
    const newRowData: Record<string, any> = { ...defaultInsertData };
    // 2. 遍歷 columns，確保所有定義的欄位都存在。
    // 如果欄位沒有在 defaultInsertData 中定義，則將其設為 null，以確保資料結構一致
    originalColumns.forEach(col => {
      if (newRowData[col.field] === undefined) {
        newRowData[col.field] = null;
      }
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

  // 分組標題
  getGroupHeader(groupField: string, columnGroup: ColumnGroup[]): string {
    return columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  // 分組欄位對齊
  getGroupAlignClass(groupField: string, columnGroup: ColumnGroup[]): string {
    const align = columnGroup?.find(g => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }
  // 計算分組欄位跨度
  getColumnSpan(columns: EditColumn[], groupField: string): number {
    return columns.filter(col => col.groupField === groupField).length;
  }
  // 欄位調整
  onColReorder(event: TableColumnReorderEvent) {
    return event.columns as EditColumn[];// 欄位調整
  }
  /**
     * 處理行重新排序邏輯，確保新增候選行始終在末尾。
     * @param data 當前表格的顯示資料 (_tableData)
     * @param canInsert 是否允許新增行
     * @returns 排序後的資料陣列
     */
  reorderTableData(data: any[], canInsert: boolean, disabled: boolean): any[] {
    if (!canInsert || disabled) {
      return data; // 如果不允許新增，直接返回排序後的資料
    }

    const candidateIndex = data.findIndex(item => item['_isAutoInsertCandidate']);
    const lastIndex = data.length - 1;

    // 如果存在新增行，且它不在最後一位 (代表使用者拖曳了資料)
    if (candidateIndex !== -1 && candidateIndex !== lastIndex) {
      // 1. 移除新增候選行
      const candidateRow = data.splice(candidateIndex, 1)[0];
      // 2. 將新增候選行放回末尾
      data.push(candidateRow);
      // 注意：PrimeNG 的 onRowReorder 事件已經處理了 data 陣列本身的順序修改。
      // 這裡我們只需要處理將新增候選行「歸位」到陣列末尾的邏輯。
      // 由於 data 是傳址，因此直接修改 data 陣列即可。
    }

    // 由於 PrimeNG 的 Table RowReorder 已經在原始陣列上完成了排序，
    // 且上面的邏輯保證了新增行在最後，所以直接返回 data 即可。
    return data;
  }
}
