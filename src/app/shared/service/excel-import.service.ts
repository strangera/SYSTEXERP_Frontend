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
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length <= 1) {
        this.messageService.warnBubble('Excel 檔案中沒有可讀取的數據行。');
        return { data: [], hasErrors: false };
      }

      return this.processData(jsonData.slice(1), columns, customValidator);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      throw err;
    }
  }

  private processData(dataRows: any[][], columns: ImportExcelColumn[], customValidator?: any) {
    const fullReportData: any[] = [];
    const validDataOnly: any[] = [];
    let totalHasErrors = false;

    for (const row of dataRows) {
      if (this.isRowEmpty(row, columns)) continue;

      const { obj, rowError } = this.validateAndParseRow(row, columns, customValidator);

      // 建立報告行
      fullReportData.push(this.createReportRow(row, columns, rowError));

      if (rowError) {
        totalHasErrors = true;
      } else {
        validDataOnly.push(obj);
      }
    }

    return {
      data: validDataOnly,
      hasErrors: totalHasErrors,
      errorBlob: this.generateFullReportBlob(XLSX, fullReportData, columns)
    };
  }

  private isRowEmpty(row: any[], columns: ImportExcelColumn[]): boolean {
    return columns.every((_, index) => {
      const val = row[index];
      return val === undefined || val === null || String(val).trim() === '';
    });
  }

  private validateAndParseRow(row: any[], columns: ImportExcelColumn[], customValidator?: any) {
    const obj: any = {};
    let rowError = '';

    for (const [index, col] of columns.entries()) {
      const { value, error } = this.parseValue(row[index], col);
      obj[col.field] = value;
      if (error) rowError += error;
    }

    if (customValidator) {
      const customErr = customValidator(obj);
      if (customErr) rowError += customErr;
    }

    return { obj, rowError };
  }

  private parseValue(value: any, col: ImportExcelColumn): { value: any, error: string } {
    // 將邏輯拆分給各個處理函數，消除冗餘初始化
    switch (col.type) {
      case 'number':
        return this.parseNumber(value, col);
      case 'date':
        return this.parseDate(value, col);
      default:
        return {
          value: (value === undefined || value === null) ? null : String(value).trim(),
          error: ''
        };
    }
  }

  private parseNumber(value: any, col: ImportExcelColumn): { value: any, error: string } {
    const val = typeof value === 'string' ? value.replaceAll(',', '') : value;
    const num = (val === null || val === undefined || String(val).trim() === '') ? null : Number(val);
    const error = (num !== null && Number.isNaN(num)) ? `[${col.header}] 格式錯誤 ` : '';
    return { value: num, error };
  }

  private parseDate(value: any, col: ImportExcelColumn): { value: any, error: string } {
    let dateValue: Date | null;
    if (typeof value === 'number') {
      const dateCode = XLSX.SSF.parse_date_code(value);
      dateValue = new Date(dateCode.y, dateCode.m - 1, dateCode.d);
    } else {
      dateValue = value ? new Date(value) : null;
    }

    const error = (dateValue instanceof Date && Number.isNaN(dateValue.getTime()))
      ? `[${col.header}] 日期格式錯誤 `
      : '';
    return { value: dateValue, error };
  }

  private createReportRow(row: any[], columns: ImportExcelColumn[], rowError: string) {
    const reportRow: any = {};
    for (const [idx, col] of columns.entries()) reportRow[col.header] = row[idx];
    reportRow['檢核結果'] = rowError ? '失敗' : '成功';
    reportRow['錯誤原因'] = rowError || '';
    reportRow['_isError'] = !!rowError;
    return reportRow;
  }

  /**
   * 產生美化版的檢核報告 Blob
   */
  private generateFullReportBlob(XLSX: any, allData: any[], originalCols: ImportExcelColumn[]): Blob {
    const ws = XLSX.utils.json_to_sheet(allData);
    const reportHeaders = originalCols.map(c => c.header).concat(['檢核結果', '錯誤原因']);

    // 1. 設定欄寬
    ws['!cols'] = this.calculateColumnWidths(allData, reportHeaders);

    // 2. 套用樣式
    this.applyStyles(XLSX, ws, allData);

    // 3. 封裝檔案
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '匯入檢核報告');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  private calculateColumnWidths(allData: any[], headers: string[]): any[] {
    const charWidthMultiplier = 1.5;
    return headers.map(header => {
      const lengths = [header, ...allData.map(row => row[header] ? String(row[header]) : '')];
      let maxLen = 0;
      for (const text of lengths) {
        const len = [...text].reduce((acc, char) => {
          const code = char.codePointAt(0) || 0;
          return acc + (code >= 0x4E00 && code <= 0x9FFF ? charWidthMultiplier : 1);
        }, 0);
        if (len > maxLen) maxLen = len;
      }
      return { wch: Math.ceil(maxLen) + 5 };
    });
  }

  private applyStyles(XLSX: any, ws: any, allData: any[]): void {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');

    for (let r = range.s.r; r <= range.e.r; r++) {
      const isHeader = r === 0;
      const rowData = isHeader ? null : allData[r - 1];

      for (let c = range.s.c; c <= range.e.c; c++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c })];
        if (!cell) continue;
        cell.s = this.getCellStyle(isHeader, rowData?._isError);
      }
    }
  }

  private getCellStyle(isHeader: boolean, isError?: boolean): any {
    const baseStyle = {
      font: { name: 'Microsoft JhengHei', sz: 10 },
      alignment: { vertical: 'center', horizontal: 'left' },
      border: { top: { style: 'thin', color: { rgb: "CCCCCC" } }, bottom: { style: 'thin', color: { rgb: "CCCCCC" } }, left: { style: 'thin', color: { rgb: "CCCCCC" } }, right: { style: 'thin', color: { rgb: "CCCCCC" } } }
    };

    if (isHeader) {
      return { ...baseStyle, fill: { fgColor: { rgb: "4472C4" } }, font: { color: { rgb: "FFFFFF" }, bold: true, name: 'Microsoft JhengHei' }, alignment: { ...baseStyle.alignment, horizontal: 'center' } };
    }

    return { ...baseStyle, font: { ...baseStyle.font, color: { rgb: isError ? "FF0000" : "008000" } } };
  }
}
