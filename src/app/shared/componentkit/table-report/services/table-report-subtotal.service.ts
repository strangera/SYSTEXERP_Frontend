import { Injectable } from '@angular/core';
import { ReportColumn } from '../table-report.model';

@Injectable()
export class TableReportSubtotalService {
  // 儲存每個群組的累加總計快取
  public groupTotals: Record<string, Record<string, number>> = {};

  /**
   * 清空小計累加器
   */
  public clearGroupTotals(): void {
    this.groupTotals = {};
  }

  /**
   * 對新載入或重新排序的資料進行增量計算，並更新 groupTotals
   */
  public updateGroupTotals(newData: any[], columns: ReportColumn[], groupRowsBy?: string): void {
    if (!groupRowsBy || !columns.some(col => col.isSubTotal)) {
      return;
    }

    // 找出作為分組依據的欄位定義
    const groupColumn = columns.find(col => col.field === groupRowsBy);
    const useFormatterForGroupKey = groupColumn?.format;

    for (const row of newData) {
      const rawValue = row[groupRowsBy];
      let groupKey: string;

      if (useFormatterForGroupKey) {
        groupKey = String(groupColumn.format!(rawValue) ?? '').trim() || 'UNKNOWN_GROUP';
      } else {
        groupKey = String(rawValue ?? '').trim() || 'UNKNOWN_GROUP';
      }

      // 如果 groupKey 找不到且原始值為空，跳過
      if (groupKey === 'UNKNOWN_GROUP' && (rawValue === undefined || rawValue === null)) {
        continue;
      }

      // 初始化該群組的總計物件
      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }

      // 進行增量加總
      for (const col of columns) {
        if (col.isSubTotal) {
          const field = col.field;
          const value = Number(row[field]) || 0; // 確保值是數字
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      }
    }
  }

  /**
   * 取得特定群組、特定欄位的小計數值（包含後端優先匹配與前端回退計算）
   */
  public getGroupSubtotal(
    rowData: any,
    col: ReportColumn,
    columns: ReportColumn[],
    groupRowsBy?: string,
    subTotalData?: any[]
  ): any {
    if (!groupRowsBy || !col.isSubTotal) {
      return '';
    }

    // 獲取用於分組的原始值與欄位定義
    const rawGroupValue = rowData[groupRowsBy];
    const groupColumn = columns.find(c => c.field === groupRowsBy);
    const useFormatterForGroupKey = groupColumn?.format;
    let matchKey: string;

    // 生成用於匹配的群組鍵
    if (useFormatterForGroupKey) {
      matchKey = String(groupColumn.format!(rawGroupValue) ?? '').trim() || 'UNKNOWN_GROUP';
    } else {
      matchKey = String(rawGroupValue ?? '').trim() || 'UNKNOWN_GROUP';
    }

    // ** 優先級 1：查找外部傳入的後端 subTotalData **
    if (subTotalData && subTotalData.length > 0) {
      const subtotalRow = subTotalData.find((item: any) => {
        const itemRawValue = item[groupRowsBy];
        let itemMatchKey: string;
        if (useFormatterForGroupKey) {
          itemMatchKey = String(groupColumn.format!(itemRawValue) ?? '').trim() || 'UNKNOWN_GROUP';
        } else {
          itemMatchKey = String(itemRawValue ?? '').trim() || 'UNKNOWN_GROUP';
        }
        return itemMatchKey === matchKey;
      });

      if (subtotalRow) {
        const subtotal = subtotalRow[col.field] ?? 0;
        return col.format ? col.format(subtotal) : subtotal;
      }
    }

    // ** 優先級 2：回退到前端自算累加的 groupTotals **
    const total = this.groupTotals[matchKey]?.[col.field] ?? 0;
    return col.format ? col.format(total) : total;
  }
}
