/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from '@angular/core';
import {
  Location,
  DatePipe,
  DecimalPipe,
  NgFor,
  NgIf,
  NgClass,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';


interface SubTable {
  tltId: string;
  rows: any[];
  subtotal: Record<string, number>;
}

interface TltGroup {
  tltNo: string;
  header: {
    tltNo: string;
    tltName: string;
    busType?: string;
    busTypeName?: string;
    floor?: string;
    area?: string;
    txnDate?: string;
  };
  subTables: SubTable[];
  grandAll: Record<string, number>; // 此 TLT_NO 所有 TLT_ID 合計
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
    DecimalPipe, // 支援 | number
  ],
})
export class TLS23120CRUComponent extends BasicCruPageComponent<any> {
  data: any[] = [];
  dataForm = this.formBuilder.nonNullable.group({ showBusType: true });

  printedAt = '';
  dateStart = '';
  dateEnd = '';
  queryFormValue: any;

  pageSize = 1000;
  rowsPerTable = 1000;

  /** 小計/總計要彙總的欄位 */
  subtotalFields: string[] = [
    'sad_sale_qty',
    'sad_sale_namt',
    'sad_sale_tax',
    'sad_sale_amt',
    'sad_preorder_qty',
    'sad_preorder_amt',
    'sad_settle_qty',
    'sad_settle_amt',
    'return_qty',
    'return_amt',
    'total_count',
  ];

  selectedColumns: any[] = [];
  availableColumns: any[] = [];
  tltGroups: TltGroup[] = [];

  constructor(private location: Location) { super(); }

  columns = [
    { field: 'SYS_Name', header: '區分', visible: true },
    { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
    { field: 'sad_sale_namt', header: '淨銷貨', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_sale_tax', header: '營業稅', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_sale_amt', header: '銷貨金額', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
    { field: 'sad_preorder_amt', header: '預售金額', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
    { field: 'sad_settle_amt', header: '結帳金額', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },

  ];

  /** 排序：大分類 → 專櫃 → 抽成類別 */
  multiSortMeta = [
    { field: 'bus_type', order: 1 },
    { field: 'TLT_NO', order: 1 },
    { field: 'TLT_ID', order: 1 },
  ];

  private compareNullable(a?: string | number | null, b?: string | number | null) {
    const aa = (a ?? '').toString();
    const bb = (b ?? '').toString();
    return aa.localeCompare(bb, undefined, { numeric: true, sensitivity: 'base' });
  }
  private rowComparator = (x: any, y: any) => {
    const byBusType = this.compareNullable(x?.bus_type, y?.bus_type);
    if (byBusType !== 0) return byBusType;
    const byTltNo = this.compareNullable(x?.TLT_NO, y?.TLT_NO);
    if (byTltNo !== 0) return byTltNo;
    return this.compareNullable(x?.TLT_ID, y?.TLT_ID);
  };

  async ngOnInit(): Promise<void> {
    const state = history.state;
    const showBusTypeValue = state?.queryFormValue?.ShowBusType ?? true;
    this.dataForm.get('showBusType')?.setValue(showBusTypeValue);

    this.availableColumns = this.columns;

    if (state?.data && Array.isArray(state.data)) {
      // 注意：列表頁已將欄位正規化含 TXN_DATE/FLOOR_NO/AREA_NO
      this.data = [...state.data].sort(this.rowComparator);
      this.queryFormValue = state.queryFormValue;
      this.dateStart = state.queryFormValue?.TXN_DateStart || '';
      this.dateEnd = state.queryFormValue?.TXN_DateEnd || '';
      this.pageSize = state.pageSize || 1000;
      this.rowsPerTable = this.pageSize;
      this.printedAt = new Date().toLocaleString('zh-TW');
    } else {
      this.messageService.warnBubble('⚠️ 無資料可顯示，請重新查詢。');
    }

    this.buildSelectedColumns();
    this.buildTltGroups();
    this.initializePage('TLS23120', this.dataForm);
  }

  buildSelectedColumns(): void {
    const withIndex = [{ header: '序號', field: '__index' }];
    this.selectedColumns = withIndex.concat(this.columns);
  }

  /** 加總工具 */
  private calcSum(rows: any[], fields: string[]): Record<string, number> {
    const out: Record<string, number> = {};
    for (const f of fields) out[f] = 0;
    for (const r of rows) {
      for (const f of fields) {
        const v = Number(String(r?.[f] ?? 0).toString().replace(/,/g, ''));
        if (Number.isFinite(v)) out[f] += v;
      }
    }
    return out;
  }

  /** 生成 TLT_NO 群組 → 群組內按 TLT_ID 分表；總計列出現在該群組最後一張表 */
  private buildTltGroups(): void {
    const map = new Map<string, any[]>();
    this.data.forEach(row => {
      const key = row?.TLT_NO ?? '未分類';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    });

    const groups: TltGroup[] = [];

    Array.from(map.entries())
      .sort((a, b) => this.compareNullable(a[0], b[0]))
      .forEach(([tltNo, rowsOfThisTlt]) => {
        const subMap = new Map<string, any[]>();
        rowsOfThisTlt.forEach(r => {
          const id = (r?.TLT_ID ?? '').toString();
          if (!subMap.has(id)) subMap.set(id, []);
          subMap.get(id)!.push(r);
        });

        const first = rowsOfThisTlt[0] ?? {};
        const header = {
          tltNo,
          tltName: first?.tlt_name ?? '',
          busType: first?.bus_type ?? '',
          busTypeName: first?.bus_type_name ?? '',
          floor: first?.floor_desc ?? first?.FLOOR_NO ?? '－',
          area: first?.AREA_NO ?? first?.area_no ?? '－',
          txnDate: first?.TXN_DATE ?? first?.sad_date ?? '',
        };

        const grandAll = this.calcSum(rowsOfThisTlt, this.subtotalFields);

        const subTables: SubTable[] = Array.from(subMap.entries())
          .sort((a, b) => this.compareNullable(a[0], b[0]))
          .map(([tltId, rows]) => ({
            tltId,
            rows,
            subtotal: this.calcSum(rows, this.subtotalFields),
          }));

        groups.push({ tltNo, header, subTables, grandAll });
      });

    this.tltGroups = groups;
  }

  // --- UI helpers ---
  get showBusType(): boolean {
    return !!this.dataForm.get('showBusType')?.value;
  }
  getRowIndex(_groupIndex: number, rowIndex: number): number {
    return rowIndex + 1;
  }
  moneyFormat(value: any): string {
    const n = Number(String(value ?? 0).replace(/,/g, ''));
    return isFinite(n) ? n.toLocaleString('en-US') : '0';
  }
  goBack(): void { this.location.back(); }
  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}/${m}/${d}`;
  }

// =========================
//        匯出 PDF
// =========================
exportPDF(orientation: 'p' | 'l' = 'l'): void {
  // ===== 基本頁面設定 =====
  const columnCount = this.selectedColumns.length;
  const columnWidth = 80;
  const customWidth = Math.max(595, columnCount * columnWidth);

  const doc = new jsPDF({ orientation, unit: 'pt', format: [customWidth, 842] });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 40;

  // ===== 字型（若已註冊會 throw，忽略即可） =====
  try {
    doc.addFont('assets/fonts/NotoSansTC-VariableFont_wght.ttf', 'Noto Sans TC', 'normal');
  } catch {}
  doc.setFont('Noto Sans TC', 'normal');

  // ===== 顏色設定 =====
  const HEADER_COLOR: [number, number, number]   = [199, 210, 254];
  const ODD_ROW_COLOR: [number, number, number]  = [224, 224, 224];
  const EVEN_ROW_COLOR: [number, number, number] = [255, 255, 255];
  const SUBTOTAL_COLOR: [number, number, number] = [156, 177, 251];
  const TOTAL_COLOR: [number, number, number]    = [199, 210, 254];
  const BLUE: [number, number, number]           = [ 37,  99, 235];
  const RED:  [number, number, number]           = [220,  38,  38];

  let currentY = 60;

  // =========================
  //   抬頭三欄小工具（支援右移 dx、分段上色）
  // =========================
  type Part = { text: string; color?: [number, number, number] };
  type GridItem =
    | string
    | {
        parts: Part[];
        dx?: number;                                  // 往右位移（pt）
        align?: 'left' | 'center' | 'right';          // 文字對齊（預設 left）
        fontSize?: number;                            // 單格字級（預設 10）
      };

  const drawParts = (x: number, y: number, parts: Part[], baseFontSize = 10) => {
    let cursorX = x;
    doc.setFont('Noto Sans TC', 'normal');
    doc.setFontSize(baseFontSize);
    parts.forEach(p => {
      if (p.color) doc.setTextColor(...p.color);
      else doc.setTextColor(0, 0, 0);
      doc.text(p.text, cursorX, y, { baseline: 'alphabetic' });
      cursorX += doc.getTextWidth(p.text);
    });
    doc.setTextColor(0, 0, 0); // 還原
  };

  const drawKeyValueGrid = (
    items: GridItem[],
    startX: number,
    startY: number,
    opts?: {
      cols?: number;
      colGap?: number;
      rowGap?: number;
      rowHeight?: number;
      fontSize?: number;
      align?: 'left' | 'center' | 'right';
      rightMargin?: number;
    }
  ): number => {
    const {
      cols = 3,
      colGap = 24,
      rowGap = 10,
      rowHeight = 14,
      fontSize = 10,
      align = 'left',
      rightMargin = marginLeft,
    } = opts || {};

    const usableWidth = pageWidth - startX - rightMargin;
    const colWidth = (usableWidth - colGap * (cols - 1)) / cols;

    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      let x = startX + col * (colWidth + colGap);
      const y = startY + row * (rowHeight + rowGap);

      if (typeof item === 'string') {
        doc.setTextColor(0, 0, 0);
        doc.setFont('Noto Sans TC', 'normal');
        doc.setFontSize(fontSize);
        doc.text(item, x, y, { align });
      } else {
        const dx = item.dx ?? 0;
        const localAlign = item.align ?? align;
        const localSize = item.fontSize ?? fontSize;

        let leftX = x;
        if (localAlign !== 'left') {
          const totalW = item.parts.reduce((s, p) => s + doc.getTextWidth(p.text), 0);
          if (localAlign === 'center') leftX = x + (colWidth - totalW) / 2;
          if (localAlign === 'right')  leftX = x + colWidth - totalW;
        }
        drawParts(leftX + dx, y, item.parts, localSize);
      }
    });

    const rows = Math.ceil(items.length / cols);
    return startY + rows * (rowHeight + rowGap);
  };

  // =========================
  //   抽成類別置中橫幅（藍字）
  // =========================
// =========================
//   抽成類別置中橫幅（標籤藍色，tltId 紅色）
// =========================
const drawCenteredTltIdBanner = (tltId: string) => {
  if (pageHeight - currentY < 40) {
    doc.addPage();
    doc.setFont('Noto Sans TC', 'normal');
    currentY = 60;
  }

  const label = '抽成類別：';
  const value = tltId || '無';

  doc.setFont('Noto Sans TC', 'normal');
  doc.setFontSize(12);

  // 先量寬，讓（label+value）整段可以真正置中
  const labelW = doc.getTextWidth(label);
  const valueW = doc.getTextWidth(value);
  const totalW = labelW + valueW;

  // 讓整段置中：從 page 中央往左半個 totalW 當起點
  let startX = (pageWidth / 2) - (totalW / 2);

  // 標籤：藍色
  doc.setTextColor(...BLUE);
  doc.text(label, startX, currentY, { baseline: 'alphabetic' });

  // 值：紅色，接在標籤後面
  startX += labelW;
  doc.setTextColor(...RED);
  doc.text(value, startX, currentY, { baseline: 'alphabetic' });

  // 還原為黑色
  doc.setTextColor(0, 0, 0);

  currentY += 14;
};


  // =========================
  //   完整抬頭（公司/標題 + 三欄資訊）
  // =========================
  const drawFullGroupHeader = (g: any, firstSub: any) => {
    const firstRow = firstSub?.rows?.[0] ?? {};
    const totalCount = Number(firstRow?.total_count ?? 0);
    const returnQty  = Number(firstRow?.return_qty ?? 0);
    const returnAmt  = Number(firstRow?.return_amt ?? 0);

    const needed = 160;
    if (pageHeight - currentY < needed) {
      doc.addPage();
      doc.setFont('Noto Sans TC', 'normal');
      currentY = 60;
    }

    // 公司 + 標題
    doc.setFont('Noto Sans TC', 'normal');
    doc.setFontSize(16);
    doc.text('南紡流通事業股份有限公司', pageWidth / 2, currentY, { align: 'center' });
    currentY += 25;

    doc.setFontSize(14);
    doc.text('專櫃日對帳單', pageWidth / 2, currentY, { align: 'center' });
    currentY += 25;

    // 與 HTML 同順序（指定右移與顏色）
    const infoItems: GridItem[] = [
      // 1 大分類
      (this.showBusType
        ? { parts: [{ text: `大分類：${`${g.header.busType ?? ''}/${g.header.busTypeName ?? ''}`.replace(/\/$/, '')}` }] }
        : { parts: [{ text: '大分類：' }] }
      ),
      // 2 銷售日期（值紅、右移 20pt）
      {
        dx: 70,
        parts: [
          { text: '銷售日期：' },
          { text: this.formatDate(g.header.txnDate || '') },
        ],
      },
      // 3 製表日期（值紅）
      {
        dx: 80,
        parts: [
          { text: '製表日期：' },
          { text: this.printedAt},
        ],
      },
      // 4 專櫃（值紅）
      {
        parts: [
          { text: '專櫃：' },
          { text: `${g.header.tltNo} / ${g.header.tltName}` },
        ],
      },
      // 5 樓層 + 抽成類別（樓層值紅、抽成類別藍，右移 20pt）
      {
        dx: 70,
        parts: [
          { text: '樓層：' },
          { text: `${g.header.floor || '－'}`},
          { text: '  抽成類別：', color: BLUE },
          { text: `${firstSub?.tltId || '無'}`, color: RED},
        ],
      },
      // 6 交易總件數／退貨件數（值紅）
      {
        dx: 80,
        parts: [
          { text: '交易總件數／退貨件數：' },
          { text: `${totalCount} / ${returnQty}` },
        ],
      },
      // 7 區域（值紅）
      {
        parts: [
          { text: '區域：' },
          { text: `${g.header.area || '－'}` },
        ],
      },
      // 8 空白位（保持三欄節奏）
      { parts: [{ text: '' }] },
      // 9 退貨金額（值紅）
      {
        dx: 80,
        parts: [
          { text: '退貨金額：' },
          { text: this.moneyFormat(returnAmt) },
        ],
      },
    ];

    currentY = drawKeyValueGrid(infoItems, marginLeft, currentY, {
      cols: 3,
      colGap: 24,
      rowGap: 10,
      rowHeight: 14,
      fontSize: 10,
      align: 'left',
      rightMargin: marginLeft,
    });

    currentY += 10;
  };

  // =========================
  //   主流程：各群組 / 子表
  // =========================
  this.tltGroups.forEach((group: any, gIdx: number) => {
    if (gIdx > 0) currentY += 10;

    group.subTables.forEach((sub: any, si: number) => {
      if (si === 0) drawFullGroupHeader(group, sub);
      else drawCenteredTltIdBanner(sub.tltId);

      // 欄位
      const tableColumns = this.selectedColumns.map((col: any) => ({ header: col.header, dataKey: col.field }));

      // 明細
      const bodyRows: any[] = sub.rows.map((row: any, rowIndex: number) => {
        const obj: any = {};
        this.selectedColumns.forEach((col: any) => {
          obj[col.field] = col.field === '__index'
            ? rowIndex + 1
            : (typeof col.format === 'function' ? col.format(row[col.field]) : row[col.field]);
        });
        return obj;
      });

      // 小計
      const subtotalRow: any = {};
      this.selectedColumns.forEach((col: any) => {
        if (col.field === '__index') subtotalRow[col.field] = '小計';
        else if (this.subtotalFields.includes(col.field)) {
          subtotalRow[col.field] = this.moneyFormat(sub.subtotal[col.field] ?? 0);
        } else subtotalRow[col.field] = '';
      });
      (subtotalRow as any).__type = 'subtotal';
      bodyRows.push(subtotalRow);

      // 總計（最後一張子表）
      const isLastSub = si === group.subTables.length - 1;
      if (isLastSub) {
        const totalRow: any = {};
        this.selectedColumns.forEach((col: any) => {
          if (col.field === '__index') totalRow[col.field] = '總計';
          else if (this.subtotalFields.includes(col.field)) {
            totalRow[col.field] = this.moneyFormat(group.grandAll[col.field] ?? 0);
          } else totalRow[col.field] = '';
        });
        (totalRow as any).__type = 'total';
        bodyRows.push(totalRow);
      }

      // 表格
      autoTable(doc, {
        startY: currentY,
        columns: tableColumns,
        body: bodyRows,
        pageBreak: 'auto',
        styles: {
          font: 'Noto Sans TC',
          fontStyle: 'normal',
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
        margin: { left: marginLeft, right: marginLeft },

        didParseCell: (data) => {
          const raw: any = data?.row?.raw || {};
          data.cell.styles.font = 'Noto Sans TC';
          data.cell.styles.fontStyle = 'normal';

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
          const rightX = pageWidth - marginLeft;
          const pageNo = (doc as any).internal?.getCurrentPageInfo?.().pageNumber ?? hookData?.pageNumber ?? 1;
          doc.setFont('Noto Sans TC', 'normal');
          doc.setFontSize(9);
          doc.text(`頁數：${pageNo}`, rightX, 30, { align: 'right' });
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 24;
    });

    currentY += 8;
  });

  doc.save(`專櫃日對帳單_${new Date().toISOString()}.pdf`);
}

// =========================
//        匯出 Excel
// =========================

exportExcel(): void {
  import('xlsx').then((xlsx) => {
    const wb = xlsx.utils.book_new();

    const chunk3 = (arr: string[]) => {
      const out: any[] = [];
      for (let i = 0; i < arr.length; i += 3) {
        out.push([arr[i] ?? '', arr[i + 1] ?? '', arr[i + 2] ?? '']);
      }
      return out;
    };

    this.tltGroups.forEach((group: any) => {
      const aoa: any[][] = [];
      let maxTableCols = 3;

      group.subTables.forEach((sub: any, si: number) => {
        const firstRow = sub?.rows?.[0] ?? {};
        const totalCount = Number(firstRow?.total_count ?? 0);
        const returnQty  = Number(firstRow?.return_qty ?? 0);
        const returnAmt  = Number(firstRow?.return_amt ?? 0);

        if (si === 0) {
          aoa.push(['南紡流通事業股份有限公司', '專櫃日對帳單', '']);

          const infoItems: string[] = [
            this.showBusType
              ? `大分類：${`${group.header.busType ?? ''}/${group.header.busTypeName ?? ''}`.replace(/\/$/, '')}`
              : '大分類：',
            `銷售日期：${this.formatDate(group.header.txnDate || '')}`,
            `製表日期：${this.printedAt}`,

            `專櫃：${group.header.tltNo} / ${group.header.tltName}`,
            `樓層：${group.header.floor || '－'}  抽成類別：${sub.tltId || '無'}`,
            `交易總件數／退貨件數：${totalCount} / ${returnQty}`,

            `區域：${group.header.area || '－'}`,
            '',
            `退貨金額：${this.moneyFormat(returnAmt)}`,
          ];
          aoa.push(...chunk3(infoItems));
          aoa.push(['']); // 空白隔行
        } else {
          aoa.push([`抽成類別：${sub.tltId || '無'}`, '', '']);
        }

        const headers = ['序號', ...this.selectedColumns.filter((c: any) => c.field !== '__index').map((c: any) => c.header)];
        aoa.push(headers);
        maxTableCols = Math.max(maxTableCols, headers.length);

        sub.rows.forEach((r: any, idx: number) => {
          const row = [
            idx + 1,
            ...this.selectedColumns
              .filter((c: any) => c.field !== '__index')
              .map((c: any) => (typeof c.format === 'function' ? c.format(r[c.field]) : r[c.field]) ?? ''),
          ];
          aoa.push(row);
        });

        aoa.push([
          '小計',
          ...this.selectedColumns
            .filter((c: any) => c.field !== '__index')
            .map((c: any) => (this.subtotalFields.includes(c.field) ? this.moneyFormat(sub.subtotal[c.field] ?? 0) : '')),
        ]);

        if (si === group.subTables.length - 1) {
          aoa.push([
            '總計',
            ...this.selectedColumns
              .filter((c: any) => c.field !== '__index')
              .map((c: any) => (this.subtotalFields.includes(c.field) ? this.moneyFormat(group.grandAll[c.field] ?? 0) : '')),
          ]);
        }

        aoa.push(['']); // 空白隔行
      });

      // ✅ 修正：去掉 origin，aoa_to_sheet 會自動從 A1 開始
      const ws = xlsx.utils.aoa_to_sheet(aoa);

      // （可選）合併 A1:B1
      // ws['!merges'] = ws['!merges'] || [];
      // ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });

      // 欄寬
      ws['!cols'] = Array(Math.max(maxTableCols, 3)).fill({ wch: 20 });

      const safeName = `${group.header.tltNo}`.substring(0, 31).replace(/[\\/?*\[\]]/g, '_');
      xlsx.utils.book_append_sheet(wb, ws, safeName || '報表');
    });

    const fileName = `專櫃日對帳單_${new Date().toISOString()}.xlsx`;
    xlsx.writeFile(wb, fileName);
  });
}


}