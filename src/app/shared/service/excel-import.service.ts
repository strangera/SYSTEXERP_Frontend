import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { NotificationService } from '../component/notification-message/notification.service';

// 定義欄位的介面，新增 type 屬性
export interface ImportExcelColumn {
  field: string;
  header: string;
  type?: 'string' | 'number' | 'date'; // 用於匯入時轉換資料類型
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {

  constructor(private readonly messageService: NotificationService) { }

  /**
   * 匯入 Excel 檔案並轉換為 JSON 格式
   * @param file 使用者選擇的檔案
   * @param columns 欄位定義陣列，包含 field 和 type
   */
  async importExcel(file: File, columns: ImportExcelColumn[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // 使用 { header: 1 } 從第一行讀取資料陣列
          const jsonData: any[][] = XLSX.utils.sheet_to_json<any[][]>(worksheet, { header: 1 });

          if (jsonData.length <= 1) {
            this.messageService.warnBubble('Excel 檔案中沒有可讀取的數據行。');
            resolve([]);
            return;
          }

          const headerRow = jsonData[0]; // 第一行為標頭
          const dataRows = jsonData.slice(1); // 數據從第二行開始

          const processedData = dataRows.reduce((acc: any[], row: any[]) => {
            // 檢查該資料列是否所有欄位都為空或 null 或 undefined
            const isRowEmpty = columns.every((_, index) => {
              const value = row[index];
              return value === undefined || value === null || String(value).trim() === '';
            });

            if (!isRowEmpty) {
              const obj: any = {};
              columns.forEach((col, index) => {
                let value = row[index];

                // 根據 columns 陣列中的 type 屬性進行轉換
                switch (col.type) {
                  case 'number':
                    // 如果值是有效的數字，則轉換為數字類型，否則為 null
                    value = value === null || isNaN(Number(value)) ? null : Number(value);
                    break;
                  case 'date':
                    // 將 Excel 的日期格式數字轉換為 JavaScript Date 物件
                    // 注意：這裡假設 Excel 匯入的日期是數字格式
                    if (typeof value === 'number') {
                      value = XLSX.SSF.parse_date_code(value);
                      value = new Date(value.y, value.m - 1, value.d);
                    } else {
                      // 如果是字串，嘗試解析
                      value = value ? new Date(value) : null;
                    }
                    break;
                  case 'string':
                  default:
                    // 預設或明確為字串，處理 undefined 或 null
                    value = value === undefined || value === null ? null : String(value).trim();
                    break;
                }
                obj[col.field] = value;
              });
              acc.push(obj);
            }
            return acc;
          }, []);

          resolve(processedData);
        } catch (error) {
          console.error('Excel 檔案讀取或解析失敗:', error);
          this.messageService.warnBubble('Excel 檔案讀取或解析失敗');
          reject(new Error('無法讀取 Excel 檔案或檔案格式不正確。請確認檔案內容。'));
        }
      };

      reader.onerror = (error) => {
        console.error('檔案讀取錯誤:', error);
        reject(new Error('檔案讀取失敗。請確保檔案未損壞且可訪問。'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
}
