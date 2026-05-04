import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { NotificationService } from '../component/notification-message/notification.service';

export interface ImportExcelColumn {
  field: string;
  header: string;
  type?: 'string' | 'number' | 'date';
}

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {
  constructor(private readonly messageService: NotificationService) { }

  /**
   * 匯入 Excel 並產生完整檢核報告
   * @param file 檔案
   * @param columns 欄位定義
   * @param customValidator 自定義檢核邏輯
   */
  async importExcel(
    file: File,
    columns: ImportExcelColumn[],
    customValidator?: (rowData: any) => string
  ): Promise<{ data: any[], hasErrors: boolean, errorBlob?: Blob }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[][] = XLSX.utils.sheet_to_json<any[][]>(worksheet, { header: 1 });

          if (jsonData.length <= 1) {
            this.messageService.warnBubble('Excel 檔案中沒有可讀取的數據行。');
            resolve({ data: [], hasErrors: false });
            return;
          }

          const dataRows = jsonData.slice(1);
          let totalHasErrors = false;
          const fullReportData: any[] = []; // 用於產生 Excel 報告的完整資料
          const validDataOnly: any[] = [];  // 回傳給前端畫面的正確資料

          dataRows.forEach((row) => {
            const isRowEmpty = columns.every((_, index) => {
              const val = row[index];
              return val === undefined || val === null || String(val).trim() === '';
            });
            if (isRowEmpty) return;

            const obj: any = {};
            let rowError = '';

            // 1. 基礎類型檢查
            columns.forEach((col, index) => {
              let value = row[index];
              switch (col.type) {
                case 'number':
                  if (typeof value === 'string') value = value.replace(/,/g, '');
                  const num = (value === null || value === undefined || String(value).trim() === '') ? null : Number(value);
                  if (num !== null && isNaN(num)) rowError += `[${col.header}] 格式錯誤 `;
                  obj[col.field] = num;
                  break;
                case 'date':
                  if (typeof value === 'number') {
                    const dateCode = XLSX.SSF.parse_date_code(value);
                    value = new Date(dateCode.y, dateCode.m - 1, dateCode.d);
                  } else {
                    value = value ? new Date(value) : null;
                  }
                  if (value instanceof Date && isNaN(value.getTime())) {
                    rowError += `[${col.header}] 日期格式錯誤 `;
                  }
                  obj[col.field] = value;
                  break;
                default:
                  obj[col.field] = (value === undefined || value === null) ? null : String(value).trim();
                  break;
              }
            });

            // 2. 外部自定義檢查 (例如：檢查代號是否存在)
            if (customValidator) {
              const customErr = customValidator(obj);
              if (customErr) rowError += customErr;
            }

            // 3. 建立報告行 (保留使用者原始輸入內容供對照)
            const reportRow: any = {};
            columns.forEach((col, idx) => {
              reportRow[col.header] = row[idx];
            });
            reportRow['檢核結果'] = rowError ? '失敗' : '成功';
            reportRow['錯誤原因'] = rowError || '';
            reportRow['_isError'] = !!rowError; // 隱藏標記，用於後續染色
            fullReportData.push(reportRow);

            if (rowError) {
              totalHasErrors = true;
            } else {
              validDataOnly.push(obj);
            }
          });

          // 產生包含所有行與樣式的 Blob
          const errorBlob = this.generateFullReportBlob(XLSX, fullReportData, columns);

          resolve({
            data: validDataOnly,
            hasErrors: totalHasErrors,
            errorBlob: errorBlob
          });
        } catch (error) {
          console.error('Excel 解析失敗:', error);
          reject(error);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 產生美化版的檢核報告 Blob
   */
  private generateFullReportBlob(XLSX: any, allData: any[], originalCols: ImportExcelColumn[]): Blob {
    const ws = XLSX.utils.json_to_sheet(allData);
    const charWidthMultiplier = 1.5;
    const reportHeaders = originalCols.map(c => c.header).concat(['檢核結果', '錯誤原因']);

    // 1. 自動計算欄位寬度
    const wscols: any[] = [];
    reportHeaders.forEach(header => {
      let maxLen = 0;
      const lengths = [header].concat(allData.map(row => row[header] ? String(row[header]) : ''));
      lengths.forEach(text => {
        let len = 0;
        for (let i = 0; i < text.length; i++) {
          const charCode = text.charCodeAt(i);
          len += (charCode >= 0x4E00 && charCode <= 0x9FFF) ? charWidthMultiplier : 1;
        }
        if (len > maxLen) maxLen = len;
      });
      wscols.push({ wch: Math.ceil(maxLen) + 5 });
    });
    ws['!cols'] = wscols;

    // 2. 遍歷儲存格套用美化樣式
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
    for (let r = range.s.r; r <= range.e.r; r++) {
      const isHeader = r === 0;
      const rowData = isHeader ? null : allData[r - 1];
      const isError = rowData?._isError;

      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellRef = XLSX.utils.encode_cell({ r, c });
        if (!ws[cellRef]) continue;

        // 通用樣式設定
        ws[cellRef].s = {
          font: { name: 'Microsoft JhengHei', sz: 10 },
          alignment: { vertical: 'center', horizontal: 'left' },
          border: {
            top: { style: 'thin', color: { rgb: "CCCCCC" } },
            bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
            left: { style: 'thin', color: { rgb: "CCCCCC" } },
            right: { style: 'thin', color: { rgb: "CCCCCC" } }
          }
        };

        if (isHeader) {
          // 標題列：深藍底白字
          ws[cellRef].s.fill = { fgColor: { rgb: "4472C4" } };
          ws[cellRef].s.font = { color: { rgb: "FFFFFF" }, bold: true, name: 'Microsoft JhengHei' };
          ws[cellRef].s.alignment.horizontal = 'center';
        } else if (isError) {
          // 錯誤行：紅色字體
          ws[cellRef].s.font.color = { rgb: "FF0000" };
        } else {
          // 正確行：綠色字體
          ws[cellRef].s.font.color = { rgb: "008000" };
        }
      }
    }
    // 3. 封裝並回傳 Blob
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '匯入檢核報告');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }
}
