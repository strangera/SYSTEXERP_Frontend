import { Component, Input, OnInit } from '@angular/core';
import { Column } from '../table/table.model';
import { Location } from '@angular/common';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';

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
  @Input() continuousRowNumber = true;
  @Input() dateRangeLabel: string = '資料區間';
  @Input() pdfSummaryText: string[] = [];
  @Input() groupByField: string | null = null;

  showRowsPerTableDialog = false;
  tempRowsPerTable = this.rowsPerTable;
  sortedData: any[] = [];
  private groupAndSplitData(): void {
    if (this.groupByField) {
      const groupedMap = new Map<string, any[]>();

      this._data.forEach(item => {
        const key = item[this.groupByField!] ?? '未指定';
        if (!groupedMap.has(key)) groupedMap.set(key, []);
        groupedMap.get(key)!.push(item);
      });

      this.groupedData = Array.from(groupedMap.entries()).map(([key, items]) => {
        items.forEach(row => row['__groupKey'] = key); // 給每筆資料標記群組
        return items;
      });
    } else {
      const total = this._data?.length || 0;
      const groupCount = Math.ceil(total / this.rowsPerTable);
      this.groupedData = Array.from({ length: groupCount }, (_, i) =>
        this._data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable)
      );
    }
  }

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
    this.buildSelectedColumns();
  }
  openRowsPerTableDialog() {
    this.tempRowsPerTable = this.rowsPerTable;
    this.showRowsPerTableDialog = true;
  }
  applyRowsPerTableChange() {
    if (this.tempRowsPerTable > 0) {
      this.rowsPerTable = this.tempRowsPerTable;
      this.updateGroupedData();
      this.showRowsPerTableDialog = false;
    }
  }

  buildSelectedColumns(): void {
    const withIndex = [{ header: '序號', field: '__index' }];
    const processed = this.columns.map(col => {
      return col; // 不自動指定 text-center，改由呼叫端決定 style
    });

    this.selectedColumns = withIndex.concat(processed);
  }

  updateGroupedData(): void {
    this.splitData();
    this.buildSelectedColumns();
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
    return this.continuousRowNumber
      ? groupIndex * this.rowsPerTable + rowIndex + 1
      : rowIndex + 1;
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
    const columnWidth = 100;
    const tableWidth = columnCount * columnWidth;
    const pageHeight = 842;

    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: [tableWidth + 80, pageHeight],
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

      // 每頁表頭資訊（放這裡才會每頁都有）
      currentY = 40;
      doc.setFont('NotoSansTC');
      doc.setFontSize(14);
      doc.text(safeText(this.reportTitle), pageWidth / 2, currentY, { align: 'center' });

      currentY += 20;
      doc.setFontSize(10);
      doc.text(`${this.dateRangeLabel}：${this.dateStart} ~ ${this.dateEnd}`, marginLeft, currentY);
      doc.text(`列印時間：${this.printedAt}`, pageWidth - marginLeft, currentY, { align: 'right' });
      currentY += 10;
      const body = dataTable.map((row, rowIndex) =>
        this.selectedColumns.map(col => {
          try {
            if (col.field === '__index') {
              return String(this.getRowIndex(i, rowIndex));
            }
            const value = col.format ? col.format(row[col.field]) : row[col.field];
            return String(value ?? '');
          } catch {
            return '';
          }
        })
      );

      const headers = this.selectedColumns.map(col => col.header);
      let foot: string[][] = [];
      if (i === this.groupedData.length - 1) {
        const totalRow = this.selectedColumns.map(col => {
          if (col.field === '__index') {
            return '總計';
          } else if (this.subtotalFields.includes(col.field)) {
            const sum = this._data.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
            return sum.toLocaleString();
          } else {
            return '';
          }
        });
        foot = [totalRow];
      }

      const columnStyles: { [key: string]: any } = {};
      this.selectedColumns.forEach((col, index) => {
        let halign: 'left' | 'right' | 'center' = 'center';
        if (col.style === 'text-left') {
          halign = 'left';
        } else if (col.style === 'text-right') {
          halign = 'right';
        } else if (col.style === 'text-center') {
          halign = 'center';
        }

        columnStyles[index] = { halign };
      });

      autoTable(doc, {
        startY: currentY,
        head: [headers],
        body,
        foot,
        margin: { left: marginLeft, right: marginLeft },
        styles: {
          font: 'NotoSansTC',
          fontStyle: 'normal',
          fontSize: 9,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        columnStyles,
        headStyles: {
          font: 'NotoSansTC',
          fontStyle: 'normal',
          fontSize: 10,
          fillColor: [212, 222, 254],
          textColor: [0, 0, 0],
          halign: 'center',
        },
        footStyles: {
          font: 'NotoSansTC',
          fontStyle: 'normal',
          fontSize: 10,
          fillColor: [250, 250, 210],
          textColor: [0, 0, 0],
          halign: 'right',
        },
      });

      if (i < this.groupedData.length - 1) {
        doc.addPage([tableWidth + 80, pageHeight]);
        currentY = 40;
      }
    }
    if (this.pdfSummaryText?.length) {
      doc.setFont('NotoSansTC');
      doc.setTextColor(255, 0, 0); // 紅色
      doc.setFontSize(10);

      const autoTableDoc = doc as any;
      let summaryY = autoTableDoc.lastAutoTable?.finalY + 20 || 100;

      this.pdfSummaryText.forEach(line => {
        doc.text(line, 40, summaryY);
        summaryY += 14;
      });
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
  onTableSort(event: any): void {
    const sortField = event.field;
    const sortOrder = event.order; // 1 升序, -1 降序

    this.sortedData = [...this._data].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'string') {
        return valA.localeCompare(valB) * sortOrder;
      } else {
        return (valA < valB ? -1 : valA > valB ? 1 : 0) * sortOrder;
      }
    });

    this._data = this.sortedData;
    this.splitData(); // 重新分組
  }
}
