import { Component, Input, OnInit } from '@angular/core';
import { Column } from '../table/table.model';

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

  ngOnInit(): void {
    this.splitData();
    this.selectedColumns = [...this.columns]; // 預設全選
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
    window.print();
  }
  selectedColumns: Column[] = [];




  showPdfDialog = false;
  showColumnDialog = false;

  exportPDF(orientation: 'p' | 'l' = 'p'): void {
    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 40;
    let currentY = 40;

    const safeText = (text: any) => String(text ?? '');

    // 標題
    doc.setFont('NotoSansTC'); // ✅ 使用正確字型註冊名
    doc.setFontSize(14);
    doc.text(safeText(this.reportTitle), pageWidth / 2, currentY, { align: 'center' });

    currentY += 20;

    // 日期資訊
    doc.setFontSize(10);
    doc.text(`資料區間: ${this.dateStart} ~ ${this.dateEnd}`, marginLeft, currentY);
    doc.text(`列印時間: ${this.printedAt}`, pageWidth - marginLeft, currentY, { align: 'right' });

    currentY += 10;

    for (let i = 0; i < this.groupedData.length; i++) {
      const dataTable = this.groupedData[i];
      const body = dataTable.map(row =>
        this.selectedColumns.map(col => {
          try {
            const value = col.format ? col.format(row[col.field]) : row[col.field];
            return String(value ?? '');
          } catch {
            return '';
          }
        })
      );

      const headers = this.selectedColumns.map(col => col.header);

      autoTable(doc, {
        startY: currentY,
        head: [headers],
        body,
        margin: { left: marginLeft, right: marginLeft },
        styles: {
          font: 'NotoSansTC',
          fontStyle: 'normal', // ✅ 建議加
          fontSize: 9,
        },
        headStyles: {
          font: 'NotoSansTC',
          fontStyle: 'normal', // ✅ 補這一行才能讓表頭套字型
          fontSize: 10,
          fillColor: [220, 220, 220],
        },
      });


      if (i < this.groupedData.length - 1) {
        doc.addPage();
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


}
