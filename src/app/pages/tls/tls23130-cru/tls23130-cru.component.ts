import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';

@Component({
  selector: 'app-tls23130-cru',
  templateUrl: './tls23130-cru.component.html',
  styleUrls: ['./tls23130-cru.component.scss']
})
export class TLS23130CRUComponent extends BasicCruPageComponent<any> {
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
      this.dateStart = state.queryFormValue?.saleDateStart || '';
      this.dateEnd = state.queryFormValue?.saleDateEnd || '';
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
      { field: 'cardNumber', header: '卡號', visible: true },
      { field: 'transactionSequence', header: '交易序號', visible: true },
      { field: 'machineNumber', header: '機號/名稱', visible: true },
      { field: 'amount', header: '金額', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'TXN_Date', header: '日期', visible: true },
      { field: 'TXN_GUINo', header: '發票號碼', visible: true },
      { field: 'TXN_Time', header: '交易時間', visible: true },
      { field: 'installmentPeriod', header: '分期數', visible: true },
      { field: 'initialPayment', header: '頭期', visible: true, style: 'text-right', format: this.moneyFormat },
      { field: 'monthlyPayment', header: '每期', visible: true, style: 'text-right', format: this.moneyFormat }
    ];

    this.initializePage('TLS23130', this.dataForm);
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
      title: '信用卡分期資料',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns: this.columns,
      data: this.data,
      subtotalFields: ['amount', 'initialPayment', 'monthlyPayment'],
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
      xlsx.utils.book_append_sheet(wb, ws, '信用卡分期資料');
      xlsx.writeFile(wb, `信用卡分期資料_${new Date().toISOString()}.xlsx`);
    });
  }
}
