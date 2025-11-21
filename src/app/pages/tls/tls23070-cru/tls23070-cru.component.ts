import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { PdfService } from '../../../service/basic/pdf.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';

@Component({
  selector: 'app-tls23070-cru',
  templateUrl: './tls23070-cru.component.html',
  styleUrls: ['./tls23070-cru.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ReportTableGroupComponent]
})
export class TLS23070CRUComponent extends BasicCruPageComponent<any> {
  data: any[] = [];
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  pageSize: number = 1000;
  pdfSummary: string[] = [];
  queryFormValue: any;
  OrganizationCodeOptions: any[] = [];

  dataForm = this.formBuilder.nonNullable.group({});

  constructor(
    private location: Location,
    private pdfService: PdfService,
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



    this.initializePage('TLS23070', this.dataForm);
  }

  get columns() {
    const fixedCols = [
      { field: 'tlt_no', header: '專櫃編號', visible: true },
      { field: 'tlt_name', header: '櫃位名稱', visible: true },
      {
        field: 'TXN_Date',
        header: '銷售日期',
        visible: true,
        format: (val: string) => {
          const date = new Date(val);
          return isNaN(date.getTime()) ? val : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        }
      },
      { field: 'ECR_No', header: '收銀機號', visible: true }
    ];

    const dynamicCols = [
      'TXN_TotPayAmt', 'TXN_PayAmt10', 'TXN_PayAmt41', 'TXN_PayAmt42', 'TXN_PayAmt12',
      'TXN_PayAmt81', 'TXN_PayAmt43', 'TXN_PayAmt44', 'TXN_PayAmt14', 'TXN_PayAmt82',
      'TXN_PayAmt52', 'TXN_PayAmt20', 'TXN_PayAmt62', 'TXN_PayAmt77', 'TXN_PayAmt71',
      'TXN_PayAmt30', 'TXN_PayAmt73', 'TXN_PayAmt72', 'TXN_PayAmt74', 'TXN_PayAmt75',
      'TXN_PayAmt76', 'TXN_PayAmt24', 'TXN_PayAmt25', 'TXN_PayAmt07', 'TXN_PayAmt55',
      'TXN_PayAmt83', 'TXN_PayAmt78', 'TXN_PayAmt79', 'TXN_PayAmt21', 'TXN_PayAmt53',
      'TXN_PayAmt56', 'TXN_PayAmt57', 'TXN_PayAmt58', 'TXN_PayAmt59', 'TXN_PayAmt60',
      'TXN_PayAmt22', 'TXN_PayAmt23', 'PreSale_Received', 'PreSale_Checkout',
      'TXN_OverAmt', 'TXN_ReturnAmt', 'TXN_ExchangeAmt', 'TXN_CancelAmt', 'TXN_AgentAmt'
    ];

    return [
      ...fixedCols,
      ...dynamicCols.map(field => ({
        field,
        header: '請呼叫API不要寫死',
        visible: true,
        style: 'text-right',
        format: this.moneyFormat.bind(this)
      }))
    ];
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
    const columns = this.columns;

    this.pdfService.exportReportPDF({
      orientation: 'l',
      title: '專櫃收銀機月報表',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns,
      data: this.data,
      subtotalFields: columns.map(c => c.field).filter(f => f.startsWith('TXN_') || f.startsWith('PreSale_')),
      summaryText: [],
      mergeTotalCols: 3
    });
  }

  exportSummaryExcel(): void {
    import('xlsx').then(xlsx => {
      const exportData = this.data.map((row: any) => {
        const obj: { [key: string]: any } = {};
        this.columns.forEach((col: any) => {
          obj[col.header] =
            typeof col.format === 'function'
              ? col.format(row[col.field as string])
              : row[col.field as string];
        });
        return obj;
      });

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '專櫃收銀機月報表');
      xlsx.writeFile(wb, `專櫃收銀機月報表_${new Date().toISOString()}.xlsx`);
    });
  }
}
