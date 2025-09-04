import { Component } from '@angular/core';
import {
  Location,
  DatePipe,
  NgFor,
  NgIf,
  NgClass,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { PdfService } from '../../../service/basic/pdf.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';

interface GroupedDataItem {
  tltKey: string;
  talentKey: string;
  rows: any[];
  showSubtotal?: boolean;
  showTotal?: boolean;
}

@Component({
  selector: 'app-tls23120-cru',
  templateUrl: './tls23120-cru.component.html',
  styleUrls: ['./tls23120-cru.component.scss'],
  standalone: true,
  imports: [
    MenubarComponent,
    DialogModule,
    FormsModule,
    ButtonDirective,
    NgFor,
    NgIf,
    TableModule,
    PrimeTemplate,
    NgClass,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    DatePipe,
  ],
})
export class TLS23120CRUComponent extends BasicCruPageComponent<any> {
  // 原始欄位與資料
  data: any[] = [];
  dataForm = this.formBuilder.nonNullable.group({
    showBusType: true,
  });

  printedAt = '';
  dateStart = '';
  dateEnd = '';
  queryFormValue: any;
  groupByField = 'TLT_NO';
  groupByLabel = '專櫃';
  groupedData: GroupedDataItem[] = [];
  reportTitle = '專櫃日對帳單';
  dateRangeLabel = '日期區間';

  // 顯示控制
  pageSize = 1000;
  showGroupedBody = true;
  showRowsPerTableDialog = false;
  showColumnDialog = false;

  // 選項與欄位控制
  rowsPerTable = 1000;
  tempRowsPerTable = 1000;
  subtotalFields: string[] = [
    'sad_sale_qty',
    'sad_sale_namt',
    'sad_sale_tax',
    'sad_sale_amt',
    'sad_preorder_qty',
    'sad_preorder_amt',
    'sad_settle_qty',
    'sad_settle_amt',
  ];

  selectedColumns: any[] = [];
  availableColumns: any[] = [];
  tempSelectedColumns: any[] = [];

  constructor(
    private location: Location,
    private pdfService: PdfService,
    private columnLabelService: ColumnLabelService
  ) {
    super();
  }

  columns = [
    { field: 'SYS_Name', header: '區分', visible: true },
    { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
    {
      field: 'sad_sale_namt',
      header: '淨銷貨',
      visible: true,
      style: 'text-right',
      format: (v: any) => this.moneyFormat(v),
    },
    {
      field: 'sad_sale_tax',
      header: '營業稅',
      visible: true,
      style: 'text-right',
      format: (v: any) => this.moneyFormat(v),
    },
    {
      field: 'sad_sale_amt',
      header: '銷貨金額',
      visible: true,
      style: 'text-right',
      format: (v: any) => this.moneyFormat(v),
    },
    { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
    {
      field: 'sad_preorder_amt',
      header: '預售金額',
      visible: true,
      style: 'text-right',
      format: (v: any) => this.moneyFormat(v),
    },
    { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
    {
      field: 'sad_settle_amt',
      header: '結帳金額',
      visible: true,
      style: 'text-right',
      format: (v: any) => this.moneyFormat(v),
    },
  ];

  async ngOnInit(): Promise<void> {
    const state = history.state;
    const showBusTypeValue = state?.queryFormValue?.ShowBusType ?? true;
    this.dataForm.get('showBusType')?.setValue(showBusTypeValue);

    this.availableColumns = this.columns;

    if (state?.data && Array.isArray(state.data)) {
      this.data = state.data;
      this.queryFormValue = state.queryFormValue;
      this.dateStart = state.queryFormValue?.TXN_DateStart || '';
      this.dateEnd = state.queryFormValue?.TXN_DateEnd || '';
      this.pageSize = state.pageSize || 1000;
      this.rowsPerTable = this.pageSize;
      this.printedAt = new Date().toLocaleString('zh-TW');
    } else {
      this.messageService.warnBubble('⚠️ 無資料可顯示，請重新查詢。');
    }

    this.availableColumns = [...this.columns];
    this.buildSelectedColumns();
    this.splitData();
    this.initializePage('TLS23120', this.dataForm);
  }

  buildSelectedColumns(): void {
    const withIndex = [{ header: '序號', field: '__index' }];
    this.selectedColumns = withIndex.concat(this.columns);
    this.tempSelectedColumns = [...this.columns];
  }

  applyColumnSelection(): void {
    const withIndex = [{ header: '序號', field: '__index' }];
    this.selectedColumns = withIndex.concat(this.tempSelectedColumns);
    this.showColumnDialog = false;
  }

  applyRowsPerTableChange(): void {
    if (this.tempRowsPerTable > 0) {
      this.rowsPerTable = this.tempRowsPerTable;
      this.splitData();
      this.showRowsPerTableDialog = false;
    }
  }

  onToggleGroupedBody(): void {
    this.showGroupedBody = !this.showGroupedBody;
  }

  getRowIndex(_groupIndex: number, rowIndex: number): number {
    return rowIndex + 1;
  }

  get showBusType(): boolean {
    return !!this.dataForm.get('showBusType')?.value;
  }

  getSubtotal(group: any[], field: string): string {
    const sum = group.reduce((acc, row) => {
      const value = row[field];
      const numeric = +String(value ?? 0).replace(/,/g, '');
      return acc + (isNaN(numeric) ? 0 : numeric);
    }, 0);
    return sum.toLocaleString();
  }

  moneyFormat(value: any): string {
    const n = Number(String(value ?? 0).replace(/,/g, ''));
    return isFinite(n) ? n.toLocaleString('en-US') : '0';
  }

  printPage(): void {
    const printContents = document.getElementById('print-section')?.innerHTML;
    if (!printContents) {
      this.messageService.warnBubble('⚠️ 找不到要列印的區塊');
      return;
    }

    const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    if (!popupWin) return;

    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
          <title>列印報表</title>
          <style>
            body { font-family: 'Noto Sans TC', sans-serif; padding: 20px; }
            table, th, td { border: 1px solid #000; border-collapse: collapse; }
            th, td { padding: 4px; text-align: center; }
            /* Header 顏色 */
            thead th { background-color: #c7d2fe !important; color: #000 !important; font-weight: 600; }
            /* Body 斑馬紋 */
            tbody tr:nth-child(odd) td { background-color: #E0E0E0 !important; }
            tbody tr:nth-child(even) td { background-color: #FFFFFF !important; }
            /* 小計、總計 */
            tfoot tr.subtotal-row td { background-color: #9cb1fb !important; color: #001a4d; font-weight: 600; }
            tfoot tr.total-row td { background-color: #c7d2fe !important; color: #001a4d; font-weight: 700; border-top: 2px solid #6aa9ff; }
            /* 防止 hover/active 覆蓋 */
            tfoot tr.total-row:hover td,
            tfoot tr.subtotal-row:hover td { filter: brightness(0.98); }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContents}
        </body>
      </html>
    `);
    popupWin.document.close();
  }

  splitData(): void {
    const groupedMap = new Map<string, Map<string, any[]>>();

    this.data.forEach((item) => {
      const tltKey = item[this.groupByField] ?? '未分類';
      const talentKey = item['Talent_ID'] ?? '無';

      if (!groupedMap.has(tltKey)) groupedMap.set(tltKey, new Map());
      const subGroup = groupedMap.get(tltKey)!;
      if (!subGroup.has(talentKey)) subGroup.set(talentKey, []);
      subGroup.get(talentKey)!.push(item);
    });

    this.groupedData = [];

    groupedMap.forEach((talentMap, tltKey) => {
      const allRows: any[] = [];
      talentMap.forEach((rows) => allRows.push(...rows));

      const talentKeys = Array.from(talentMap.keys());
      const isSingleTalent = talentKeys.length === 1;

      this.groupedData.push({
        tltKey,
        talentKey: isSingleTalent ? talentKeys[0] : '混合',
        rows: allRows,
        showSubtotal: isSingleTalent,
        showTotal: true,
      });
    });
     this.applySortForGroups();
  }

  goBack(): void {
    this.location.back();
  }

  /** 依群組第一列準備表頭資料（每張表各自的抬頭） */
/** 依群組第一列準備表頭資料（每張表各自的抬頭，與 HTML 對齊） */
private getHeaderInfoByGroup(firstRow: any) {
  const salesDate = firstRow?.TXN_DATE ?? this.dateStart;

  // 與 HTML 一致的欄位優先序
  const biz = `${firstRow?.bus_type ?? ''}/${firstRow?.bus_type_name ?? ''}`.replace(/^\/$/, '');
  const counter = `${firstRow?.TLT_NO ?? ''}/${firstRow?.tlt_name ?? ''}`.replace(/^\/$/, '');
  const floor = firstRow?.floor_desc ?? firstRow?.FLOOR_NO ?? '－'; // ← HTML 用 floor_desc
  const area = firstRow?.AREA_NO ?? firstRow?.area_no ?? '－';      // ← HTML 用 AREA_NO
  const cutType = firstRow?.TLT_ID ?? '無';

  // 與 HTML 一致：交易總件數/退貨件數/退貨金額
  const totalCount = Number(firstRow?.total_count ?? this.data?.length ?? 0);
  const returnQty  = Number(firstRow?.return_qty ?? 0);
  const returnAmt  = Number(firstRow?.return_amt ?? 0);

  return {
    company: '南紡流通事業股份有限公司',
    title: '專櫃日對帳單',
    biz,
    counter,
    area,
    salesDate: this.formatDate(salesDate),
    floor,
    cutType,
    madeAt: this.printedAt || new Date().toLocaleString('zh-TW'),
    totalCount,
    returnQty,
    returnAmt,
    showBusType: this.showBusType,
  };
}



/** 畫出與 HTML 相同資訊排版（1: 大分類/日期/製表；2: 專櫃/樓層+抽成/交易總件數+退貨件數；3: 區域/空白/退貨金額） */
private drawGroupHeaderOnce(
  doc: jsPDF,
  info: any,
  pageWidth: number,
  marginLeft: number,
  currentY: number,
): number {
  const leftX = marginLeft;
  const midX = leftX + 240;
  const rightX = pageWidth - marginLeft;
  const lineGap = 18;

  const safeTop = 40;
  let y = Math.max(currentY, safeTop + 10);

  // 保留足夠空間給表頭，不夠就換頁
  const needed = 110;
  const pageHeight = doc.internal.pageSize.getHeight();
  const remaining = pageHeight - y;
  if (remaining < needed) {
    doc.addPage();
    y = safeTop + 10;
  }

  // 公司/標題
  doc.setFontSize(16);
  doc.text(info.company || '', pageWidth / 2, y, { align: 'center' });
  y += 25;

  doc.setFontSize(14);
  doc.text(info.title || '', pageWidth / 2, y, { align: 'center' });
  y += 25;

  doc.setFontSize(10);

  // 第1列（左：大分類／中：銷售日期／右：製表日期）—與 HTML 一致（左欄可空）
  if (info.showBusType) {
    doc.text(`大分類：${info.biz || '－'}`, leftX, y);
  }
  doc.text(`銷售日期：${info.salesDate || '－'}`, midX, y);
  doc.text(`製表日期：${info.madeAt}`, rightX, y, { align: 'right' });
  y += lineGap;

  // 第2列（左：專櫃／中：樓層+抽成類別／右：交易總件數+退貨件數）
  doc.text(`專櫃：${info.counter || '－'}`, leftX, y);
  doc.text(`樓層：${info.floor || '－'}  抽成類別：${info.cutType ?? '無'}`, midX, y);
  doc.text(`交易總件數：${info.totalCount ?? 0} / 退貨件數：${info.returnQty ?? 0}`, rightX, y, { align: 'right' });
  y += lineGap;

  // 第3列（左：區域／中：留白／右：退貨金額）
  doc.text(`區域：${info.area || '－'}`, leftX, y);
  doc.text(`退貨金額：${info.returnAmt ?? 0}`, rightX, y, { align: 'right' });

  return y + 20;
}




  /** 匯出 PDF（含配色：Header/斑馬紋/小計/總計） */
/** 匯出 PDF：每個群組只畫一次表頭 */
exportPDF(orientation: 'p' | 'l' = 'p'): void {
  const columnCount = this.selectedColumns.length;
  const columnWidth = 80;
  const customWidth = Math.max(595, columnCount * columnWidth);

  const doc = new jsPDF({ orientation, unit: 'pt', format: [customWidth, 842] });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 40;

  const HEADER_COLOR: [number, number, number] = [199, 210, 254];
  const ODD_ROW_COLOR: [number, number, number] = [224, 224, 224];
  const EVEN_ROW_COLOR: [number, number, number] = [255, 255, 255];
  const SUBTOTAL_COLOR: [number, number, number] = [156, 177, 251];
  const TOTAL_COLOR: [number, number, number] = [199, 210, 254];

  doc.addFont('assets/fonts/NotoSansTC-VariableFont_wght.ttf', 'Noto Sans TC', 'normal');
  doc.setFont('Noto Sans TC');

  let currentY = 60; // ← 一開始 60 就好，之後都由流程推進

  this.groupedData.forEach((group, gIdx) => {
    // 若剩餘空間很小，先換頁（避免表頭被擠）
    const pageHeight = doc.internal.pageSize.getHeight();
    if (pageHeight - currentY < 160) {
      doc.addPage();
      currentY = 60;
    } else if (gIdx > 0) {
      currentY += 20; // 群組間留白
    }

    // 依該群組第一列畫一次表頭：回傳表格起始 Y
    const firstRow = group?.rows?.[0] ?? {};
    const info = this.getHeaderInfoByGroup(firstRow);
    currentY = this.drawGroupHeaderOnce(doc, info, pageWidth, marginLeft, currentY);

    const tableColumns = this.selectedColumns.map(col => ({
      header: col.header,
      dataKey: col.field,
    }));

    const tableData: any[] = group.rows.map((row, rowIndex) => {
      const obj: any = {};
      this.selectedColumns.forEach(col => {
        obj[col.field] = col.field === '__index'
          ? rowIndex + 1
          : col.format
            ? col.format(row[col.field])
            : row[col.field];
      });
      return obj;
    });

    if (group.showSubtotal) {
      const subtotalRow: any = { __type: 'subtotal' };
      this.selectedColumns.forEach(col => {
        if (col.field === '__index') subtotalRow[col.field] = '小計';
        else if (this.subtotalFields.includes(col.field))
          subtotalRow[col.field] = this.getSubtotal(group.rows, col.field);
        else subtotalRow[col.field] = '';
      });
      tableData.push(subtotalRow);
    }

    if (group.showTotal) {
      const totalRow: any = { __type: 'total' };
      this.selectedColumns.forEach(col => {
        if (col.field === '__index') totalRow[col.field] = '總計';
        else if (this.subtotalFields.includes(col.field))
          totalRow[col.field] = this.getSubtotal(group.rows, col.field);
        else totalRow[col.field] = '';
      });
      tableData.push(totalRow);
    }

    autoTable(doc, {
      startY: currentY,                 // ← 直接用我們計算的 Y
      columns: tableColumns,
      body: tableData,
      pageBreak: 'auto',                // ← 讓表格內部自己換頁
      styles: {
        font: 'Noto Sans TC',
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        textColor: [0, 0, 0],
      },
      headStyles: {
        font: 'Noto Sans TC',
        fontStyle: 'normal',
        fontSize: 10,
        fillColor: HEADER_COLOR,
        textColor: [0, 0, 0],
        halign: 'center',
      },
      theme: 'grid',
      margin: { left: marginLeft, right: marginLeft }, // ← 拿掉 top

      didParseCell: (data) => {
        const raw: any = data?.row?.raw || {};
        if (data.section === 'body') {
          if (raw.__type === 'subtotal') {
            data.cell.styles.fillColor = SUBTOTAL_COLOR;
          } else if (raw.__type === 'total') {
            data.cell.styles.fillColor = TOTAL_COLOR;
          } else {
            const isOdd = (data.row.index % 2) === 0;
            data.cell.styles.fillColor = isOdd ? ODD_ROW_COLOR : EVEN_ROW_COLOR;
          }
        }
      },

      didDrawPage: (hookData: any) => {
        // 只放頁碼，不畫表頭
        const rightX = pageWidth - marginLeft;
        const pageNo =
          (doc as any).internal?.getCurrentPageInfo?.().pageNumber ??
          hookData?.pageNumber ?? 1;
        doc.setFontSize(9);
        doc.text(`頁數：${pageNo}`, rightX, 30, { align: 'right' });
      },
    });

    // 下一段從表格結束後繼續
    currentY = (doc as any).lastAutoTable.finalY + 30;
  });

  doc.save(`專櫃日對帳單_${new Date().toISOString()}.pdf`);
}



  /** 依「圖一」準備表頭資料 */
  private getHeaderInfo() {
    const first = this.data?.[0] ?? {};
    const salesDate =
      this.queryFormValue?.TXN_DateStart || first?.TXN_DATE || this.dateStart;
    const biz = `${first?.bus_type ?? ''}/${first?.bus_type_name ?? ''}`.replace(/^\/$/, '');
    const counter = `${first?.TLT_NO ?? ''}/${first?.tlt_name ?? ''}`.replace(/^\/$/, '');
    const area = first?.AREA_NO ?? '';
    const floor = first?.FLOOR_NO ?? '';
    const cutType = first?.TLT_ID ?? '0';
    const returnQty = first?.return_qty ?? 0;
    const returnAmt = first?.return_amt ?? 0;
    const totalTxns = this.data?.length ?? 0;

    return {
      company: '南紡流通事業股份有限公司',
      title: '專櫃日對帳單',
      biz,
      counter,
      area,
      salesDate: this.formatDate(salesDate),
      floor,
      cutType,
      madeAt: this.printedAt || new Date().toLocaleString('zh-TW'),
      totalTxns,
      returnQty,
      returnAmt,
    };
  }

  /** 表頭繪製 */
  private drawReportHeader(
    doc: jsPDF,
    info: any,
    marginLeft: number,
    pageWidth: number,
    pageNo: number
  ) {
    const leftX = marginLeft;
    const midX = leftX + 240;
    const rightX = pageWidth - marginLeft;
    const lineGap = 18;

    doc.setFontSize(16);
    doc.text(info.company || '', pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(14);
    doc.text(info.title || '', pageWidth / 2, 75, { align: 'center' });

    doc.setFontSize(10);
    let y = 110;

    // 第1列
    doc.text(`大分類：${info.biz || '－'}`, leftX, y);
    doc.text(`銷售日期：${info.salesDate || '－'}`, midX, y);
    doc.text(`製表日期：${info.madeAt}`, rightX, y, { align: 'right' });
    y += lineGap;

    // 第2列
    doc.text(`專櫃：${info.counter || '－'}`, leftX, y);
    doc.text(`樓層：${info.floor || '－'}  抽成類別：${info.cutType}`, midX, y);
    doc.text(`交易總件數：${info.totalTxns} / 退貨件數：${info.returnQty}`, rightX, y, { align: 'right' });
    y += lineGap;

    // 第3列
    doc.text(`區域：${info.area || '－'}`, leftX, y);
    doc.text(`退貨金額：${info.returnAmt}`, rightX, y, { align: 'right' });

    // 頁碼
    doc.text(`頁數：${pageNo}`, rightX, 95, { align: 'right' });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

  /** 你原本的摘要 PDF（若未使用可忽略） */
  exportSummaryPDF(): void {
    this.pdfService.exportReportPDF({
      orientation: 'l',
      title: '專櫃日對帳單',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns: this.columns,
      data: this.data,
      subtotalFields: this.subtotalFields,
      summaryText: [],
      mergeTotalCols: 1,
    });
  }

  exportExcel(): void {
    import('xlsx').then((xlsx) => {
      const rows = this.data.map((row) => {
        const o: Record<string, any> = {};
        o['專櫃'] = `${row?.TLT_NO ?? ''} / ${row?.tlt_name ?? ''}`;
        o['抽成類別'] = row?.TLT_ID ?? '';
        this.columns.forEach((col) => {
          o[col.header] =
            typeof col.format === 'function'
              ? col.format(row[col.field])
              : row[col.field];
        });
        return o;
      });

      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '專櫃日對帳單');
      xlsx.writeFile(wb, `專櫃日對帳單_${new Date().toISOString()}.xlsx`);
    });
  }

  exportSummaryExcel(): void {
    import('xlsx').then((xlsx) => {
      const rows = this.data.map((row: any) => {
        const o: Record<string, any> = {};
        o['專櫃'] = `${row?.TLT_NO ?? ''} / ${row?.tlt_name ?? ''}`;
        o['抽成類別'] = row?.TLT_ID ?? '';
        this.columns.forEach((col: any) => {
          o[col.header] =
            typeof col.format === 'function'
              ? col.format(row[col.field])
              : row[col.field];
        });
        return o;
      });

      const ws = xlsx.utils.json_to_sheet(rows);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '專櫃日對帳單');
      xlsx.writeFile(wb, `專櫃日對帳單_${new Date().toISOString()}.xlsx`);
    });
  }
  // component.ts
multiSortMeta = [
  { field: 'bus_type', order: 1 }, // 1=升冪
  { field: 'TLT_NO', order: 1 },
];
  private compareNullable(a?: string | number | null, b?: string | number | null) {
  const aa = (a ?? '').toString();
  const bb = (b ?? '').toString();
  // 用 localeCompare 的 numeric 模式，能把 "2" < "10" 視為數值比較
  return aa.localeCompare(bb, undefined, { numeric: true, sensitivity: 'base' });
}
// 依「大分類 → 專櫃編號」的列比較子
private rowComparator = (x: any, y: any) => {
  const byBusType = this.compareNullable(x?.bus_type, y?.bus_type);
  if (byBusType !== 0) return byBusType;
  return this.compareNullable(x?.TLT_NO, y?.TLT_NO);
};

// 準備/更新 groupedData 後呼叫一次
private applySortForGroups() {
  if (!Array.isArray(this.groupedData)) return;

  // 先把每個群組內的 rows 排好
  this.groupedData.forEach(g => {
    if (Array.isArray(g?.rows)) {
      g.rows = [...g.rows].sort(this.rowComparator);
    }
  });

  // 再依各群組第一列的關鍵欄位，決定群組顯示順序
  this.groupedData = [...this.groupedData].sort((a, b) => {
    const ra = a?.rows?.[0] ?? {};
    const rb = b?.rows?.[0] ?? {};
    return this.rowComparator(ra, rb);
  });
}
}
