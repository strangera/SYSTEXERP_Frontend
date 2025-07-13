import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';

type DisplayMode = 'CreditCardDetail' | 'CounterCardAnalysis';
interface ReportColumn {
  header: string;
  field: string;
  format?: (value: any) => string | number | null;
  style?: string;
}

@Component({
    selector: 'app-tls23090-cru',
    templateUrl: './tls23090-cru.component.html',
    styleUrls: ['./tls23090-cru.component.scss'],
    standalone: true,
    imports: [MenubarComponent, ReportTableGroupComponent]
})
export class TLS23090CRUComponent extends BasicCruPageComponent<any> {
  displayMode: DisplayMode = 'CreditCardDetail';
  data: any[] = [];
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
    private tls11010Service: Tls11010Service
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

      const incomingMode = state.displayMode || 'CreditCardDetail';
      const validModes: DisplayMode[] = ['CreditCardDetail', 'CounterCardAnalysis'];
      this.displayMode = validModes.includes(incomingMode) ? incomingMode : 'CreditCardDetail';
    } else {
      this.messageService.warnBubble('⚠️ 無資料可顯示，請重新查詢。');
    }

    this.tls11010Service.getOrgOptions().subscribe(res => {
      this.OrganizationCodeOptions = (res || []).map(x => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.initializePage('TLS23090', this.dataForm);
  }

  get columns(): ReportColumn[] {
    switch (this.displayMode) {
      case 'CreditCardDetail':
        return [
          { field: 'TXN_Date', header: '銷售日期', format: this.formatDate },
          { field: 'ECR_No', header: '收銀機代號' },
          { field: 'TXN_No', header: '交易序號' },
          { field: 'tlt_no', header: '專櫃編號' },
          { field: 'tlt_name', header: '櫃位名稱' },
          { field: 'CRD_Type', header: '信用卡卡別' },
          { field: 'CRD_No', header: '信用卡卡號' },
          {
            field: 'TXN_PayAmt', header: '金額', style: 'text-right',
            format: (val: number) => val?.toLocaleString() || '0'
          },
          {
            field: 'TXN_Bonus', header: '紅利', style: 'text-right',
            format: (val: number) => val?.toLocaleString() || '0'
          },
          { field: 'TXN_Installment', header: '分期' },
          { field: 'TXN_PeriodType', header: '分期期別' },
          { field: 'TXN_Periods', header: '分期期數' },
          {
            field: 'TXN_DownPayAmt', header: '頭期款分期金額', style: 'text-right',
            format: (val: number) => val?.toLocaleString() || '0'
          },
          {
            field: 'TXN_MonthlyAmt', header: '每期分期金額', style: 'text-right',
            format: (val: number) => val?.toLocaleString() || '0'
          },
        ];
case 'CounterCardAnalysis':
  return [
    { field: 'tlt_no', header: '專櫃編號' },
    { field: 'tlt_name', header: '櫃位名稱' },
    {
      field: 'CRD_Type_List.VISA.Amount',
      header: 'VISA 金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.VISA.Count',
      header: 'VISA 筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.MASTER.Amount',
      header: 'MASTER 金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.MASTER.Count',
      header: 'MASTER 筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.JCB.Amount',
      header: 'JCB 金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.JCB.Count',
      header: 'JCB 筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.AE.Amount',
      header: 'AE 金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.AE.Count',
      header: 'AE 筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.DA.Amount',
      header: 'DA 金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.DA.Count',
      header: 'DA 筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.UnionPay.Amount',
      header: '銀聯 金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.UnionPay.Count',
      header: '銀聯 筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.Others.Amount',
      header: '其他卡別 金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.Others.Count',
      header: '其他卡別 筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.Total.Amount',
      header: '總金額',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
    {
      field: 'CRD_Type_List.Total.Count',
      header: '總筆數',
      style: 'text-right',
      format: (val: number) => val?.toLocaleString() || '0'
    },
  ];

      default:
        return [{ header: '錯誤', field: '', format: () => '未知模式' }];
    }
  }

  formatDate(val: string): string {
    const date = new Date(val);
    return isNaN(date.getTime())
      ? val
      : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  goBack(): void {
    this.location.back();
  }

  printPage(): void {
    window.print();
  }


  exportSummaryExcel(): void {
    import('xlsx').then(xlsx => {
      const exportData = this.data.map(row => {
        const obj: { [key: string]: any } = {};
        this.columns.forEach(col => {
          obj[col.header] =
            typeof col.format === 'function'
              ? col.format(row[col.field as string])
              : row[col.field as string];
        });
        return obj;
      });

      const ws = xlsx.utils.json_to_sheet(exportData);
      const wb = xlsx.utils.book_new();

      const sheetName = this.displayMode === 'CounterCardAnalysis'
        ? '卡別分析'
        : '信用卡明細';

      xlsx.utils.book_append_sheet(wb, ws, sheetName);
      xlsx.writeFile(wb, `銷售報表_${new Date().toISOString()}.xlsx`);
    });
  }
}
