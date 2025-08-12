import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';

@Component({
  selector: 'app-tls23110-cru',
  templateUrl: './tls23110-cru.component.html',
  styleUrls: ['./tls23110-cru.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ReportTableGroupComponent]
})
export class TLS23110CRUComponent extends BasicCruPageComponent<any> {
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


    this.columns = [
      { field: 'Day', header: '日期', visible: true },
      { field: 'OriginalPrice_TXN_SaleNoTax', header: '正品-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'OriginalPrice_TXN_Tax', header: '正品-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'OriginalPrice_Total', header: '正品-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'Discount90_TXN_SaleNoTax', header: '9折-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount90_TXN_Tax', header: '9折-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount90_Total', header: '9折-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'Discount80_TXN_SaleNoTax', header: '8折-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount80_TXN_Tax', header: '8折-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Discount80_Total', header: '8折-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'SpecialPrice_TXN_SaleNoTax', header: '特價-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'SpecialPrice_TXN_Tax', header: '特價-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'SpecialPrice_Total', header: '特價-合計', visible: true, style: 'text-right', format: this.moneyFormat },

      { field: 'Total_TXN_SaleNoTax', header: '總計-未稅', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Total_TXN_Tax', header: '總計-稅額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'Total_Total', header: '總計-合計', visible: true, style: 'text-right', format: this.moneyFormat },
    ];

    this.initializePage('TLS23110', this.dataForm);
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

goBack(): void {
  this.messageService.unblockUi(); // ✅ 明確解除
  this.location.back();
}
  printPage(): void {
    window.print();
  }

  exportSummaryPDF(): void {
    this.pdfService.exportReportPDF({
      orientation: 'l',
      title: '各日各折扣明細報表',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns: this.columns,
      data: this.data,
      subtotalFields: [],
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
      xlsx.utils.book_append_sheet(wb, ws, '折扣別月報表');
      xlsx.writeFile(wb, `折扣別月報表_${new Date().toISOString()}.xlsx`);
    });
  }
}
