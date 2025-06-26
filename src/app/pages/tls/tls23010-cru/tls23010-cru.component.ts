import { Component } from '@angular/core';
import { TLS23010Service } from '../../../service/api/tls/tls23010.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ 正確寫法
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';


@Component({
  selector: 'app-tls23010-cru',
  templateUrl: './tls23010-cru.component.html',
  styleUrls: ['./tls23010-cru.component.scss']
})
export class TLS23010CRUComponent extends BasicCruPageComponent<any> {
  pdfSummary: string[] = [];
  override loading = true;
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  progressValue = 10;
  data: any[] = [];
  columns: any[] = [
    {
      field: 'TXN_Date',
      header: '銷售日期',
      visible: true,
      format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'ECR_No', header: '機號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true, style: 'text-right' },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' },
    { field: 'TXN_Uniform', header: '統一編號', visible: true },
    { field: 'TXN_GUIBegNoFirstNo', header: '字軌', visible: true },
    { field: 'TXN_GUIBegNo', header: '起始發票號碼', visible: true },
    { field: 'TXN_GUIEndNo', header: '結束發票號碼', visible: true },

    {
      field: 'TXN_TotSaleAmt', header: '發票金額	', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TotOver', header: '溢收金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_FlagStatus',
      header: '狀態旗標',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.statusFlagOptions)
    },
    {
      field: 'TXN_Status',
      header: '交易型態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions)
    },
    {
      field: 'TXN_Subtype',
      header: '交易附屬型態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.transactionSubTypeOptions)
    },
    {
      field: 'TXN_TotPayAmt', header: '訂金實收', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_Time',
      header: '起始時間',
      visible: true,
      format: (val: string) => this.formatTime(val)
    },
    {
      field: 'TXN_Time',
      header: '結束時間',
      visible: true,
      format: (val: string) => this.formatTime(val)
    },
    { field: 'USR_No', header: '收銀員', visible: true, style: 'text-left' },
    { field: 'TXN_PreOrderNo', header: '預售/訂金單號', visible: true },
    { field: 'ORG_TXN_Date', header: '原交易日期', visible: true },
    { field: 'ORG_ECR_No', header: '原收銀機號', visible: true },
    { field: 'ORG_TXN_No', header: '原交易序號', visible: true },
    { field: 'TXN_PkngUID', header: '停車車牌', visible: true },
    { field: 'TXN_MemID', header: '會員卡號', visible: true },
    {
      field: 'TXN_TotDisc', header: '折扣/讓金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_YN',
      header: '銷貨清單列印狀態',
      visible: true,
      format: () => '是'
    },
    {
      field: 'TXN_DonateType',
      header: '捐贈狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.whetherOptions)
    },
    { field: 'TXN_GUILoveCode', header: '捐贈社福團體代碼', visible: true },
    { field: 'TXN_GUIRemark', header: '防偽隨機碼', visible: true },
    {
      field: 'TXN_GUI_CarrType',
      header: '載具種類',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.carrierTypeOptions)
    },
    { field: 'TXN_GUI_CarrId', header: '共通性載具號碼', visible: true },
    {
      field: 'TXN_PrintGUI', header: '電子發票是否列印', visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI', header: '信用卡別', visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI', header: '號碼', visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI', header: '分期期數', visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI', header: '金額', visible: true,
      format: (val: any) => this.getYesNoLabel(val)
    },
  ];
  formatTime(val: string): string {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }


  statusFlagOptions: any[] = [];
  txnStatusOptions: any[] = [];
  transactionSubTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  carrierTypeOptions: any[] = [];

  constructor(
    private tls23010Service: TLS23010Service,
    private statusFlagService: StatusFlagService,
    private whetherService: WhetherService,
    private txnSubtypeService: TXN_SubtypeService,
    private location: Location,
    private pdfService: PdfService,
    private carrierTypeService: CarrierTypeService
  ) {
    super();
    this.statusFlagService.getStatusFlags().subscribe(res => this.statusFlagOptions = res);
    this.whetherService.getWhetherOptions().subscribe(res => this.whetherOptions = res);
    this.txnSubtypeService.getTXNSubtype().subscribe(res => this.transactionSubTypeOptions = res);
    this.carrierTypeService.getCarrierType().subscribe(res => this.carrierTypeOptions = res);
  }
  dataForm = this.formBuilder.nonNullable.group({});

  async ngOnInit(): Promise<void> {
    this.initializePage('TLS23010', this.dataForm);
    const state = history.state;
    const queryFormValue = state?.queryFormValue;

    this.printedAt = new Date().toLocaleString('zh-TW', { hour12: false });
    this.dateStart = queryFormValue?.TXN_DateStart
      ? this.formatDateToYMD(queryFormValue.TXN_DateStart)
      : '';

    this.dateEnd = queryFormValue?.TXN_DateEnd
      ? this.formatDateToYMD(queryFormValue.TXN_DateEnd)
      : '';


    if (queryFormValue) {
      Object.keys(queryFormValue).forEach((k) => {
        if (queryFormValue[k] === '') queryFormValue[k] = null;
      });

      this.progressValue = 10;
      this.loading = true;

      const progressTimer = setInterval(() => {
        if (this.progressValue < 90) this.progressValue += 10;
      }, 200);

      const pageSize = state?.pageSize ?? 1000;

      this.tls23010Service.queryTLS23010({
        ...queryFormValue,
        pageSize
      }).pipe(
        finalize(() => {
          clearInterval(progressTimer);
          this.progressValue = 100;
          this.loading = false;
        })
      ).subscribe((res) => {
        this.data = (res.Status === '0000' && Array.isArray(res.Data)) ? res.Data : [];

        // ✅ 正確放置位置：資料查詢完成後，計算 summary
        const getSum = (field: string): number =>
          this.data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

        const A = getSum('TXN_TotSaleAmt');      // 發票金額
        const B = getSum('TXN_TotPayAmt');       // 已開發票的支付工具
        const C = getSum('TXN_TotOver');         // 已開發票的支付工具溢收
        const D = getSum('TXN_TotPayAmt');       // 訂金（假設同欄位）
        const E = getSum('TXN_TotSaleAmt');      // 訂金結帳金額（範例）
        const F = getSum('TXN_TotPayAmt');       // 訂金結帳的訂金（範例）
        const G = getSum('TXN_TotDisc');         // 預售（範例）
        const H = getSum('TXN_TaxFreeCertNo');   // 預售結帳金額（範例）

        const discountValue = A + B - C + E - G + H;
        const paymentValue = A + B + D - F;

        this.pdfSummary = [
          `(A)發票金額 = ${A}`,
          `(B)已開發票的支付工具 = ${B}`,
          `(C)已開發票的支付工具溢收 = ${C}`,
          `(D)訂金 = ${D}`,
          `(E)訂金結帳金額 = ${E}`,
          `(F)訂金結帳的訂金 = ${F}`,
          `(G)預售 = ${G}`,
          `(H)預售結帳金額 = ${H}`,
          '=============================',
          `折扣別(專櫃業績) = (A) + (B) - (C) + (E) - (G) + (H) = ${discountValue}`,
          `付款別(支付工具) = (A) + (B) + (D) - (F) = ${paymentValue}`
        ];
        this.generateSummaryTable();
      }, () => {
        this.data = [];
      });

    } else {
      this.loading = false;
    }
  }
  formatDateToYMD(dateStr: string): string {
    const date = new Date(dateStr);
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}/${m}/${d}`;
  }


  getYesNoLabel(value: any): string {
    return value === 'Y' ? '是' : value === 'N' ? '否' : value;
  }

  getLabelFromOptions(value: any, options: any[]): string {
    const found = options?.find(opt => String(opt.value) === String(value));
    return found ? found.label : value;
  }

  goBack() {
    this.location.back();
  }
  printPage(): void {
    window.print();
  }
  // 計算所有 A~H = TXN_PrintGUI 加總

  groupedSummaryData: any[] = [];
  totalSum = 0;
  invoiceSum = 0;
  showSummaryMode = false;
  summaryTableData: any[] = [];

  generateSummaryTable(): void {
    const summaryMap = new Map<string, any>();

    this.totalSum = 0;
    this.invoiceSum = 0;

    this.data.forEach(row => {
      const key = row.tlt_no;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          dateStart: this.dateStart,
          dateEnd: this.dateEnd,
          tlt_no: row.tlt_no,
          tlt_name: row.tlt_name,
          sum: 0
        });
      }

      const saleAmt = parseFloat(row.TXN_TotSaleAmt) || 0;
      const payAmt = parseFloat(row.TXN_TotPayAmt) || 0;

      summaryMap.get(key).sum += saleAmt;
      this.totalSum += saleAmt;
      this.invoiceSum += payAmt;
    });

    this.summaryTableData = Array.from(summaryMap.values());

    console.log('summaryTableData ✅', this.summaryTableData);
    this.groupedSummaryData = this.summaryTableData; // 保留舊用法相容性
  }



  exportSummaryPDF(): void {
  this.pdfService.exportReportPDF({
    orientation: 'l',
    title: '銷售總額報表',
    dateStart: this.dateStart,
    dateEnd: this.dateEnd,
    printedAt: this.printedAt,
    columns: [
      { header: '銷售日期起', field: 'dateStart' },
      { header: '銷售日期迄', field: 'dateEnd' },
      { header: '專櫃編號', field: 'tlt_no' },
      { header: '櫃位名稱', field: 'tlt_name', style: 'text-left' },
      {
        header: '發票總金額',
        field: 'sum',
        style: 'text-right',
        format: (val: number) => val?.toLocaleString('en-US') || '0'
      }
    ],
    data: this.groupedSummaryData,
    subtotalFields: ['sum'],
    mergeTotalCols: 4,
    summaryText: [] // 如果你要在 PDF 下方加備註可以填
  });
}
  exportSummaryExcel(): void {
    import('xlsx').then(xlsx => {
      const ws = xlsx.utils.json_to_sheet(
        this.groupedSummaryData.map(row => ({
          銷售日期起: row.dateStart,
          銷售日期迄: row.dateEnd,
          專櫃編號: row.tlt_no,
          櫃位名稱: row.tlt_name,
          發票總金額: row.sum
        }))
      );
      const wb = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(wb, ws, '銷售總額');
      xlsx.writeFile(wb, `銷售總額_${new Date().toISOString()}.xlsx`);
    });
  }

goToQueryPage(): void {
  this.router.navigate(['/TLS/TLS23010']);
}
}
