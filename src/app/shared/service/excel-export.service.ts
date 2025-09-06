import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// 更新 ExcelColumn 介面以符合你的需求
export interface ExcelColumn {
  field: string;
  header: string;
  visible?: boolean;
  format?: (value: any, rowData?: any) => string | number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  /**
   * 匯出 Excel 範本
   * 該範本只包含指定的標題列，沒有資料。
   * @param columns 列的定義陣列。
   * @param fileName 匯出檔案的名稱（不含副檔名）。
   */
  public exportTemplate(columns: ExcelColumn[], fileName = 'template'): void {
    if (!columns || columns.length === 0) {
      console.error('匯出失敗：未提供欄位定義。');
      return;
    }

    // 過濾掉 visible: false 的欄位，只匯出可見的標頭
    const visibleColumns = columns.filter(col => col.visible !== false);
    const titles = visibleColumns.map(col => col.header);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([titles]);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '範本');

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  /**
   * 匯出資料為 Excel 檔案
   * 可選地提供 columns 陣列來格式化標頭和資料。
   * @param data 要匯出的 JSON 陣列。
   * @param fileName 匯出檔案的名稱（不含副檔名）。
   * @param columns 可選，用於定義匯出欄位、標頭和格式的陣列。
   */
  public exportData(data: any[], fileName = 'export', columns?: ExcelColumn[]): void {
    if (!data || data.length === 0) {
      console.error('匯出失敗：提供的資料為空。');
      return;
    }

    let ws: XLSX.WorkSheet;

    if (columns && columns.length > 0) {
      // 過濾掉 visible: false 的欄位
      const visibleColumns = columns.filter(col => col.visible !== false);

      // 轉換資料，將欄位名稱 (field) 轉換為標題 (header)
      const exportData = data.map(item => {
        const transformedItem: any = {};
        visibleColumns.forEach(col => {
          let value = item[col.field];

          // 如果有提供格式化函式，就呼叫它來處理值
          if (col.format) {
            value = col.format(value, item);
          }

          // 將格式化或原始值存入新物件，key 為標頭
          transformedItem[col.header] = value;
        });
        return transformedItem;
      });

      // 使用 json_to_sheet 匯出，會自動使用轉換後的中文標頭
      ws = XLSX.utils.json_to_sheet(exportData);
    } else {
      // 沒有提供 columns，直接匯出原始資料
      ws = XLSX.utils.json_to_sheet(data);
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '資料');

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }
}
