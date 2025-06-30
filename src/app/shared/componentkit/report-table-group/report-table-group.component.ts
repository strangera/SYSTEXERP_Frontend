import { Component, Input, OnInit } from '@angular/core';
import { Column } from '../table/table.model';
import { Location } from '@angular/common';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { ChangeDetectorRef } from '@angular/core';
import { formatDate } from '../table/table.model';



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
  @Input() rowsPerTable = 1000;
  @Input() reportTitle: string = '報表';
  @Input() continuousRowNumber = true;
  @Input() dateRangeLabel: string = '資料區間';
  @Input() pdfSummaryText: string[] = [];
  @Input() groupByField?: string | null = null;
  @Input() groupByLabel: string = '';

  @Input() allowMergeToggle: boolean = false; // 預設不顯示切換開關
  @Input() defaultMergedView: boolean = true; // 預設就是合併模式
  @Input() enableGrouping: boolean = false;
  @Input() detailColumns: Column[] = []; // 自訂明細欄位
 @Input() showGroupedBody: boolean = false;

  private _data: any[] = [];

  @Input()
  set data(value: any[]) {
    this._data = value;
     this.groupBodyExpanded = {}; // ✅ 每次新資料清空展開狀態

    if (this.groupByField) {
      this._data = [...this._data].sort((a, b) => {
        const valA = a[this.groupByField!];
        const valB = b[this.groupByField!];
        if (valA == null) return 1;
        if (valB == null) return -1;
        return String(valA).localeCompare(String(valB));
      });
    }

    this.splitData();
  }

  get data(): any[] {
    return this._data;
  }

@Input() showExpandColumn: boolean = false;
@Input() detailFieldKeys: string[] = [];
@Input() fetchDetailFn: (payload: any) => Promise<any[]> = async () => [];

expandedRows: { [key: string]: boolean } = {};
rowDetails: { [key: string]: any[] } = {};

groupBodyExpanded: { [key: string]: boolean } = {};

getRowKey(row: any): string {
  return row[this.dataKey] ?? JSON.stringify(row);
}

async onRowExpand(event: any, rowData: any): Promise<void> {
  const key = this.getRowKey(rowData);
  if (!this.rowDetails[key]) {
    const payload = this.detailFieldKeys.reduce((acc, k) => {
      acc[k] = rowData[k];
      return acc;
    }, {} as any);
    this.rowDetails[key] = await this.fetchDetailFn(payload);
  }
}

objectKeys(obj: any): string[] {
  return Object.keys(obj || {});
}


  showRowsPerTableDialog = false;
  tempRowsPerTable = this.rowsPerTable;
  sortedData: any[] = [];
  mergedView: boolean = false;
  mergedPagedGroups: any[][] = [];
  tempSelectedColumns: Column[] = [];




  groupedData: any[][] = [];
  selectedColumns: Column[] = [];
  showPdfDialog = false;
  showColumnDialog = false;

  constructor(private location: Location, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.mergedView = this.defaultMergedView ?? false; // ✅ 沒傳入就 false
    this.splitData();
    this.buildSelectedColumns();
    this.availableColumns = this.columns;
  }

  mergeGroupedTable(): void {
    this.rowsPerTable = 1000;       // 預設每張表 1000 列
    this.mergedView = true;         // 切換為合併模式
    this.splitData();               // 切資料讓畫面顯示
  }
  onMergedViewToggle(checked: boolean): void {
    this.mergedView = checked;
    if (checked) {
      this.rowsPerTable = 1000; // 預設每表格列數
      this.splitData();         // 切資料進大表
    }
  }


  openRowsPerTableDialog() {
    this.tempRowsPerTable = this.rowsPerTable;
    this.showRowsPerTableDialog = true;
  }
  applyColumnSelection(): void {
    // 永遠保留序號欄位在最前面
    const withIndex = [{ header: '序號', field: '__index' }];
    this.selectedColumns = withIndex.concat(this.tempSelectedColumns);
    this.showColumnDialog = false;
  }

  applyRowsPerTableChange() {
    if (this.tempRowsPerTable > 0) {
      this.rowsPerTable = this.tempRowsPerTable;
      this.splitData(); // 重新切資料
      this.showRowsPerTableDialog = false;
    }
  }
  // get mergedPagedGroups(): any[][] {
  //   const total = this._data.length;
  //   const groupCount = Math.ceil(total / this.rowsPerTable);
  //   return Array.from({ length: groupCount }, (_, i) =>
  //     this._data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable)
  //   );
  // }
  availableColumns: Column[] = []; // 所有欄位，來自 @Input() columns
  buildSelectedColumns(): void {
    const withIndex = [{ header: '序號', field: '__index' }];
    const processed = this.columns.map(col => col);
    this.selectedColumns = withIndex.concat(processed);
  }

  private splitData(): void {
    this.groupAndSplitData();
    if (this.mergedView) {
      const total = this._data.length;
      const groupCount = Math.ceil(total / this.rowsPerTable);
      this.mergedPagedGroups = Array.from({ length: groupCount }, (_, i) =>
        this._data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable)
      );
    }
 // ✅ 預設展開狀態與 showGroupedBody 同步
  this.groupedData.forEach(group => {
    const key = group[0]?.__groupKey ?? '';
    this.groupBodyExpanded[key] = this.showGroupedBody;
  });
  }


  updateGroupedData(): void {
    this.groupAndSplitData();
    this.buildSelectedColumns();
  }

  private groupAndSplitData(): void {
    if (this.groupByField) {
      const groupedMap = new Map<string, any[]>();
      this._data.forEach(item => {
        const key = item[this.groupByField!] ?? '未指定';
        if (!groupedMap.has(key)) groupedMap.set(key, []);
        groupedMap.get(key)!.push(item);
      });
      this.groupedData = Array.from(groupedMap.entries()).map(([key, items]) => {
        items.forEach(row => row['__groupKey'] = key);
        return items;
      });
    } else {
      const total = this._data?.length || 0;
      const groupCount = Math.ceil(total / this.rowsPerTable);
      this.groupedData = Array.from({ length: groupCount }, (_, i) =>
        this._data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable)
      );
    }
    this.groupedData.forEach(group => {
  const key = group[0]?.__groupKey ?? '';
  if (key && !(key in this.groupBodyExpanded)) {
    this.groupBodyExpanded[key] = this.showGroupedBody; // ✅ 根據全域切換
  }
});
  }



getSubtotal(group: any[], field: string): string {
  const sum = group.reduce((acc, row) => {
    const raw = row[field];
    if (raw == null) return acc;

    const numeric = parseFloat(String(raw).replace(/,/g, '')); // 去掉逗號後轉數字
    return acc + (isNaN(numeric) ? 0 : numeric);
  }, 0);

  return sum.toLocaleString();
}
  get pagedData(): any[] {
    if (this.mergedView) {
      return this._data.slice(0, this.rowsPerTable);
    }
    return this._data;
  }


  getGrandTotal(field: string): number | string {
    const sum = this._data.reduce((acc, row) => acc + (parseFloat(row[field]) || 0), 0);
    console.log('🔍 總計', field, '=', sum);
    return sum.toLocaleString();
  }

  get mergedPagedData(): any[] {
    return this._data.slice(0, this.rowsPerTable);
  }

  getRowIndex(groupIndex: number, rowIndex: number): number {
    return this.continuousRowNumber
      ? groupIndex * this.rowsPerTable + rowIndex + 1
      : rowIndex + 1;
  }

  printPage(): void {
    window.print();
  }


  exportPDF(orientation: 'p' | 'l' = 'p'): void {
    const columnCount = this.selectedColumns.length;
    const columnWidth = 80; // 自訂欄位寬度（你可調整）
    const customWidth = Math.max(595, columnCount * columnWidth); // A4 至少 595pt 寬

    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: [customWidth, 842], // 寬動態，高固定 A4 高度
    });

    const marginLeft = 40;
    let currentY = 40;
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('NotoSansTC');
    doc.setFontSize(14);
    doc.text(this.reportTitle, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;
    doc.setFontSize(10);
    doc.text(
      `${this.dateRangeLabel}：${formatDate(this.dateStart)} ~ ${formatDate(this.dateEnd)}`,
      marginLeft,
      currentY
    );
    doc.text(`列印時間：${this.printedAt}`, pageWidth - marginLeft, currentY, { align: 'right' });
    currentY += 10;

    if (this.mergedView) {
      this.exportMergedPDF(doc, currentY, marginLeft);
    } else {
      this.exportGroupedPDF(doc, currentY, marginLeft);
    }

    doc.save(`報表_${new Date().toISOString()}.pdf`);
    this.showPdfDialog = false;
  }
  private exportMergedPDF(doc: jsPDF, currentY: number, marginLeft: number): void {
    const headers = this.selectedColumns.map(col => col.header);
    const columnStyles: { [key: string]: any } = {};
    this.selectedColumns.forEach((col, index) => {
      let halign: 'left' | 'right' | 'center' = 'center';
      if (col.style === 'text-left') halign = 'left';
      else if (col.style === 'text-right' || this.subtotalFields.includes(col.field)) halign = 'right';
      columnStyles[index] = { halign };
    });

    const sourceData = this.sortedData.length > 0 ? this.sortedData : this._data;
    const body = sourceData.map((row, rowIndex) =>
      this.selectedColumns.map(col => {
        if (col.field === '__index') return String(rowIndex + 1);
        const value = col.format ? col.format(row[col.field]) : row[col.field];
        return String(value ?? '');
      })
    );

    // ✅ 加入總計列
    const totalRow = this.selectedColumns.map(col => {
      if (col.field === '__index') return '總計';
      if (this.subtotalFields.includes(col.field)) {
        const sum = sourceData.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
        return sum.toLocaleString();
      }
      return '';
    });
    body.push(totalRow);

    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body,
      margin: { left: marginLeft, right: marginLeft },
      styles: { font: 'NotoSansTC', fontSize: 9 },
      columnStyles,
      headStyles: {
        font: 'NotoSansTC',
        fontStyle: 'normal',
        fontSize: 10,
        fillColor: [212, 222, 254],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      didParseCell(data) {
        const raw = Array.isArray(data.row.raw) ? data.row.raw : [];

        // ✅ 加上總計列樣式
        if (raw[0] === '總計') {
          data.cell.styles.fillColor = [250, 250, 210];
          data.cell.styles.font = 'NotoSansTC';
          data.cell.styles.fontStyle = 'normal';
        }
      }
    });

    let summaryY = (doc as any).lastAutoTable.finalY + 20;
    this.printSummaryText(doc, summaryY);
  }

  private exportGroupedPDF(doc: jsPDF, startY: number, marginLeft: number): void {
    const headers = this.selectedColumns.map(col => col.header);
    const columnStyles: { [key: string]: any } = {};
    this.selectedColumns.forEach((col, index) => {
      let halign: 'left' | 'right' | 'center' = 'center';
      if (col.style === 'text-left') halign = 'left';
      else if (col.style === 'text-right' || this.subtotalFields.includes(col.field)) halign = 'right';
      columnStyles[index] = { halign };
    });

    let allRows: any[] = [];

    this.groupedData.forEach((group, groupIndex) => {
      const groupKey = group[0]?.__groupKey ?? `群組${groupIndex + 1}`;
      // 群組標題列（跨欄）
      const groupTitle = this.groupByLabel || this.groupByField || '群組';
      allRows.push([{ content: `${groupTitle}：${groupKey}`, colSpan: headers.length, styles: { halign: 'left', fontStyle: 'bold' } }]);

      // 資料列
      group.forEach((row, rowIndex) => {
        allRows.push(this.selectedColumns.map(col => {
          if (col.field === '__index') return String(this.getRowIndex(groupIndex, rowIndex));
          const value = col.format ? col.format(row[col.field]) : row[col.field];
          return String(value ?? '');
        }));
      });

      // 小計列
      const subtotalRow = this.selectedColumns.map(col => {
        if (col.field === '__index') return '小計';
        if (this.subtotalFields.includes(col.field)) {
          const sum = group.reduce((acc, row) => acc + (parseFloat(row[col.field]) || 0), 0);
          return sum.toLocaleString();
        }
        return '';
      });
      allRows.push(subtotalRow);
    });
    const groupHeaderColSpan = this.selectedColumns.length;
    autoTable(doc, {
      startY,
      head: [headers],
      body: allRows,
      margin: { left: marginLeft, right: marginLeft },
      styles: { font: 'NotoSansTC', fontSize: 9 },
      columnStyles,
      headStyles: {
        font: 'NotoSansTC',
        fontStyle: 'normal',
        fontSize: 10,
        fillColor: [212, 222, 254],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      didParseCell(data) {
        const raw = Array.isArray(data.row.raw) ? data.row.raw : [];

        if (raw && raw[0] && typeof raw[0] === 'object' && 'colSpan' in raw[0]) {
          data.cell.styles.fillColor = [240, 240, 255];
          data.cell.styles.font = 'NotoSansTC';
          data.cell.styles.fontStyle = 'normal';
        }
        if (raw[0] === '小計') {
          data.cell.styles.fillColor = [250, 250, 210];
          data.cell.styles.font = 'NotoSansTC';
        }
      }



    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    this.printSummaryText(doc, finalY);
  }

  private printSummaryText(doc: jsPDF, startY: number): void {
    if (this.pdfSummaryText?.length) {
      doc.setFont('NotoSansTC');
      doc.setTextColor(255, 0, 0);
      doc.setFontSize(10);
      let y = startY;
      this.pdfSummaryText.forEach(line => {
        doc.text(line, 40, y);
        y += 14;
      });
    }
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
    const sortOrder = event.order;
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
    this.splitData();
    this.cdr.detectChanges(); // ⬅️ 讓表格真的刷新
  }
  getHeaderWidth(header: string): number {
  if (!header) return 80;
  const fullWidth = [...header].reduce((acc, char) => {
    const isChinese = /[\u4e00-\u9fa5]/.test(char);
    return acc + (isChinese ? 16 : 10);
  }, 0);
  return Math.max(80, fullWidth + 24); // 加上 padding 預留
}
collapseAllRows(): void {
  this.showGroupedBody = false;
}

expandAllRows(): void {
  this.showGroupedBody = true;
}
onToggleGroupedBody(): void {
  for (const key of Object.keys(this.groupBodyExpanded)) {
    this.groupBodyExpanded[key] = this.showGroupedBody;
  }
}
toggleGroupBody(key: string): void {
  this.groupBodyExpanded[key] = !this.groupBodyExpanded[key];
}
expandAllGroupBodies(): void {
  for (const key of Object.keys(this.groupBodyExpanded)) {
    this.groupBodyExpanded[key] = true;
  }
}

collapseAllGroupBodies(): void {
  for (const key of Object.keys(this.groupBodyExpanded)) {
    this.groupBodyExpanded[key] = false;
  }
}

}
