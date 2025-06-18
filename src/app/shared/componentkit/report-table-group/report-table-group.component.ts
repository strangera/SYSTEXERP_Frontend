import { Component, Input, OnInit } from '@angular/core';
import { Column } from '../table/table.model';
import { Location } from '@angular/common';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
// 此行會自動觸發 addFont

@Component({
  selector: 'app-report-table-group',
  templateUrl: './report-table-group.component.html',
})
export class ReportTableGroupComponent implements OnInit {
  @Input() columns: Column[] = [];
  @Input() dataKey = 'id';
  @Input() subtotalFields: string[] = [];
  @Input() showTotalOnly = false;
  @Input() totalCount: number = 0;
  @Input() currentPage: number = 1;
  @Input() dateStart: string = '';
  @Input() dateEnd: string = '';
  @Input() printedAt: string = '';
  @Input() rowsPerTable = 25;
  @Input() reportTitle: string = '報表';


  private _data: any[] = [];
  @Input() set data(value: any[]) {
    this._data = value;
    this.splitData();
  }
  get data(): any[] {
    return this._data;
  }

  groupedData: any[][] = [];
  constructor(private location: Location) { }
  ngOnInit(): void {
    this.splitData();

    this.selectedColumns = [
      { header: '序號', field: '__index' },  // 虛擬欄位
      ...this.columns,
    ];
  }

  updateGroupedData(): void {
    this.splitData();
  }

  private splitData(): void {
    const total = this._data?.length || 0;
    const groupCount = Math.ceil(total / this.rowsPerTable);
    this.groupedData = Array.from({ length: groupCount }, (_, i) =>
      this._data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable)
    );
  }

  getSubtotal(group: any[], field: string): number | string {
    const sum = group.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0);
    return sum.toLocaleString();
  }

  getGrandTotal(field: string): number | string {
    const sum = this._data.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0);
    return sum.toLocaleString();
  }

  getRowIndex(groupIndex: number, rowIndex: number): number {
    return groupIndex * this.rowsPerTable + rowIndex + 1;
  }

  printPage(): void {
    const originalTitle = document.title;
    document.title = this.reportTitle || '報表';
    window.print();
    document.title = originalTitle;
  }
  selectedColumns: Column[] = [];




  showPdfDialog = false;
  showColumnDialog = false;

  exportPDF(orientation: 'p' | 'l' = 'p'): void {
    const columnCount = this.selectedColumns.length;
    const columnWidth = 100; // 每欄預留寬度（可調整）
    const tableWidth = columnCount * columnWidth;
    const pageHeight = 842; // 預設 A4 高度為 842pt（11.7 吋）

    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: [tableWidth + 80, pageHeight], // ✅ 寬度根據欄位動態設定
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 40;
    let currentY = 40;

    const safeText = (text: any) => String(text ?? '');

    doc.setFont('NotoSansTC');
    doc.setFontSize(14);
    doc.text(safeText(this.reportTitle), pageWidth / 2, currentY, { align: 'center' });

    currentY += 20;

    doc.setFontSize(10);
    doc.text(`資料區間: ${this.dateStart} ~ ${this.dateEnd}`, marginLeft, currentY);
    doc.text(`列印時間: ${this.printedAt}`, pageWidth - marginLeft, currentY, { align: 'right' });

    currentY += 10;

    for (let i = 0; i < this.groupedData.length; i++) {
      const dataTable = this.groupedData[i];
      const body = dataTable.map((row, rowIndex) =>
        this.selectedColumns.map(col => {
          try {
            if (col.field === '__index') {
              return String(this.getRowIndex(i, rowIndex));  // 實際編號
            }
            const value = col.format ? col.format(row[col.field]) : row[col.field];
            return String(value ?? '');
          } catch {
            return '';
          }
        })
      );

      const headers = this.selectedColumns.map(col => col.header);
      // 計算總計列（只給最後一頁 foot 用）
      let foot: string[][] = [];
      if (i === this.groupedData.length - 1) {
        const totalRow = this.selectedColumns.map(col => {
          if (col.field === '__index') {
            return '總計'; // ✅ 只放在序號欄那格
          } else if (this.subtotalFields.includes(col.field)) {
            const sum = this._data.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
            return sum.toLocaleString();
          } else {
            return '';
          }
        });
        foot = [totalRow];
      }
      const totalRow = this.selectedColumns.map(col => {
        if (col.field === '__index') {
          return '總計'; // 固定塞入
        } else if (this.subtotalFields.includes(col.field)) {
          const sum = this._data.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
          return sum.toLocaleString();
        } else {
          return '';
        }
      });
      const columnStyles: { [key: string]: any } = {};
      this.selectedColumns.forEach((col, index) => {
        if (col.style === 'text-right') {
          columnStyles[index] = { halign: 'right' };
        } else if (col.style === 'text-center') {
          columnStyles[index] = { halign: 'center' };
        } else {
          columnStyles[index] = { halign: 'left' }; // 預設靠左
        }
      });
      autoTable(doc, {
        startY: currentY,
        head: [headers],
        body,
        foot, // ✅ 總計列放進 foot（只有最後一頁有）
        margin: { left: marginLeft, right: marginLeft },
        styles: {
          font: 'NotoSansTC',
          fontStyle: 'normal',
          fontSize: 9,
          lineWidth: 0.1,     // ✅ 加框線
          lineColor: [0, 0, 0] // ✅ 黑色線條 
        },
        columnStyles, // ✅ 套用你的動態對齊設定
        headStyles: {
          font: 'NotoSansTC',
          fontStyle: 'normal',
          fontSize: 10,
          fillColor: [212, 222, 254],
          textColor: [0, 0, 0],
        },
        footStyles: {
          font: 'NotoSansTC',
          fontStyle: 'normal',
          fontSize: 10,
          fillColor: [250, 250, 210],
          textColor: [0, 0, 0],
          halign: 'right', // ✅ 總計列所有儲存格靠右
        },

      });

      if (i < this.groupedData.length - 1) {
        doc.addPage([tableWidth + 80, pageHeight]);
        currentY = 40;
      }
    }


    doc.save(`報表_${new Date().toISOString()}.pdf`);
    this.showPdfDialog = false;
  }












  exportExcel(): void {
    import('xlsx').then(xlsx => {
      const ws = xlsx.utils.json_to_sheet(this._data.map(row => {
        const item: any = {};
        this.columns.forEach(col => {
          item[col.header] = row[col.field];
        });
        return item;
      }));
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '報表');
      xlsx.writeFile(wb, `報表_${new Date().toISOString()}.xlsx`);
    });
  }
  goBack() {
    this.location.back();
  }

}
