import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// 更新 ExcelColumn 介面以符合你的需求
export interface ExcelColumn {
  field: string;
  header: string;
  visible?: boolean;
  format?: (value: any, rowData?: any) => string | number | null;
  width?: number; // 新增：可自訂欄位寬度
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
  public exportTemplate(columns: ExcelColumn[], fileName = 'template'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!columns || columns.length === 0) {
          console.error('匯出失敗：未提供欄位定義。');
          return reject(new Error('未提供欄位定義。'));
        }

        const visibleColumns = columns.filter(col => col.visible !== false);
        const titles = visibleColumns.map(col => col.header);
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([titles]);

        const wscols: any[] = [];
        const charWidthMultiplier = 1.5;

        visibleColumns.forEach(col => {
          if (col.width) {
            wscols.push({ wch: col.width });
            return;
          }

          let maxLen = 0;
          const text = col.header;
          if (text) {
            let len = 0;
            for (let i = 0; i < text.length; i++) {
              const charCode = text.charCodeAt(i);
              if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
                len += charWidthMultiplier;
              } else {
                len += 1;
              }
            }
            maxLen = len;
          }
          wscols.push({ wch: Math.ceil(maxLen) + 5 });
        });

        ws['!cols'] = wscols;

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '範本');
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        resolve(); // 成功時解析 Promise
      } catch (error: any) {
        console.error('匯出範本時發生錯誤：', error);
        reject(error); // 失敗時拒絕 Promise
      }
    });
  }

  /**
   * 匯出資料為 Excel 檔案
   * @param data 要匯出的 JSON 陣列。
   * @param fileName 匯出檔案的名稱（不含副檔名）。
   * @param columns 可選，用於定義匯出欄位、標頭和格式的陣列。
   */
  public exportData(data: any[], fileName = 'export', columns?: ExcelColumn[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!data || data.length === 0) {
          console.error('匯出失敗：提供的資料為空。');
          return reject(new Error('提供的資料為空。'));
        }

        let ws: XLSX.WorkSheet;
        let finalColumns: ExcelColumn[];

        if (columns && columns.length > 0) {
          finalColumns = columns.filter(col => col.visible !== false);
          const exportData = data.map(item => {
            const transformedItem: any = {};
            finalColumns.forEach(col => {
              let value = item[col.field];
              if (col.format) {
                value = col.format(value, item);
              }
              transformedItem[col.header] = value;
            });
            return transformedItem;
          });
          ws = XLSX.utils.json_to_sheet(exportData);
        } else {
          finalColumns = Object.keys(data[0] || {}).map(key => ({ field: key, header: key }));
          ws = XLSX.utils.json_to_sheet(data);
        }

        const wscols: any[] = [];
        const charWidthMultiplier = 1.5;

        finalColumns.forEach((col, index) => {
          if (col.width) {
            wscols.push({ wch: col.width });
            return;
          }

          const lengths = [col.header].concat(
            data.map(item => {
              const value = item[col.field];
              if (col.format) {
                return col.format(value, item) ? String(col.format(value, item)) : '';
              }
              return value ? String(value) : '';
            })
          );

          let maxLen = 0;
          lengths.forEach(text => {
            if (!text) return;
            let len = 0;
            for (let i = 0; i < text.length; i++) {
              const charCode = text.charCodeAt(i);
              if (charCode >= 0x4E00 && charCode <= 0x9FFF) {
                len += charWidthMultiplier;
              } else {
                len += 1;
              }
            }
            if (len > maxLen) {
              maxLen = len;
            }
          });
          wscols.push({ wch: Math.ceil(maxLen) + 5 });
        });

        ws['!cols'] = wscols;

        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '資料');
        XLSX.writeFile(wb, `${fileName}.xlsx`);
        resolve(); // 成功時解析 Promise
      } catch (error: any) {
        console.error('匯出資料時發生錯誤：', error);
        reject(error); // 失敗時拒絕 Promise
      }
    });
  }
}
