import { Component, Input } from '@angular/core';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-excel-export',
  templateUrl: './excel-export.component.html',
  styleUrls: ['./excel-export.component.scss']
})
export class ExcelExportComponent {
  @Input() data: any[] = [];
  @Input() headerRow1: { header: string, colspan?: number }[][] = [];
  @Input() headerRow2: { field: string, header: string }[] = [];
  @Input() fileName: string = 'Export';

  exportToExcel(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    // 第一層標題行
    const header1 = this.headerRow1[0].map(h => ({ header: h.header, colspan: h.colspan || 1 }));
    const row1 = worksheet.addRow(header1.map(h => h.header));
    row1.eachCell((cell, index) => {
      const colspan = this.headerRow1[0][index].colspan || 1;
      if (colspan > 1) {
        worksheet.mergeCells(1, index + 1, 1, index + colspan);
      }
    });

    // 第二層標題行
    const header2 = this.headerRow2.map(h => h.header);
    worksheet.addRow(header2);

    // 資料行
    this.data.forEach(item => {
      const rowData = this.headerRow2.map(h => item[h.field]);
      worksheet.addRow(rowData);
    });

    // 標題樣式
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { bold: true };

    // 自動調整欄位寬度
    worksheet.columns.forEach(column => {
      if (column.values) {
        column.width = Math.max(10, ...column.values.map(v => (v ? String(v).length : 0)));
      }
    });

    // 產生並儲存 Excel 檔案
    workbook.xlsx.writeBuffer().then(buffer => {
      FileSaver.saveAs(new Blob([buffer]), `${this.fileName}.xlsx`);
    });
  }
}
