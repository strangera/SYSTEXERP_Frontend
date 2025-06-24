import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { NotificationService } from '../component/notification-message/notification.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {

  constructor(private readonly messageService: NotificationService,
  ) { }

  importExcel(file: File, columns: string[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // 從第二行開始讀取資料 (header: 1 表示第一行為標頭，數據從第二行開始)
          const jsonData: any[][] = XLSX.utils.sheet_to_json<any[][]>(worksheet, { header: 1 });

          // 確保 jsonData 至少有標頭行，否則就沒有數據行
          if (jsonData.length <= 1) {
            console.warn('Excel檔案中沒有可讀取的數據行。');
            this.messageService.warnBubble('Excel檔案中沒有可讀取的數據行。');
            resolve([]); // 沒有數據行，直接返回空陣列
            return;
          }

          let clearedRowCount = 0; // 記錄被清除的資料筆數

          // 從第二行開始處理資料 (跳過標頭行)
          const processedData = jsonData.slice(1).reduce((acc: any[], row: any[]) => {
            // 檢查該資料列是否所有欄位都為空或 null 或 undefined
            const isRowEmpty = columns.every((_, index) => {
              const value = row[index];
              // 檢查值是否為 undefined, null, 或空字串 (trim() 處理空格)
              return value === undefined || value === null || String(value).trim() === '';
            });

            if (!isRowEmpty) {
              // 如果不是空行，則進行轉換並加入結果
              const obj: any = {};
              columns.forEach((column, index) => {
                const value = row[index];
                // 處理 undefined 或 null 值為 null，其他值轉換為字串並 trim()
                obj[column] = value === undefined || value === null ? null : String(value).trim();
              });
              acc.push(obj);
            } else {
              // 如果是空行，增加清除計數
              clearedRowCount++;
            }
            return acc;
          }, []);
          if (clearedRowCount > 0) {
            console.log(`已清除 ${clearedRowCount} 筆所有欄位皆為空的資料。`);
            this.messageService.warnBubble(`已清除 ${clearedRowCount} 筆所有欄位皆為空的資料。`);
          }

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
