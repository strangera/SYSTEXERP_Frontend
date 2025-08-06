import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';

import { PdfService } from '../../../service/basic/pdf.service';
import { Tls11010Service } from '../../../service/api/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ReportTableGroupComponent } from '../../../shared/componentkit/report-table-group/report-table-group.component';
import {
  TLS23040ResponseItem,
  PaymentDetail,
  DiscountDetail,
} from '../tls23040/tls23040.model';
type DisplayMode = 'Report' | 'ByPaymentType' | 'ByDiscountType';

@Component({
  selector: 'app-tls23040-cru',
  templateUrl: './tls23040-cru.component.html',
  styleUrls: ['./tls23040-cru.component.scss'],
  standalone: true,
  imports: [MenubarComponent, ReportTableGroupComponent],
})
export class TLS23040CRUComponent extends BasicCruPageComponent<any> {
  displayMode: DisplayMode = 'Report';
  data:
    | TLS23040ResponseItem[]
    | (PaymentDetail & { parent: TLS23040ResponseItem })[]
    | (DiscountDetail & { parent: TLS23040ResponseItem })[] = [];

  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  pageSize: number = 1000;
  useSummaryMode = false;
  pdfSummary: string[] = [];
  queryFormValue: any;
  dataForm = this.formBuilder.nonNullable.group({});

  OrganizationCodeOptions: any[] = [];
  txnStatusOptions: any[] = [];

  constructor(
    private location: Location,
    private pdfService: PdfService,
    private tls11010Service: Tls11010Service,
    private txnStatusService: TxnStatusService,
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

      // ✅ 設定 displayMode，限制只能是三個合法值
      const validDisplayModes: DisplayMode[] = [
        'Report',
        'ByPaymentType',
        'ByDiscountType',
      ];
      const incomingMode =
        state.displayMode || state.queryFormValue?.DisplayMode || 'Report';
      this.displayMode = validDisplayModes.includes(incomingMode)
        ? incomingMode
        : 'Report';
    } else {
      this.messageService.warnBubble('⚠️ 無資料可顯示，請重新查詢。');
    }

    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = (res || []).map((x) => ({
        label: x.label,
        formLabel: `${x.value} - ${x.label}`,
        value: x.value,
      }));
    });

    this.txnStatusService.getTxnStatusOptions().subscribe((data) => {
      this.txnStatusOptions = data;
    });

    this.initializePage('TLS23040', this.dataForm);
  }

  get columns() {
    switch (this.displayMode) {
      case 'ByPaymentType':
        return [
          {
            field: 'TXN_Date',
            header: '銷售日期',
            format: (val: string) => this.formatDate(val),
          },
          { field: 'ECR_No', header: '收銀機號', visible: true },
          { field: 'TXN_No', header: '交易序號', visible: true },
          { field: 'tlt_no', header: '專櫃編號' },
          { field: 'tlt_name', header: '櫃位名稱', style: 'text-left' },
          { field: 'PAY_NAME', header: '付款別', style: 'text-left' },
          {
            field: 'TXN_PayAmt',
            header: '金額',
            style: 'text-right',
            format: (val: number) => val?.toLocaleString() || '0',
          },
          { field: 'CRD_Type', header: '卡別', visible: true },
          {
            field: 'CRD_No',
            header: '信用卡卡號/條碼',
            visible: true,
            style: 'text-right',
          },
          { field: 'TERM_No', header: '分期', visible: true },
        ];
      case 'Report':
        return [
          {
            field: 'TXN_Date',
            header: '銷售日期',
            visible: true,
            format: (val: string) => {
              const d = new Date(val);
              return isNaN(d.getTime())
                ? val
                : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
            },
          },
          { field: 'ECR_No', header: '收銀機號', visible: true },
          { field: 'TXN_No', header: '交易序號', visible: true },
          { field: 'tlt_no', header: '專櫃編號', visible: true },
          {
            field: 'tlt_name',
            header: '櫃位名稱',
            visible: true,
            style: 'text-left',
          },
          { field: 'gui_track', header: '發票起號(字軌)', visible: true },
          { field: 'GUIBegNo', header: '發票號碼(起)', visible: true },
          { field: 'GUIEndNo', header: '發票號碼(迄)', visible: true },
          {
            field: 'TXN_TotGUI',
            header: '發票金額',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_TotSaleAmt',
            header: '業績金額',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_Status',
            header: '交易型態',
            visible: true,
            format: (val: any) =>
              this.getLabelFromOptions(val, this.txnStatusOptions),
          },
          {
            field: 'TXN_TaxFreeCertNo',
            header: '外交官免稅卡號',
            visible: true,
          },
          { field: 'USR_No', header: '收銀員', visible: true },
          { field: 'TXN_PkngUID', header: '停車卡號', visible: true },
          {
            field: 'ORG_TXN_Date',
            header: '原交易日期',
            visible: true,
            format: (val: string) => {
              const d = new Date(val);
              return isNaN(d.getTime())
                ? val
                : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
            },
          },
          { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
          { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
          { field: 'TXN_MemCard', header: '會員卡號', visible: true },
          {
            field: 'TXN_TotPayScoreAmt',
            header: '會員積點折抵',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
        ];

      case 'ByDiscountType':
        return [
          {
            field: 'TXN_Date',
            header: '銷售日期',
            visible: true,
            format: (val: string) => {
              const d = new Date(val);
              return isNaN(d.getTime())
                ? val
                : `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
            },
          },
          { field: 'ECR_No', header: '收銀機號', visible: true },
          { field: 'TXN_No', header: '交易序號', visible: true },
          { field: 'tlt_no', header: '專櫃編號', visible: true },
          {
            field: 'tlt_name',
            header: '櫃位名稱',
            visible: true,
            style: 'text-left',
          },
          { field: 'TXN_GUINo', header: '發票號碼', visible: true },
          {
            field: 'PLU_SalePrc',
            header: '單項售價',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },

          {
            field: 'TXN_Net',
            header: '未稅(免稅)',
            visible: true,
            style: 'text-right',
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          {
            field: 'TXN_Tax',
            header: '稅額',
            visible: true,
            format: (val: number) => val?.toLocaleString('en-US') || '0',
          },
          { field: 'tlt_id', header: '抽成類別', visible: true },
          { field: 'tlt_id_desc', header: '抽成類別名稱', visible: true },
          { field: 'TXN_DiscCode', header: '原折扣', visible: true },
          { field: 'TXN_DiscName', header: '原折扣名稱', visible: true },
          { field: 'PLU_TaxType', header: '稅別代號', visible: true },
          { field: 'PLU_TaxTypeName', header: '稅別名稱', visible: true },
          { field: 'PLU_MagNo', header: '報帳條碼', visible: true },
          { field: 'TXN_Status', header: '狀態代碼', visible: true },
          { field: 'TXN_StatusName', header: '狀態名稱', visible: true },
        ];

      default:
        console.error('❌ 無法辨識的 displayMode:', this.displayMode);
        return [
          {
            header: '錯誤',
            field: '',
            format: () => '未獲得正確 displayMode',
          },
        ];
    }
  }

  formatDate(val: string): string {
    const date = new Date(val);
    return isNaN(date.getTime())
      ? val
      : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find((opt) => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  goBack(): void {
    this.location.back();
  }

  printPage(): void {
    window.print();
  }

  exportSummaryPDF(): void {
    const columns = this.columns;

    const subtotalFields =
      this.displayMode === 'ByPaymentType'
        ? ['TXN_PayAmt'] // 根據需求只對 ByPaymentType 小計
        : this.displayMode === 'ByDiscountType'
          ? ['TXN_DiscAmt']
          : [];

    const mergeTotalCols =
      this.displayMode === 'ByPaymentType' ||
      this.displayMode === 'ByDiscountType'
        ? 2
        : 0;

    this.pdfService.exportReportPDF({
      orientation: 'l',
      title: '發票報表',
      dateStart: this.dateStart,
      dateEnd: this.dateEnd,
      printedAt: this.printedAt,
      columns,
      data: this.data,
      subtotalFields,
      summaryText: [],
      mergeTotalCols,
    });
  }

  exportSummaryExcel(): void {
    import('xlsx').then((xlsx) => {
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

      let sheetName = '';
      switch (this.displayMode) {
        case 'ByPaymentType':
          sheetName = '付款彙總';
          break;
        case 'ByDiscountType':
          sheetName = '折扣彙總';
          break;
        case 'Report':
        default:
          sheetName = '交易明細';
      }

      xlsx.utils.book_append_sheet(wb, ws, sheetName);
      xlsx.writeFile(wb, `銷售報表_${new Date().toISOString()}.xlsx`);
    });
  }
}
