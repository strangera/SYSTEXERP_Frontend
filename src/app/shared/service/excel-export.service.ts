import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

// 更新 ExcelColumn 介面以符合你的需求
export interface ExcelColumn {
  field: string;
  header: string;
  visible?: boolean;
  format?: (value: any, rowData?: any) => string | number | null;
  width?: number; // 新增：可自訂欄位寬度
  excelFormat?: string; // 新增：Excel 格式設定，例如 '0.00' 或 'yyyy/mm/dd'
}

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  // 【修改 1/3】定義預設的 Excel 格式為 null，表示不強制設定格式
  private readonly DEFAULT_EXCEL_FORMAT: string | null = null;
  // 定義範本中預設要包含的空資料行數
  private readonly TEMPLATE_EMPTY_ROWS = 10000; // 預設新增 100 行空資料

  /**
   * 匯出 Excel 範本
   * 該範本只包含指定的標題列，沒有資料。
   * **修正：** 新增多行空資料，並對所有空資料單元格套用 'excelFormat'。
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

        // 建立多行空資料
        const emptyRowData = visibleColumns.map(() => '');
        const dataRows: any[] = [];
        for (let i = 0; i < this.TEMPLATE_EMPTY_ROWS; i++) {
          dataRows.push([...emptyRowData]); // 複製空行
        }

        const dataForTemplate = [titles, ...dataRows];
        const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataForTemplate);

        // --- 應用格式到所有預設的空資料單元格 (從 r=1 到 r=100) ---
        visibleColumns.forEach((col, colIndex) => {
          // 【修改 2/3】如果 excelFormat 未指定，則 format 為 null，不設定 cell.z
          const format = col.excelFormat || this.DEFAULT_EXCEL_FORMAT;

          if (format) { // 僅當 format 存在時才進行格式設定
            // 從資料列的第一行 (r=1) 開始到最後一行 (r=TEMPLATE_EMPTY_ROWS)
            for (let r = 1; r <= this.TEMPLATE_EMPTY_ROWS; r++) {
              const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: r });
              const cell = ws[cellAddress] || {};

              // 確保單元格有值 (例如一個空字串) 才能設定格式
              if (cell.v === undefined) {
                cell.t = 's'; // 設為字串類型
                cell.v = '';  // 設為空字串值
              }

              // 設定 Excel 數字格式 ('z' 屬性)
              cell.z = format;
              ws[cellAddress] = cell;
            }
          }
        });

        // --- 處理欄位寬度 (不變) ---
        const wscols: any[] = [];
        const charWidthMultiplier = 1.5;

        visibleColumns.forEach(col => {
          if (col.width) {
            wscols.push({ wch: col.width });
            return;
          }

          // 計算標題寬度
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
        // 篩選範圍擴大到包含所有預設空行
        ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(visibleColumns.length - 1)}1` };

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
   * **修改：** 應用 `excelFormat`，如果未指定則不套用格式。
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
        let exportData: any[];

        if (columns && columns.length > 0) {
          finalColumns = columns.filter(col => col.visible !== false);
          exportData = data.map(item => {
            const transformedItem: any = {};
            finalColumns.forEach(col => {
              let value = item[col.field];
              if (col.format) {
                value = col.format(value, item);
              }
              // 使用 header 作為 key 以便 json_to_sheet 正確生成工作表
              transformedItem[col.header] = value;
            });
            return transformedItem;
          });
          ws = XLSX.utils.json_to_sheet(exportData);
        } else {
          finalColumns = Object.keys(data[0] || {}).map(key => ({ field: key, header: key }));
          exportData = data;
          ws = XLSX.utils.json_to_sheet(data);
        }

        // --- 應用整欄格式 (excelFormat) ---
        const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
        const headerRowCount = 1; // 假設第一行是標題

        finalColumns.forEach((col, colIndex) => {
          // 【✅ 修改 3/3-A】如果 excelFormat 未指定，則 format 為 null，不設定 cell.z
          const format = col.excelFormat || this.DEFAULT_EXCEL_FORMAT;

          if (format) { // 僅當 format 存在時才進行格式設定
            // 從資料的第二行開始 (r = 1) 遍歷到最後一行
            for (let r = range.s.r + headerRowCount; r <= range.e.r; r++) {
              const cellAddress = XLSX.utils.encode_cell({ c: colIndex, r: r });
              const cell = ws[cellAddress];

              if (cell) {
                // 設定 Excel 數字格式 ('z' 屬性)
                cell.z = format;

                // 【移除】移除強制改為字串的邏輯，讓 XLSX.utils.json_to_sheet 自動處理類型
                // if (format === '@' && cell.t !== 's') { ... }
              }
            }
          }
        });
        // --- 應用整欄格式結束 ---


        // --- 處理欄位寬度 (不變) ---
        const wscols: any[] = [];
        const charWidthMultiplier = 1.5;

        finalColumns.forEach((col) => {
          if (col.width) {
            wscols.push({ wch: col.width });
            return;
          }

          const lengths = [col.header].concat(
            data.map(item => {
              const value = item[col.field];
              if (col.format) {
                // 這裡使用 exportData 中的 header 作為 key 來查找對應的值
                const formattedValue = exportData.find(e => e === item)?.[col.header];
                return formattedValue ? String(formattedValue) : '';
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
        ws['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(finalColumns.length - 1)}${data.length + 1}` }; // 增加自動篩選

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
