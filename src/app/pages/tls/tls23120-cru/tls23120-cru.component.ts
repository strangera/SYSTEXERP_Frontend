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
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';

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
    { field: 'return_qty', header: '退貨件數', visible: true },
    { field: 'return_amt', header: '退貨金額', visible: true, style: 'text-right', format: (v: any) => this.moneyFormat(v) },
    { field: 'total_count', header: '總交易筆數', visible: true },
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
          txnDate: first?.TXN_DATE ?? '',
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
  //        匯出 PDF（抬頭順序同步 HTML）
  // =========================
  exportPDF(orientation: 'p' | 'l' = 'l'): void {
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

    let currentY = 60;

    /** 第一張表的完整群組抬頭（順序：專櫃 → 區域 → 樓層＋抽成 → 交易總件數/退貨件數 → 退貨金額） */
    const drawFullGroupHeader = (g: TltGroup, firstSub: SubTable) => {
      const firstRow = firstSub?.rows?.[0] ?? {};
      const totalCount = Number(firstRow?.total_count ?? 0);
      const returnQty  = Number(firstRow?.return_qty ?? 0);
      const returnAmt  = Number(firstRow?.return_amt ?? 0);

      const leftX = marginLeft;
      const midX = leftX + 240;
      const rightX = pageWidth - marginLeft;
      const lineGap = 18;

      const needed = 140;
      const pageHeight = doc.internal.pageSize.getHeight();
      if (pageHeight - currentY < needed) {
        doc.addPage();
        currentY = 60;
      }

      doc.setFontSize(16);
      doc.text('南紡流通事業股份有限公司', pageWidth / 2, currentY, { align: 'center' });
      currentY += 25;

      doc.setFontSize(14);
      doc.text('專櫃日對帳單', pageWidth / 2, currentY, { align: 'center' });
      currentY += 25;

      doc.setFontSize(10);
      if (this.showBusType) {
        doc.text(`大分類：${(g.header.busType ?? '')}/${(g.header.busTypeName ?? '')}`.replace(/\/$/, ''), leftX, currentY);
      }
      doc.text(`銷售日期：${this.formatDate(g.header.txnDate || '')}`, midX, currentY);
      doc.text(`製表日期：${this.printedAt}`, rightX, currentY, { align: 'right' });
      currentY += lineGap;

      // 專櫃
      doc.text(`專櫃：${g.header.tltNo} / ${g.header.tltName}`, leftX, currentY);
      currentY += lineGap;

      // 區域（搬到專櫃下面）
      doc.text(`區域：${g.header.area ?? '－'}`, leftX, currentY);
      currentY += lineGap;

      // 樓層 + 抽成類別
      doc.text(`樓層：${g.header.floor ?? '－'}  抽成類別：${firstSub?.tltId || '無'}`, leftX, currentY);
      currentY += lineGap;

      // 交易總件數／退貨件數
      doc.text(`交易總件數：${totalCount} / 退貨件數：${returnQty}`, leftX, currentY);
      currentY += lineGap;

      // 退貨金額
      doc.text(`退貨金額：${this.moneyFormat(returnAmt)}`, leftX, currentY);
      currentY += 10;
    };

    /** 後續表僅顯示置中的抽成類別橫幅 */
    const drawCenteredTltIdBanner = (tltId: string) => {
      const pageHeight = doc.internal.pageSize.getHeight();
      if (pageHeight - currentY < 40) {
        doc.addPage();
        currentY = 60;
      }
      doc.setFontSize(12);
      doc.text(`抽成類別：${tltId || '無'}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 14;
    };

    this.tltGroups.forEach((group, gIdx) => {
      if (gIdx > 0) currentY += 10;

      group.subTables.forEach((sub, si) => {
        // 標題區：第一張表完整抬頭，後續只顯示抽成類別
        if (si === 0) {
          drawFullGroupHeader(group, sub);
        } else {
          drawCenteredTltIdBanner(sub.tltId);
        }

        // 準備資料
        const tableColumns = this.selectedColumns.map(col => ({ header: col.header, dataKey: col.field }));
        const bodyRows: any[] = sub.rows.map((row, rowIndex) => {
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

        // 小計
        const subtotalRow: any = {};
        this.selectedColumns.forEach(col => {
          if (col.field === '__index') subtotalRow[col.field] = '小計';
          else if (this.subtotalFields.includes(col.field)) {
            subtotalRow[col.field] = this.moneyFormat(sub.subtotal[col.field] ?? 0);
          } else subtotalRow[col.field] = '';
        });
        (subtotalRow as any).__type = 'subtotal';
        bodyRows.push(subtotalRow);

        // 此 TLT_NO 的最後一張表 → 總計
        const isLastSub = si === group.subTables.length - 1;
        if (isLastSub) {
          const totalRow: any = {};
          this.selectedColumns.forEach(col => {
            if (col.field === '__index') totalRow[col.field] = '總計';
            else if (this.subtotalFields.includes(col.field)) {
              totalRow[col.field] = this.moneyFormat(group.grandAll[col.field] ?? 0);
            } else totalRow[col.field] = '';
          });
          (totalRow as any).__type = 'total';
          bodyRows.push(totalRow);
        }

        autoTable(doc, {
          startY: currentY,
          columns: tableColumns,
          body: bodyRows,
          pageBreak: 'auto',
          styles: { fontSize: 9, halign: 'center', valign: 'middle', textColor: [0, 0, 0] },
          headStyles: { fontSize: 10, fillColor: HEADER_COLOR, textColor: [0, 0, 0], halign: 'center' },
          theme: 'grid',
          margin: { left: marginLeft, right: marginLeft },
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
            const rightX = pageWidth - marginLeft;
            const pageNo = (doc as any).internal?.getCurrentPageInfo?.().pageNumber ?? hookData?.pageNumber ?? 1;
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
  //        匯出 Excel（抬頭順序同步 HTML）
  // =========================
  exportExcel(): void {
    import('xlsx').then((xlsx) => {
      const wb = xlsx.utils.book_new();

      this.tltGroups.forEach((group) => {
        const rows: any[] = [];

        group.subTables.forEach((sub, si) => {
          const firstRow = sub?.rows?.[0] ?? {};
          const totalCount = Number(firstRow?.total_count ?? 0);
          const returnQty  = Number(firstRow?.return_qty ?? 0);
          const returnAmt  = Number(firstRow?.return_amt ?? 0);

          if (si === 0) {
            // 第一張表：完整資訊（同步 HTML/PDF 的順序）
            rows.push({ '公司': '南紡流通事業股份有限公司', '標題': '專櫃日對帳單' });
            rows.push({
              '大分類': this.showBusType ? `${group.header.busType ?? ''}/${group.header.busTypeName ?? ''}`.replace(/\/$/, '') : '',
              '銷售日期': this.formatDate(group.header.txnDate || ''),
              '製表日期': this.printedAt,
            });
            rows.push({ '專櫃': `${group.header.tltNo} / ${group.header.tltName}` });
            rows.push({ '區域': group.header.area ?? '' });
            rows.push({ '樓層＋抽成類別': `${group.header.floor ?? '－'} / 抽成類別：${sub.tltId || '無'}` });
            rows.push({ '交易總件數／退貨件數': `${totalCount} / ${returnQty}` });
            rows.push({ '退貨金額': this.moneyFormat(returnAmt) });
            rows.push({});
          } else {
            // 後續表：只顯示置中的抽成類別
            rows.push({ '__title__': `抽成類別：${sub.tltId || '無'}` });
          }

          // 明細
          sub.rows.forEach((r: any, idx: number) => {
            const o: Record<string, any> = {};
            o['序號'] = idx + 1;
            this.columns.forEach((col) => {
              const val = typeof col.format === 'function' ? col.format(r[col.field]) : r[col.field];
              o[col.header] = val;
            });
            rows.push(o);
          });

          // 小計
          const subLine: Record<string, any> = { '序號': '小計' };
          this.columns.forEach((col) => {
            if (this.subtotalFields.includes(col.field)) {
              subLine[col.header] = this.moneyFormat(sub.subtotal[col.field] ?? 0);
            } else {
              subLine[col.header] = '';
            }
          });
          rows.push(subLine);

          // 最後一張子表 → 總計
          const isLastSub = si === group.subTables.length - 1;
          if (isLastSub) {
            const totLine: Record<string, any> = { '序號': '總計' };
            this.columns.forEach((col) => {
              if (this.subtotalFields.includes(col.field)) {
                totLine[col.header] = this.moneyFormat(group.grandAll[col.field] ?? 0);
              } else {
                totLine[col.header] = '';
              }
            });
            rows.push(totLine);
          }

          rows.push({});
        });

        const ws = xlsx.utils.json_to_sheet(rows, { skipHeader: true });
        const safeName = `${group.header.tltNo}`.substring(0, 31).replace(/[\\/?*\[\]]/g, '_');
        xlsx.utils.book_append_sheet(wb, ws, safeName || '報表');
      });

      xlsx.writeFile(wb, `專櫃日對帳單_${new Date().toISOString()}.xlsx`);
    });
  }
}
