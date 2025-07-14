import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';

@Component({
  selector: 'app-tls23120-cru',
  templateUrl: './tls23120-cru.component.html',
  styleUrls: ['./tls23120-cru.component.scss']
})
export class TLS23120CRUComponent extends BasicCruPageComponent<any> {
  data: any[] = [];
  columns: any[] = [];
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  pageSize: number = 1000;
  queryFormValue: any;
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
    console.log('✅ Router 傳入的 state:', state);

    if (state?.data) {
      this.data = state.data;
      this.queryFormValue = state.queryFormValue;
      this.dateStart = state.queryFormValue?.TXN_DateStart || '';
      this.dateEnd = state.queryFormValue?.TXN_DateEnd || '';
      this.pageSize = state.pageSize || 1000;
      this.printedAt = new Date().toLocaleString('zh-TW');
    } else {
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

    this.initializePage('TLS23120', this.dataForm);
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  goBack(): void {
    this.location.back();
  }

  printPage(): void {
    window.print();
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
      subtotalFields: [
        'transactionCount',
        'netSales',
        'businessTax',
        'transactionAmount',
        'preSaleCount',
        'preSaleAmount',
        'settleCount',
        'settleAmount'
      ],
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
