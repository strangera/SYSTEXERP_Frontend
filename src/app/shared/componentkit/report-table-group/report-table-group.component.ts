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
  const doc = new jsPDF(orientation, 'pt', 'a4');
  doc.setFont('NotoSansTC');
  doc.setFontSize(12);
  doc.text(this.reportTitle || '報表', 40, 40);

  const headers = this.selectedColumns.map(col => col.header);
  const body = this._data.map(row =>
    this.selectedColumns.map(col =>
      col.format ? col.format(row[col.field]) : row[col.field])
  );

  // 建立加總列
  const totalRow = this.selectedColumns.map((col, index) => {
    if (index === 0) return '總計';
    if (this.subtotalFields.includes(col.field)) {
      const sum = this._data.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
      return sum.toLocaleString();
    }
    return '';
  });

  // 將加總列加到最後一筆資料後
  body.push(totalRow);

  autoTable(doc, {
    head: [headers],
    body,
    startY: 60,
    styles: {
      font: 'NotoSansTC',
      fontSize: 10
    },
    headStyles: {
      font: 'NotoSansTC',
      fontStyle: 'normal',
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0]
    }
  });

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
