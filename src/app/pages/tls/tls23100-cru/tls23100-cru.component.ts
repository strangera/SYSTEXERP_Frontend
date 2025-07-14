import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';

@Component({
  selector: 'app-tls23100-cru',
  templateUrl: './tls23100-cru.component.html',
  styleUrls: ['./tls23100-cru.component.scss']
})
export class TLS23100CRUComponent extends BasicCruPageComponent<any> {
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
    { field: 'ECR_No', header: '收銀機代號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true, style: 'text-left' },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'PAY_NO', header: '付款別', visible: true},
    { field: 'PAY_NAME', header: '付款名稱', visible: true},
    { field: 'CRD_Type', header: '信用卡卡別', visible: true },
    { field: 'CRD_Name', header: '信用卡', visible: true },
    { field: 'CRD_No', header: '信用卡卡號', visible: true },
    { field: 'TXN_PayAmt', header: '金額', visible: true, style: 'text-right', format: (val: number) => val?.toLocaleString('en-US') || '0' },
  ];


    this.initializePage('TLS23100', this.dataForm);
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
      title: '付款別明細表',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns: this.columns,
      data: this.data,
      subtotalFields: ['amount'],
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
              ? col.format(row[col.field])
              : row[col.field];
        });
        return obj;
      });

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '付款別明細表');
      xlsx.writeFile(wb, `付款別明細表_${new Date().toISOString()}.xlsx`);
    });
  }
}
