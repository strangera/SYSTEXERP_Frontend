import { Component, Input, OnInit, TemplateRef, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

import {
  Location,
  NgIf,
  NgFor,
  NgTemplateOutlet,
  NgClass,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  DatePipe,
} from '@angular/common';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ChangeDetectorRef } from '@angular/core';
import { formatDate } from '../table/table.model';
import { ButtonDirective } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { TrackByFunction } from '@angular/core';


interface Column {
  field: string;     // 欄位名稱 (資料的欄位名稱)
  header: string;    // 欄位標題 (顯示在表格上的標題)
  visible?: boolean;  // 是否顯示 (可篩選欄位是否顯示？)
  hidden?: boolean;  // 是否隱藏 (是否為無法篩選欄位)
  format?: (value: any) => string | number | null; // 格式化(日期、時間...)

  showSort?: boolean;
  sortField?: string; // 排序欄位(預設為 field)

  disabled?: (value: any) => boolean;  // 是否禁用 (是否為禁用欄位)
  style?: string; // styles

  validate?: ((value: string, rowData: any, data: any[], field: string, header: string) => { isValid: boolean, errorMessage: string[] })[]; // 驗證規則(如果是可輸入的欄位)

  type?: 'input' | 'inputNumber' | 'dropdown' | 'button' | 'html' | 'date' | 'autoComplete' | 'default'; // 欄位類型
  prefix?: string;
  fractionDigits?: number;
  useGrouping?: boolean;

  options?: any | ((rowData: any) => any); // 支持靜態數據或基於 rowData 生成
  optionLabel?: string; // 下拉選單 optionLabel
  optionValue?: string; // 下拉選單 optionValue

  buttonLabel?: string; // 選擇按鈕 label
  checkboxTrueLabel?: string; // checkbox 非編輯模式 true 顯示文字（適用於單一布林值）
  checkboxFalseLabel?: string; // checkbox 非編輯模式 false 顯示文字（適用於單一布林值）
  dateFormat?: string; // 日期格式（例如 'yy-mm-dd'，僅適用於 type='date'）
  frozen?: boolean;  // 是否凍結 (是否為凍結欄位)
  alignFrozen?: string; // 凍結欄位對齊方式
}
@Component({
  selector: 'app-report-table-group',
  templateUrl: './report-table-group.component.html',
  styleUrls: ['./report-table-group.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    ButtonDirective,
    DialogModule,
    FormsModule,
    InputSwitchModule,
    NgFor,
    NgTemplateOutlet,
    TableModule,
    PrimeTemplate,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MultiSelectModule,
    DatePipe,
  ],
})
export class ReportTableGroupComponent implements OnInit {
  // 📌 資料與欄位設定
  @Input() columns: Column[] = [];                        // 表格欄位定義
  @Input() dataKey = 'id';                                // 每筆資料的唯一識別鍵
  @Input() subtotalFields: string[] = [];                 // 小計欄位（需加總的欄位）
  @Input() detailColumns: Column[] = [];                  // 明細展開欄位（如 rowexpansion）

  @Input() groupByField?: string | null = null;           // 分組依據欄位
  @Input() groupByLabel: string = '';                     // 分組顯示名稱

  @Input() detailFieldKeys: string[] = [];                // 展開資料查詢用的欄位 key
  @Input() fetchDetailFn: (payload: any) => Promise<any[]> = async () => []; // 明細查詢方法
  @Input() emptyMessage: string = '查無資料'; // 當表格無資料時顯示文字

  @Input() extraTablesForPDF: {                           // PDF 附加額外表格
    title: string;
    columns: { header: string; field: string; style?: string }[];
    data: any[];
  }[] = [];

  @Input() groupHeaderTemplate?: TemplateRef<any>;        // 自訂群組表頭 template
  @Input() rowTrackBy?: TrackByFunction<any>;

  // 📌 分頁與區間設定
  @Input() totalCount: number = 0;                        // 資料總筆數
  @Input() currentPage: number = 1;                       // 目前頁碼
  @Input() rowsPerTable = 1000;                           // 每表格顯示的最大列數
  @Input() dateStart: string = '';                        // 起始日期
  @Input() dateEnd: string = '';                          // 結束日期
  @Input() printedAt: string = '';                        // 列印時間
  @Input() dateRangeLabel: string = '資料區間';            // 日期區間標籤
  @Input() reportTitle: string = '報表';                  // 報表主標題
  @Input() pdfSummaryText: string[] = [];                 // PDF 額外摘要文字

  // 📌 布林設定與顯示控制（集中管理開關類）
  @Input() showTotalOnly = false;                         // 是否只顯示小計/總計（不顯示資料列）
  @Input() continuousRowNumber = true;                    // 是否連續編號（false = 每組從 1 開始）
  @Input() showDateRangeLabel = true;                     // 是否顯示日期區間文字
  @Input() showGroupedBody: boolean = false;              // 是否預設展開群組資料列
  @Input() showExpandColumn: boolean = false;             // 是否顯示展開列圖示
  @Input() allowMergeToggle: boolean = false;             // 是否顯示合併顯示切換按鈕
  @Input() defaultMergedView: boolean = true;             // 預設是否合併為一大表
  @Input() enableGrouping: boolean = false;               // 是否啟用分組顯示
  @Input() showBackButton = true;

  @Input() rowExpandMode: 'single' | 'multiple' = 'multiple'; // 展開列模式
  @Input() showGrandTotal: boolean = false; // 預設不顯示
  @Output() reachBottom = new EventEmitter<void>();

@ViewChild('body',  { static: false }) bodyRef?: ElementRef<HTMLElement>;

@ViewChild('fakeV', { static: false }) fakeVRef?: ElementRef<HTMLElement>;
@ViewChild('host', { static: false }) hostRef?: ElementRef<HTMLElement>;
@ViewChild('fakeH', { static: false }) fakeHRef?: ElementRef<HTMLElement>;
trackByMergedGroup = (i: number, _group: any[]) => i;


  // 📌 資料 getter / setter
  private _data: any[] = [];

@Input()
set data(value: any[]) {
  const host = this.hostRef?.nativeElement;
  const prevTop = host?.scrollTop ?? null;

  this._data = value;
  this.groupBodyExpanded = {};

  if (this.groupByField) {
    this._data = [...this._data].sort((a, b) => {
      const va = a[this.groupByField!], vb = b[this.groupByField!];
      if (va == null) return 1;
      if (vb == null) return -1;
      return String(va).localeCompare(String(vb));
    });
  }
  this.splitData();

  // ✅ 等到下一畫面幀再還原，避免回到頂端或抖動
  if (host && prevTop != null) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        host.scrollTop = prevTop;
      });
    });
  }
}
trackByRow = (_: number, row: any) => row?.[this.dataKey] ?? _;
private emitLock = false; // 👈 節流鎖

get data(): any[] {
  return this._data;
}


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
  expandedRowKeys: { [key: string]: boolean } = {};

  onExpandedRowKeysChange(event: { [key: string]: boolean }) {
    this.expandedRowKeys = event;
  }

  handleRowExpand(event: any) {
    const key = event.data[this.dataKey];
    this.expandedRowKeys = { [key]: true }; // 單筆展開
  }

  handleRowCollapse(event: any) {
    const key = event.data[this.dataKey];
    delete this.expandedRowKeys[key];
  }

  onExpandClick(event: MouseEvent, dt: any, rowData: any): void {
    event.preventDefault();

    const isExpanded = dt.isRowExpanded(rowData);
    const key = this.getRowKey(rowData);

    if (isExpanded) {
      delete this.expandedRowKeys[key];
      return;
    }

    // 收合其他、只展開一列
    this.expandedRowKeys = { [key]: true };

    // 若還沒載入明細就抓
    if (!this.rowDetails[key]) {
      const payload = this.detailFieldKeys.reduce((acc, k) => {
        acc[k] = rowData[k];
        return acc;
      }, {} as any);
      this.fetchDetailFn(payload).then((result) => {
        this.rowDetails[key] = result;
      });
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

  constructor(
    private location: Location,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.mergedView = this.defaultMergedView ?? false; // ✅ 沒傳入就 false
    this.splitData();
    this.buildSelectedColumns();
    this.availableColumns = this.columns;
  }

  mergeGroupedTable(): void {
    this.rowsPerTable = 1000; // 預設每張表 1000 列
    this.mergedView = true; // 切換為合併模式
    this.splitData(); // 切資料讓畫面顯示
  }
  onMergedViewToggle(checked: boolean): void {
    this.mergedView = checked;
    if (checked) {
      this.rowsPerTable = 1000; // 預設每表格列數
      this.splitData(); // 切資料進大表
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
    const processed = this.columns.map((col) => col);
    this.selectedColumns = withIndex.concat(processed);
  }

  private splitData(): void {
    this.groupAndSplitData();
    if (this.mergedView) {
      const total = this._data.length;
      const groupCount = Math.ceil(total / this.rowsPerTable);
      this.mergedPagedGroups = Array.from({ length: groupCount }, (_, i) =>
        this._data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable),
      );
    }
    // ✅ 預設展開狀態與 showGroupedBody 同步
    // ✅ 預設展開狀態與 showGroupedBody 同步
    this.groupedData.forEach((group) => {
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
      this._data.forEach((item) => {
        const key = item[this.groupByField!] ?? '未指定';
        if (!groupedMap.has(key)) groupedMap.set(key, []);
        // ⛔ 你之前可能是 groupedMap.get(key)!.push({ __groupKey: key });
        // ✅ 正確：保留 item 所有欄位再加上 __groupKey
        groupedMap.get(key)!.push({ ...item, __groupKey: key });
      });

      // ✅ groupedData 變成 group array
      this.groupedData = Array.from(groupedMap.values());
    } else {
      const total = this._data?.length || 0;
      const groupCount = Math.ceil(total / this.rowsPerTable);
      this.groupedData = Array.from({ length: groupCount }, (_, i) =>
        this._data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable),
      );
    }

    this.groupedData.forEach((group) => {
      const key = group[0]?.__groupKey ?? '';
      if (key && !(key in this.groupBodyExpanded)) {
        this.groupBodyExpanded[key] = this.showGroupedBody;
      }
    });
  }

  getSubtotal(group: any[], field: string): string {
    // 🔍 Debug 開始
    if (field === 'sad_sale_amt') {
    }

    const sum = group.reduce((acc, row) => {
      const value = row[field];
      const numeric = +String(value).replace(/,/g, '');
      return acc + (isNaN(numeric) ? 0 : numeric);
    }, 0);

    return sum.toLocaleString();
  }

  getGrandTotal(field: string): number | string {
    const sum = this._data.reduce(
      (acc, row) => acc + (parseFloat(row[field]) || 0),
      0,
    );

    return sum.toLocaleString();
  }

  get mergedPagedData(): any[] {
    return this._data.slice(0, this.rowsPerTable);
  }

  private rowIndexMap: Map<any, number> = new Map();

  getRowIndex(groupIndex: number, rowIndex: number): number {
    if (!this.continuousRowNumber) {
      return rowIndex + 1;
    }

    // ✅ 計算從前面所有 group 加總的筆數
    let totalIndex = 0;
    for (let i = 0; i < groupIndex; i++) {
      totalIndex += this.groupedData[i].length;
    }

    return totalIndex + rowIndex + 1;
  }

  printPage(): void {
    window.print();
  }

  exportPDF(orientation: 'p' | 'l' = 'p'): void {
    const columnCount = this.selectedColumns.length;
    const columnWidth = 80;
    const customWidth = Math.max(595, columnCount * columnWidth);

    const doc = new jsPDF({
      orientation,
      unit: 'pt',
      format: [customWidth, 842],
    });

    const marginLeft = 40;
    let currentY = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.addFont('assets/fonts/NotoSansTC-VariableFont_wght.ttf', 'Noto Sans TC', 'normal');
    doc.setFont('Noto Sans TC');
    doc.setFontSize(14);
    doc.text(this.reportTitle, pageWidth / 2, currentY, { align: 'center' });
    currentY += 20;

    doc.setFontSize(10);
    doc.text(
      `${this.dateRangeLabel}：${formatDate(this.dateStart)} ~ ${formatDate(this.dateEnd)}`,
      marginLeft,
      currentY,
    );
    doc.text(`列印時間：${this.printedAt}`, pageWidth - marginLeft, currentY, {
      align: 'right',
    });
    currentY += 10;

    if (this.mergedView) {
      this.exportMergedPDF(doc, currentY, marginLeft);
    } else {
      this.exportGroupedPDF(doc, currentY, marginLeft);
    }

    // ➕ 額外表格列印（如付款別小計）
    if (this.extraTablesForPDF?.length) {
      let y = (doc as any).lastAutoTable?.finalY || currentY + 20;

      this.extraTablesForPDF.forEach((table, tableIndex) => {
        // 每張表格間距 30pt
        y += 30;

        doc.setFont('Noto Sans TC');
        doc.setFontSize(12);
        doc.text(table.title, marginLeft, y);
        y += 10;

        const headers = table.columns.map((c) => c.header);
        const columnStyles: Record<number, any> = {};

        table.columns.forEach((col, index) => {
          if (col.style === 'text-left') columnStyles[index] = { halign: 'left' };
          else if (col.style === 'text-right') columnStyles[index] = { halign: 'right' };
          else columnStyles[index] = { halign: 'center' };
        });

        const body = (table.data || []).map((row) =>
          table.columns.map((col) => {
            const val = row[col.field];
            return typeof val === 'number'
              ? val.toLocaleString()
              : val != null
                ? String(val)
                : '';
          }),
        );

        // ➕ 加入總計列（若有金額欄）
        if (body.length > 0 && table.columns.some((col) => col.field === 'TXN_PayAmt')) {
          const totalAmt = table.data.reduce(
            (sum, row) => sum + (parseFloat(row['TXN_PayAmt']) || 0),
            0,
          );
          const totalRow = table.columns.map((col, idx) => {
            if (idx === 0) return '總計';
            if (col.field === 'TXN_PayAmt') return totalAmt.toLocaleString();
            return '';
          });
          body.push(totalRow);
        }

        autoTable(doc, {
          startY: y,
          head: [headers],
          body,
          margin: { left: marginLeft, right: marginLeft },
          styles: { font: 'Noto Sans TC', fontSize: 9 },
          columnStyles,
          headStyles: {
            font: 'Noto Sans TC',
            fontStyle: 'normal',
            fontSize: 10,
            fillColor: [230, 230, 250],
            textColor: [0, 0, 0],
            halign: 'center',
          },
          didParseCell(data) {
            const raw = data?.row?.raw ?? [];
            if (Array.isArray(raw) && raw[0] === '總計') {
              data.cell.styles.fillColor = [255, 255, 200];
            }
          },
        });

        // ✅ 更新下一張表格的 y 起始點
        y = (doc as any).lastAutoTable.finalY || y + 50;
      });


    }

    doc.save(`報表_${new Date().toISOString()}.pdf`);
    this.showPdfDialog = false;
  }

private exportMergedPDF(
  doc: jsPDF,
  currentY: number,
  marginLeft: number,
): void {
  const headers = this.selectedColumns.map((col) => col.header);
  const columnStyles: { [key: string]: any } = {};
  this.selectedColumns.forEach((col, index) => {
    let halign: 'left' | 'right' | 'center' = 'center';
    if (col.style === 'text-left') halign = 'left';
    else if (col.style === 'text-right' || this.subtotalFields.includes(col.field)) halign = 'right';
    columnStyles[index] = { halign };
  });

  const sourceData = this.sortedData.length > 0 ? this.sortedData : this._data;

  // ✅ 沒資料：表頭 + 查無資料 + 總計 0
  if (!sourceData || sourceData.length === 0) {
    const body: any[] = [];

    // 空訊息列（跨欄）
body.push([
  {
    content: this.emptyMessage || '查無資料',
    colSpan: headers.length,
    styles: {
      font: 'Noto Sans TC',               
      halign: 'center',
      
      textColor: [33, 150, 243],
    },
  },
]);

    // 總計列
    const totalRow = this.selectedColumns.map((col) => {
      if (col.field === '__index') return '總計';
      if (this.subtotalFields.includes(col.field)) return (0).toLocaleString();
      return '';
    });
    body.push(totalRow);

    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body,
      margin: { left: marginLeft, right: marginLeft },
      styles: { font: 'Noto Sans TC', fontSize: 9 },
      columnStyles,
      headStyles: {
        font: 'Noto Sans TC',
        fontStyle: 'normal',
        fontSize: 10,
        fillColor: [212, 222, 254],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      didParseCell(data) {
        const raw = Array.isArray(data.row.raw) ? data.row.raw : [];
        if (raw[0] && typeof raw[0] === 'object' && 'colSpan' in raw[0]) {
          data.cell.styles.fillColor = [240, 240, 255];
          data.cell.styles.font = 'Noto Sans TC';
        }
        if (raw[0] === '總計') {
          data.cell.styles.fillColor = [250, 250, 210];
          data.cell.styles.font = 'Noto Sans TC';
        }
      },
    });

    let summaryY = (doc as any).lastAutoTable.finalY + 20;
    this.printSummaryText(doc, summaryY);
    return;
  }

  // 🔻 原本「有資料」流程保持不變
  const body = sourceData.map((row, rowIndex) =>
    this.selectedColumns.map((col) => {
      if (col.field === '__index') return String(rowIndex + 1);
      const value = col.format ? col.format(row[col.field]) : row[col.field];
      return String(value ?? '');
    }),
  );

  const totalRow = this.selectedColumns.map((col) => {
    if (col.field === '__index') return '總計';
    if (this.subtotalFields.includes(col.field)) {
      const sum = sourceData.reduce(
        (acc, row) => acc + (parseFloat(row[col.field]) || 0),
        0,
      );
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
    styles: { font: 'Noto Sans TC', fontSize: 9 },
    columnStyles,
    headStyles: {
      font: 'Noto Sans TC',
      fontStyle: 'normal',
      fontSize: 10,
      fillColor: [212, 222, 254],
      textColor: [0, 0, 0],
      halign: 'center',
    },
    didParseCell(data) {
      const raw = Array.isArray(data.row.raw) ? data.row.raw : [];
      if (raw[0] === '總計') {
        data.cell.styles.fillColor = [250, 250, 210];
        data.cell.styles.font = 'Noto Sans TC';
        data.cell.styles.fontStyle = 'normal';
      }
    },
  });

  let summaryY = (doc as any).lastAutoTable.finalY + 20;
  this.printSummaryText(doc, summaryY);
}


private exportGroupedPDF(
  doc: jsPDF,
  startY: number,
  marginLeft: number,
): void {
  const headers = this.selectedColumns.map((col) => col.header);
  const columnStyles: { [key: string]: any } = {};
  this.selectedColumns.forEach((col, index) => {
    let halign: 'left' | 'right' | 'center' = 'center';
    if (col.style === 'text-left') halign = 'left';
    else if (col.style === 'text-right' || this.subtotalFields.includes(col.field)) halign = 'right';
    columnStyles[index] = { halign };
  });

  // ✅ 沒任何群組資料：表頭 + 查無資料 + 總計 0
  if (!this.groupedData || this.groupedData.length === 0) {
    const body: any[] = [];

    body.push([
      {
        content: this.emptyMessage || '查無資料',
        colSpan: headers.length,
        styles: { halign: 'center', fontStyle: 'bold', textColor: [33, 150, 243] },
      },
    ]);

    const totalRow = this.selectedColumns.map((col) => {
      if (col.field === '__index') return '總計';
      if (this.subtotalFields.includes(col.field)) return (0).toLocaleString();
      return '';
    });
    body.push(totalRow);

    autoTable(doc, {
      startY,
      head: [headers],
      body,
      margin: { left: marginLeft, right: marginLeft },
      styles: { font: 'Noto Sans TC', fontSize: 9 },
      columnStyles,
      headStyles: {
        font: 'Noto Sans TC',
        fontStyle: 'normal',
        fontSize: 10,
        fillColor: [212, 222, 254],
        textColor: [0, 0, 0],
        halign: 'center',
      },
      didParseCell(data) {
        const raw = Array.isArray(data.row.raw) ? data.row.raw : [];
        if (raw[0] && typeof raw[0] === 'object' && 'colSpan' in raw[0]) {
          data.cell.styles.fillColor = [240, 240, 255];
          data.cell.styles.font = 'Noto Sans TC';
          data.cell.styles.fontStyle = 'normal';
        }
        if (raw[0] === '總計') {
          data.cell.styles.fillColor = [250, 250, 210];
          data.cell.styles.font = 'Noto Sans TC';
        }
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    this.printSummaryText(doc, finalY);
    return;
  }

  // 🔻 原本「有資料」流程保持不變
  let allRows: any[] = [];
  this.groupedData.forEach((group, groupIndex) => {
    const groupKey = group[0]?.__groupKey ?? `群組${groupIndex + 1}`;
    const groupTitle = this.groupByLabel || this.groupByField || '群組';
    allRows.push([
      {
        content: `${groupTitle}：${groupKey}`,
        colSpan: headers.length,
        styles: { halign: 'left', fontStyle: 'bold' },
      },
    ]);

    group.forEach((row, rowIndex) => {
      allRows.push(
        this.selectedColumns.map((col) => {
          if (col.field === '__index') return String(this.getRowIndex(groupIndex, rowIndex));
          const value = col.format ? col.format(row[col.field]) : row[col.field];
          return String(value ?? '');
        }),
      );
    });

    const subtotalRow = this.selectedColumns.map((col) => {
      if (col.field === '__index') return '小計';
      if (this.subtotalFields.includes(col.field)) {
        const sum = group.reduce(
          (acc, row) => acc + (parseFloat(row[col.field]) || 0),
          0,
        );
        return sum.toLocaleString();
      }
      return '';
    });
    allRows.push(subtotalRow);
  });

  autoTable(doc, {
    startY,
    head: [headers],
    body: allRows,
    margin: { left: marginLeft, right: marginLeft },
    styles: { font: 'Noto Sans TC', fontSize: 9 },
    columnStyles,
    headStyles: {
      font: 'Noto Sans TC',
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
        data.cell.styles.font = 'Noto Sans TC';
        data.cell.styles.fontStyle = 'normal';
      }
      if (raw[0] === '小計') {
        data.cell.styles.fillColor = [250, 250, 210];
        data.cell.styles.font = 'Noto Sans TC';
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  this.printSummaryText(doc, finalY);
}


  private printSummaryText(doc: jsPDF, startY: number): void {
    if (this.pdfSummaryText?.length) {
      doc.setFont('Noto Sans TC');
      doc.setTextColor(255, 0, 0);
      doc.setFontSize(10);
      let y = startY;
      this.pdfSummaryText.forEach((line) => {
        doc.text(line, 40, y);
        y += 14;
      });
    }
  }

  exportExcel(): void {
    import('xlsx').then((xlsx) => {
      const ws = xlsx.utils.json_to_sheet(
        this._data.map((row) => {
          const item: any = {};
          this.columns.forEach((col) => {
            item[col.header] = row[col.field];
          });
          return item;
        }),
      );
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

  // 計算內容尺寸
getScrollWidth(bodyEl: HTMLElement): number {
  return bodyEl?.scrollWidth ?? 0;
}
getScrollHeight(bodyEl: HTMLElement): number {
  return bodyEl?.scrollHeight ?? 0;
}
// 是否需要顯示浮空捲軸
needsHScroll(bodyEl: HTMLElement): boolean {
  return (bodyEl?.scrollWidth ?? 0) > (bodyEl?.clientWidth ?? 0) + 1;
}
needsVScroll(bodyEl: HTMLElement): boolean {
  return (bodyEl?.scrollHeight ?? 0) > (bodyEl?.clientHeight ?? 0) + 1;
}

// 由「浮空水平捲軸」同步到主容器
syncFromFakeH(hostEl: HTMLElement, fakeH: HTMLElement): void {
  if (!hostEl || !fakeH) return;
  hostEl.scrollLeft = fakeH.scrollLeft;
}

syncFromFakeV(): void {
  const hostEl = this.hostRef?.nativeElement;
  const fakeV  = this.fakeVRef?.nativeElement;
  if (!hostEl || !fakeV) return;
  hostEl.scrollTop = fakeV.scrollTop;
}
// 由主容器捲動時，同步兩個浮空捲軸
onHostScroll(): void {
  const host = this.hostRef?.nativeElement;
  const fakeH = this.fakeHRef?.nativeElement;
  if (!host) return;

  // 同步水平浮空捲軸
  if (fakeH) fakeH.scrollLeft = host.scrollLeft;

  // 底部觸發載入
  const nearBottom = host.scrollTop + host.clientHeight >= host.scrollHeight - 80;
  if (nearBottom && !this.emitLock) {
    this.emitLock = true;
    this.reachBottom.emit();
    setTimeout(() => (this.emitLock = false), 150);
  }
}
// 讓父層可讀/寫捲動值
public getHostScrollTop(): number {
  return this.hostRef?.nativeElement?.scrollTop ?? 0;
}
public setHostScrollTop(top: number): void {
  const host = this.hostRef?.nativeElement;
  if (!host) return;
  host.scrollTop = top;
}

defaultTrackBy: TrackByFunction<any> = (_: number, row: any) => row?.[this.dataKey] ?? _;


}
