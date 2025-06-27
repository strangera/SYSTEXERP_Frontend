import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';

@Component({
  selector: 'app-tls23010-cru',
  templateUrl: './tls23010-cru.component.html',
  styleUrls: ['./tls23010-cru.component.scss']
})
export class TLS23010CRUComponent extends BasicCruPageComponent<any> {
  displayMode: 'Detail' | 'Summary' = 'Detail';
  data: any[] = [];
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  pageSize: number = 1000;
  queryFormValue: any;
  dataForm = this.formBuilder.nonNullable.group({});
  pdfSummary: string[] = [];

  statusFlagOptions: any[] = [];
  txnStatusOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  carrierTypeOptions: any[] = [];

  constructor(
    private location: Location,
    private pdfService: PdfService,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private txnSubtypeService: TXN_SubtypeService,
    private carrierTypeService: CarrierTypeService
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    const state = history.state;
    this.queryFormValue = state?.queryFormValue;
    this.data = state?.data || [];
    this.pageSize = state?.pageSize ?? 1000;
    this.printedAt = new Date().toLocaleString('zh-TW', { hour12: false });

    this.dateStart = this.formatDateToYMD(this.queryFormValue?.TXN_DateStart);
    this.dateEnd = this.formatDateToYMD(this.queryFormValue?.TXN_DateEnd);

    this.initializePage('TLS23010', this.dataForm);

    this.statusFlagService.getStatusFlags().subscribe(res => this.statusFlagOptions = res);
    this.whetherService.getWhetherOptions().subscribe(res => this.whetherOptions = res);
    this.txnSubtypeService.getTXNSubtype().subscribe(res => this.transactionSubTypeOptions = res);
    this.carrierTypeService.getCarrierType().subscribe(res => this.carrierTypeOptions = res);
  }

  get columns() {
    if (this.displayMode === 'Summary') {
      return [
        { field: 'tlt_no', header: '專櫃編號' },
        { field: 'tlt_name', header: '櫃位名稱' },
        { field: 'TotalAmt', header: '總金額', style: 'text-right', format: this.moneyFormat },
        { field: 'TotalTxn', header: '總交易筆數', style: 'text-right' }
      ];
    } else {
      return [
        { field: 'TXN_Date', header: '銷售日期', visible: true, format: this.formatDateToYMD },
        { field: 'ECR_No', header: '機號', visible: true },
        { field: 'TXN_No', header: '交易序號', visible: true },
        { field: 'tlt_no', header: '專櫃編號', visible: true },
        { field: 'tlt_name', header: '櫃位名稱', visible: true },
        { field: 'TXN_TotSaleAmt', header: '發票金額', visible: true, style: 'text-right', format: this.moneyFormat },
        { field: 'TXN_TotPayAmt', header: '訂金實收', visible: true, style: 'text-right', format: this.moneyFormat },
        { field: 'TXN_TotDisc', header: '折扣/讓金額', visible: true, style: 'text-right', format: this.moneyFormat },
        { field: 'TXN_TotOver', header: '溢收金額', visible: true, style: 'text-right', format: this.moneyFormat },
        { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true }
      ];
    }
  }

  formatDateToYMD(dateStr: string): string {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }

  moneyFormat(value: number): string {
    return value != null ? value.toLocaleString('en-US') : '0';
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }





  

  private getSum(field: string): number {
    return this.data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
  }

  private updatePdfSummary(): void {
    const A = this.getSum('TXN_TotSaleAmt');
    const B = this.getSum('TXN_TotPayAmt');
    const C = this.getSum('TXN_TotOver');
    const D = this.getSum('TXN_TotDisc');
    const E = this.getSum('TXN_TaxFreeCertNo');

    const discountValue = A + B - C - D;
    const paymentValue = A + B;

    this.pdfSummary = [
      `(A) 發票金額 = ${A.toLocaleString()}`,
      `(B) 訂金實收 = ${B.toLocaleString()}`,
      `(C) 溢收金額 = ${C.toLocaleString()}`,
      `(D) 折讓金額 = ${D.toLocaleString()}`,
      `(E) 外交官免稅 = ${E.toLocaleString()}`,
      '=============================',
      `折扣別(專櫃業績) = (A + B - C - D) = ${discountValue.toLocaleString()}`,
      `付款別(支付工具) = (A + B) = ${paymentValue.toLocaleString()}`
    ];
  }
}
