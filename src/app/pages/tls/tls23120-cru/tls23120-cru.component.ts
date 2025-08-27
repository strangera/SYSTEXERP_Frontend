import { Component } from '@angular/core';
import {
  Location,
  formatDate,
  NgFor,
  NgIf,
  NgClass,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
  DatePipe,
} from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
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
    showBusType: true, // 預設為顯示
  });

  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  queryFormValue: any;
  groupByField = 'TLT_NO'; // ✅ 群組欄位：專櫃代號（或根據實際欄位）
  groupByLabel = '專櫃';
  groupedData: GroupedDataItem[] = [];
  reportTitle: string = '專櫃日對帳單';
  dateRangeLabel: string = '日期區間'; // 新增屬性，請根據實際需求修改標籤

  // 顯示控制
  pageSize: number = 1000;
  showGroupedBody: boolean = true;
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

  OrganizationCodeOptions: any[] = [];

  constructor(
    private location: Location,
    private pdfService: PdfService,
    private columnLabelService: ColumnLabelService,
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    const state = history.state;
    const showBusTypeValue = state.queryFormValue?.ShowBusType ?? true;
    this.dataForm.get('showBusType')?.setValue(showBusTypeValue);
    console.log('history.state:', state);
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
      console.warn('🚨 state.data 無效，無法顯示報表');
      this.messageService.warnBubble('⚠️ 無資料可顯示，請重新查詢。');
    }

    this.columns = [
      { field: 'SYS_Name', header: '區分', visible: true },
      { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
      {
        field: 'sad_sale_namt',
        header: '淨銷貨',
        visible: true,
        style: 'text-right',
        format: this.moneyFormat,
      },
      {
        field: 'sad_sale_tax',
        header: '營業稅',
        visible: true,
        style: 'text-right',
        format: this.moneyFormat,
      },
      {
        field: 'sad_sale_amt',
        header: '銷貨金額',
        visible: true,
        style: 'text-right',
        format: this.moneyFormat,
      },
      { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
      {
        field: 'sad_preorder_amt',
        header: '預售金額',
        visible: true,
        style: 'text-right',
        format: this.moneyFormat,
      },
      { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
      {
        field: 'sad_settle_amt',
        header: '結帳金額',
        visible: true,
        style: 'text-right',
        format: this.moneyFormat,
      },
    ];

    this.availableColumns = [...this.columns];
    this.buildSelectedColumns();
    this.splitData();

    this.initializePage('TLS23120', this.dataForm);
  }
  columns = [
    { field: 'SYS_Name', header: '區分', visible: true },
    { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
    {
      field: 'sad_sale_namt',
      header: '淨銷貨',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'sad_sale_tax',
      header: '營業稅',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    {
      field: 'sad_sale_amt',
      header: '銷貨金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
    {
      field: 'sad_preorder_amt',
      header: '預售金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
    { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
    {
      field: 'sad_settle_amt',
      header: '結帳金額',
      visible: true,
      style: 'text-right',
      format: this.moneyFormat,
    },
  ];
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

  getRowIndex(groupIndex: number, rowIndex: number): number {
    return rowIndex + 1; // 不使用 groupIndex，直接從 1 開始
  }

  getSubtotal(group: any[], field: string): string {
    const sum = group.reduce((acc, row) => {
      const value = row[field];
      const numeric = +String(value).replace(/,/g, '');
      return acc + (isNaN(numeric) ? 0 : numeric);
    }, 0);
    return sum.toLocaleString();
  }

  moneyFormat(value: any): string {
    return typeof value === 'number' ? value.toLocaleString('en-US') : '0';
  }

  printPage(): void {
    const printContents = document.getElementById('print-section')?.innerHTML;
    if (!printContents) {
      console.warn('⚠️ 找不到要列印的區塊');
      return;
    }

    const popupWin = window.open(
      '',
      '_blank',
      'top=0,left=0,height=100%,width=auto',
    );
    if (!popupWin) return;

    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
        <title>列印報表</title>
        <style>
          body { font-family: 'Noto Sans TC', sans-serif; padding: 20px; }
          table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
          }
          th, td {
            padding: 4px;
            text-align: center;
          }
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

      if (!groupedMap.has(tltKey)) {
        groupedMap.set(tltKey, new Map());
      }
      const subGroup = groupedMap.get(tltKey)!;
      if (!subGroup.has(talentKey)) {
        subGroup.set(talentKey, []);
      }
      subGroup.get(talentKey)!.push(item);
    });

    this.groupedData = [];

    groupedMap.forEach((talentMap, tltKey) => {
      const allRows: any[] = [];
      talentMap.forEach((rows) => {
        allRows.push(...rows);
      });

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
  }

  goBack(): void {
    this.location.back();
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 40;

    // 字型
    doc.addFont(
      'assets/fonts/NotoSansTC-VariableFont_wght.ttf',
      'Noto Sans TC',
      'normal',
    );
    doc.setFont('Noto Sans TC');

    // 取表頭用的資料（從第一筆 or query 狀態）
    const info = this.getHeaderInfo();

    // 讓每頁都畫相同表頭 + 頁碼
    let pageNo = 0;
    const drawHeader = () => {
      pageNo += 1;
      this.drawReportHeader(doc, info, marginLeft, pageWidth, pageNo);
    };

    let currentY = 180; // 保留給表頭的高度
    drawHeader();
    currentY = 180; // 表頭大概佔到這個高度，下面開始畫表格

    this.groupedData.forEach((group) => {
      // 欄位定義
      const tableColumns = this.selectedColumns.map((col) => ({
        header: col.header,
        dataKey: col.field,
      }));

      // 資料列
      const tableData = group.rows.map((row, rowIndex) => {
        const obj: any = {};
        this.selectedColumns.forEach((col) => {
          obj[col.field] =
            col.field === '__index'
              ? rowIndex + 1
              : col.format
                ? col.format(row[col.field])
                : row[col.field];
        });
        return obj;
      });

      // 小計
      if (group.showSubtotal) {
        const subtotalRow: any = {};
        this.selectedColumns.forEach((col) => {
          if (col.field === '__index') subtotalRow[col.field] = '小計';
          else if (this.subtotalFields.includes(col.field))
            subtotalRow[col.field] = this.getSubtotal(group.rows, col.field);
          else subtotalRow[col.field] = '';
        });
        tableData.push(subtotalRow);
      }

      // 總計
      if (group.showTotal) {
        const totalRow: any = {};
        this.selectedColumns.forEach((col) => {
          if (col.field === '__index') totalRow[col.field] = '總計';
          else if (this.subtotalFields.includes(col.field))
            totalRow[col.field] = this.getSubtotal(group.rows, col.field);
          else totalRow[col.field] = '';
        });
        tableData.push(totalRow);
      }

      autoTable(doc, {
        startY: currentY,
        head: [tableColumns.map((c) => c.header)],
        body: tableData.map((r) => tableColumns.map((c) => r[c.dataKey] ?? '')),
        styles: {
          font: 'Noto Sans TC',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
        },
        headStyles: {
          font: 'Noto Sans TC',
          fontStyle: 'normal',
          fontSize: 10,
          fillColor: [212, 222, 254],
          textColor: [0, 0, 0],
          
          halign: 'center',
        },
        footStyles: {
          font: 'Noto Sans TC',
          fontStyle: 'normal',
          fontSize: 10,
          fillColor: [212, 222, 254],
          textColor: [0, 0, 0],
          halign: 'center',
        },
        theme: 'grid',
        margin: { left: marginLeft, right: marginLeft, top: 180 }, // 頂部留給表頭
        didDrawCell: (data) => {
          const rowIndex = data.row.index;
          const isSubtotal =
            group.showSubtotal && rowIndex === group.rows.length;
          const isTotal =
            group.showTotal &&
            (group.showSubtotal
              ? rowIndex === group.rows.length + 1
              : rowIndex === group.rows.length);
          if (isSubtotal) {
            data.cell.styles.fillColor = [255, 245, 204];
            data.cell.styles.fontStyle = 'bold';
          }
          if (isTotal) {
            data.cell.styles.fillColor = [204, 229, 255];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        didDrawPage: () => {
          drawHeader(); // 每頁重畫表頭
        },
      });

      // 下一段表格的起點
      currentY = (doc as any).lastAutoTable.finalY + 30;
    });

    doc.save(`專櫃日對帳單_${new Date().toISOString()}.pdf`);
  }

  /** 依「圖一」準備表頭資料 */
  private getHeaderInfo() {
    const first = this.data?.[0] ?? {};
    const salesDate =
      this.queryFormValue?.TXN_DateStart || first?.TXN_DATE || this.dateStart;
    const biz =
      `${first?.bus_type ?? ''}/${first?.bus_type_name ?? ''}`.replace(
        /^\/$/,
        '',
      );
    const counter = `${first?.TLT_NO ?? ''}/${first?.TLT_NAME ?? ''}`.replace(
      /^\/$/,
      '',
    );
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

  /** 依「圖一」畫表頭（公司/標題置中 + 左右資訊列） */
  /** 依註解排版的表頭：三欄(左/中/右)，右側為「製表日期 + 頁數」 */
  private drawReportHeader(
    doc: jsPDF,
    info: any,
    marginLeft: number,
    pageWidth: number,
    pageNo?: number, // 目前頁數（可只顯示單一頁碼）
  ) {
    const leftX = marginLeft; // 左欄
    const midX = leftX + 240; // 左中欄（第二欄，依需要可調）
    const rightX = pageWidth - marginLeft; // 右欄（靠右對齊）
    const lineGap = 18;

    // 公司、標題置中
    doc.setFontSize(16);
    doc.text(info.company || '', pageWidth / 2, 50, { align: 'center' });
    doc.setFontSize(14);
    doc.text(info.title || '', pageWidth / 2, 75, { align: 'center' });

    doc.setFontSize(10);
    let y = 110;

    // ── 第 1 列 ───────────────────────────────────────────────
    // 第 1 列 第 1 行
    doc.text(`業種：${info.biz || '－'}`, leftX, y);
    // 第 1 列 第 2 行
    doc.text(`銷售日期：${info.salesDate || '－'} `, midX, y);
    // 第 1 列 第 3 行（右側）：製表日期 + 頁數
    const pageLabel = typeof pageNo === 'number' ? `   頁數：${pageNo}` : '';
    doc.text(`製表日期：${info.madeAt}${pageLabel}`, rightX, y, {
      align: 'right',
    });
    y += lineGap;

    // ── 第 2 列 ───────────────────────────────────────────────
    // 第 2 列 第 1 行
    doc.text(`專櫃：${info.counter || '－'}`, leftX, y);
    // 第 2 列 第 2 行
    doc.text(
      `樓層：${info.floor || '－'}  抽成類別：${info.cutType} `,
      midX,
      y,
    );
    // 第 2 列 第 3 行（右側）：抽成類別 + 交易總件數/退貨件數（同一行）
    doc.text(
      `  交易總件數：${info.totalTxns} / 退貨件數：${info.returnQty}`,
      rightX,
      y,
      { align: 'right' },
    );
    y += lineGap;

    // ── 第 3 列 ───────────────────────────────────────────────
    // 第 3 列 第 1 行
    doc.text(`區域：${info.area || '－'}`, leftX, y);
    // 第 3 列 第 3 行（右側）
    doc.text(`退貨金額：${info.returnAmt}`, rightX, y, { align: 'right' });

    // 如果你想保留「第 4 列」空行以拉開表頭與表格距離，可再加：
    // y += lineGap;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  exportExcel(): void {
    import('xlsx').then((xlsx) => {
      const ws = xlsx.utils.json_to_sheet(
        this.data.map((row) => {
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

  exportSummaryExcel(): void {
    import('xlsx').then((xlsx) => {
      const exportData = this.data.map((row: any) => {
        const obj: { [key: string]: any } = {};
        this.columns.forEach((col: any) => {
          obj[col.header] =
            typeof col.format === 'function'
              ? col.format(row[col.field])
              : row[col.field];
        });
        return obj;
      });

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '專櫃日對帳單');
      xlsx.writeFile(wb, `專櫃日對帳單${new Date().toISOString()}.xlsx`);
    });
  }
  get showBusType(): boolean {
    return this.dataForm.get('showBusType')?.value ?? true;
  }
}
