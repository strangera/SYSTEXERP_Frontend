import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { ColumnLabelService } from '../../../service/basic/column-label.service';
import { TLS23080SharedService } from '../../../service/api/tls/tls23080-shared.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';

@Component({
    selector: 'app-tls23080-cru',
    templateUrl: './tls23080-cru.component.html',
    styleUrls: ['./tls23080-cru.component.scss'],
    standalone: true,
    imports: [MenubarComponent, ReportTableGroupComponent]
})
export class TLS23080CRUComponent extends BasicCruPageComponent<any> {
   fetchDetailFn = (payload: any) => this.sharedService.fetchDetailFn(payload);
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
    private tls11010Service: Tls11010Service,
    private columnLabelService: ColumnLabelService,
    private sharedService: TLS23080SharedService
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

    this.initializePage('TLS23080', this.dataForm);
  }

  get columns() {
    const fixedCols = [

      {
        field: 'TXN_Date',
        header: '銷售日期',
        visible: true,
        format: (val: string) => {
          const date = new Date(val);
          return isNaN(date.getTime()) ? val : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
        }
      },
      
    ];

    const dynamicCols = [
      'TXN_TotPayAmt', 'TXN_PayAmt10', 'TXN_PayAmt41', 'TXN_PayAmt42', 'TXN_PayAmt12',
      'TXN_PayAmt81', 'TXN_PayAmt43', 'TXN_PayAmt44', 'TXN_PayAmt14', 'TXN_PayAmt82',
      'TXN_PayAmt52', 'TXN_PayAmt20', 'TXN_PayAmt62', 'TXN_PayAmt77', 'TXN_PayAmt71',
      'TXN_PayAmt30', 'TXN_PayAmt73', 'TXN_PayAmt72', 'TXN_PayAmt74', 'TXN_PayAmt75',
      'TXN_PayAmt76', 'TXN_PayAmt24', 'TXN_PayAmt25', 'TXN_PayAmt07', 'TXN_PayAmt55',
      'TXN_PayAmt83', 'TXN_PayAmt78', 'TXN_PayAmt79', 'TXN_PayAmt21', 'TXN_PayAmt53',
      'TXN_PayAmt56', 'TXN_PayAmt57', 'TXN_PayAmt58', 'TXN_PayAmt59', 'TXN_PayAmt60',
      'TXN_PayAmt22', 'TXN_PayAmt23', 'TXN_CancelAmt'
    ];

    return [
      ...fixedCols,
      ...dynamicCols.map(field => ({
        field,
        header: this.columnLabelService.getLabel(field),
        visible: true,
        style: 'text-right',
        format: this.moneyFormat.bind(this)
      }))
    ];
  }
  detailColumns = [
  { field: 'ECR_No', header: '收銀機號' },
  { field: 'tlt_no', header: '專櫃代號' },
  { field: 'tlt_name', header: '專櫃名稱' },
  { field: 'TXN_PayAmt10', header: '現金', style: 'text-right', format: this.moneyFormat },
  { field: 'UnionGeneral', header: '聯合一般', style: 'text-right', format: this.moneyFormat },
  { field: 'UnionAE', header: '聯合AE', style: 'text-right', format: this.moneyFormat },
  { field: 'UnionDiner', header: '聯合Diner', style: 'text-right', format: this.moneyFormat },
  { field: 'CTBCGeneral', header: '中信一般', style: 'text-right', format: this.moneyFormat },
  { field: 'CTBCAE', header: '中信AE', style: 'text-right', format: this.moneyFormat },
  { field: 'CTBCDiner', header: '中信Diner', style: 'text-right', format: this.moneyFormat },
  { field: 'CTBCParkingGeneral', header: '中信停車一般', style: 'text-right', format: this.moneyFormat },
  { field: 'CTBCParkingAE', header: '中信停車AE', style: 'text-right', format: this.moneyFormat },
  { field: 'CTBCParkingDiner', header: '中信停車Diner', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt52', header: '一卡通', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt82', header: '一卡通-停車場', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt20', header: '禮券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt62', header: '商品提貨單', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt77', header: '感熱紙抵用券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt71', header: '商品抵用券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt30', header: '貴賓提貨單(應收帳款)', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt73', header: '外來禮券(抵用券)', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt72', header: '外來提貨單(抵用券)', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt74', header: '活動券(自營)', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt75', header: '折價券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt76', header: '現抵', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt24', header: '禮券餘代卡', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt25', header: '提貨單餘代卡', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt07', header: '會員折抵', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt55', header: 'LINE Pay', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt83', header: 'LINE Pay-停車場', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt78', header: 'APP抵用券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt79', header: 'APP提貨單', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt21', header: 'APP禮券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt53', header: '悠遊卡', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt56', header: '一卡通錢包 iPASS MONEY', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt57', header: '台灣Pay', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt58', header: '南紡錢包', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt59', header: '即享券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt60', header: '喜客券', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt22', header: '外來提貨單-高夢', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_PayAmt23', header: '外來禮券-高夢', style: 'text-right', format: this.moneyFormat },
  { field: 'TXN_TotPayAmt', header: '總金額', style: 'text-right', format: this.moneyFormat }
];

timeFormat(value: string): string {
  return value?.substring(0, 5); // HH:mm
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
      title: '支付工具實收報表',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns,
      data: this.data,
      subtotalFields: columns.map(c => c.field).filter(f => f.startsWith('TXN_')),
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
      xlsx.utils.book_append_sheet(wb, ws, '支付工具實收報表');
      xlsx.writeFile(wb, `支付工具實收報表_${new Date().toISOString()}.xlsx`);
    });
  }
}
