import { Component } from '@angular/core';
import { Location, formatDate } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';
import { jsPDF } from 'jspdf';


@Component({
  selector: 'app-tls23120-cru',
  templateUrl: './tls23120-cru.component.html',
  styleUrls: ['./tls23120-cru.component.scss']
})
export class TLS23120CRUComponent extends BasicCruPageComponent<any> {
  // 原始欄位與資料
  data: any[] = [];
  
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  queryFormValue: any;
  groupByField = 'TLT_NO'; // ✅ 群組欄位：專櫃代號（或根據實際欄位）
groupByLabel = '專櫃';

  reportTitle: string = '區分銷售月報表';
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
    'sad_settle_amt'
  ];

  selectedColumns: any[] = [];
  availableColumns: any[] = [];
  tempSelectedColumns: any[] = [];

  groupedData: any[][] = [];

  OrganizationCodeOptions: any[] = [];

  dataForm = this.formBuilder.nonNullable.group({});

  constructor(
    private location: Location,
    private pdfService: PdfService,
    private tls11010Service: Tls11010Service,
    private columnLabelService: ColumnLabelService
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    const state = history.state;
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

    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res || []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value
      }));
    });

    this.columns = [
      { field: 'SYS_Name', header: '區分', visible: true },
      { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
      { field: 'sad_sale_namt', header: '淨銷貨', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_sale_tax', header: '營業稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_sale_amt', header: '銷貨金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
      { field: 'sad_preorder_amt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
      { field: 'sad_settle_amt', header: '結帳金額', visible: true, style: 'text-right', format: this.moneyFormat }
    ];

    this.availableColumns = [...this.columns];
    this.buildSelectedColumns();
    this.splitData();

    this.initializePage('TLS23120', this.dataForm);
  }
  columns = [
      { field: 'SYS_Name', header: '區分', visible: true },
      { field: 'sad_sale_qty', header: '銷貨筆數', visible: true },
      { field: 'sad_sale_namt', header: '淨銷貨', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_sale_tax', header: '營業稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_sale_amt', header: '銷貨金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_preorder_qty', header: '預售筆數', visible: true },
      { field: 'sad_preorder_amt', header: '預售金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'sad_settle_qty', header: '結帳筆數', visible: true },
      { field: 'sad_settle_amt', header: '結帳金額', visible: true, style: 'text-right', format: this.moneyFormat }
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
    return groupIndex * this.rowsPerTable + rowIndex + 1;
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
    window.print();
  }
  splitData(): void {
  if (this.groupByField) {
    const groupedMap = new Map<string, any[]>();

    this.data.forEach(item => {
      const key = item[this.groupByField] ?? '未分類';
      if (!groupedMap.has(key)) {
        groupedMap.set(key, []);
      }
      // 保留原始資料並加入 __groupKey
      groupedMap.get(key)!.push({ ...item, __groupKey: key });
    });

    this.groupedData = Array.from(groupedMap.values());
  } else {
    // 不分群組時的預設切表邏輯
    const total = this.data?.length || 0;
    const groupCount = Math.ceil(total / this.rowsPerTable);
    this.groupedData = Array.from({ length: groupCount }, (_, i) =>
      this.data.slice(i * this.rowsPerTable, (i + 1) * this.rowsPerTable)
    );
  }
}

  goBack(): void {
    this.location.back();
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
        `${this.dateRangeLabel}：${this.formatDate(this.dateStart)} ~ ${this.formatDate(this.dateEnd)}`,
        marginLeft,
        currentY
      );
      doc.text(`列印時間：${this.printedAt}`, pageWidth - marginLeft, currentY, { align: 'right' });
      currentY += 10;
  

  
      doc.save(`報表_${new Date().toISOString()}.pdf`);
      
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
    import('xlsx').then(xlsx => {
      const ws = xlsx.utils.json_to_sheet(this.data.map(row => {
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

  exportSummaryPDF(): void {
    this.pdfService.exportReportPDF({
      orientation: 'l',
      title: '區分銷售月報表',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns: this.columns,
      data: this.data,
      subtotalFields: this.subtotalFields,
      summaryText: [],
      mergeTotalCols: 1
    });
  }

  exportSummaryExcel(): void {
    import('xlsx').then(xlsx => {
      const exportData = this.data.map((row: any) => {
        const obj: { [key: string]: any } = {};
        this.columns.forEach((col: any) => {
          obj[col.header] = typeof col.format === 'function' ? col.format(row[col.field]) : row[col.field];
        });
        return obj;
      });

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '區分銷售月報表');
      xlsx.writeFile(wb, `區分銷售月報表_${new Date().toISOString()}.xlsx`);
    });
  }
  
}
