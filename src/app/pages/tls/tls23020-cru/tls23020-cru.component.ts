import { Component } from '@angular/core';
import { TLS23010Service } from '../../../service/API/tls/tls23010.service';
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
import { TaxableService } from '../../../service/basic/taxable.service';
import { DiscountService } from '../../../service/basic/discount.service';
import { DeductionbigCategoryService } from '../../../service/basic/deductionbig-category.service';

import { ValidationService } from '../../../shared/service/validation.service';
import { TLS23020Service } from '../../../service/API/tls/tls23020.service';
import { createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { FloorService } from '../../../service/basic/floor.service';
import { Tls11010Service } from '../../../service/API/tls/tls11010.service';
import { TxnStatusService } from '../../../service/basic/txn-status.service';
import { ECRNoService } from '../../../service/basic/ECRNo.service';
import { CounterNameService } from '../../../service/basic/counter-name.service';
import { PdfService } from '../../../service/basic/pdf.service';



@Component({
  selector: 'app-tls23020-cru',
  templateUrl: './tls23020-cru.component.html',
  styleUrls: ['./tls23020-cru.component.scss']
})
export class TLS23020CRUComponent extends BasicCruPageComponent<any> {
  pdfSummary: string[] = [];
  override loading = true;
  printedAt: string = '';
  dateStart: string = '';
  dateEnd: string = '';
  progressValue = 10;
  data: any[] = [];
  columns = [
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
    { field: 'ECR_No', header: '收銀機代號', visible: true },
    { field: 'TXN_No', header: '交易序號', visible: true },
    { field: 'tlt_no', header: '專櫃編號', visible: true },
    { field: 'tlt_name', header: '櫃位名稱', visible: true, style: 'text-left' }, // 若無此欄位請移除
    { field: 'TXN_GUINo', header: '發票號碼', visible: true },


    {
      field: 'PLU_SalePrc', header: '單項售價', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_Net', header: '未稅(免稅)金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },


    {
      field: 'TXN_Tax', header: '稅額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_Disc', header: '折扣金額', visible: true,
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },

    {
      field: 'tlt_id',
      header: '商品抽成類別',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.deductionbigCategoryOptions)
    },
    {
      field: 'ORG_TXN_DiscCode', header: '原折扣', visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.discountOptions)
    }, // 查無該欄位，請確認是否有誤或應移除
    {
      field: 'TXN_DiscCode', header: '歸屬折扣', visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.discountOptions)
    },

    {
      field: 'PLU_TaxType',
      header: '稅別',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.taxableOptions)
    },
    { field: 'PLU_MagNo', header: '單品編號', visible: true },

    {
      field: 'TXN_Status',
      header: '狀態',
      visible: true,
      format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions)
    },
  ];
  formatTime(val: string): string {
    if (!val) return '';
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }


  // 下拉選單選項
  taxableOptions: any[] = [];
  discountOptions: any[] = [];
  deductionbigCategoryOptions: any[] = [];
  floorOptions: any[] = [];
  BUILDING_NO_Options: any[] = [];
  commissionTypeOptions: any[] = [];
  whetherOptions: any[] = [];
  txnStatusOptions: any[] = [];
  checkTotalAmount = [
    { value: 1, label: '是' },
    { value: 2, label: '否' },
  ];
  OrganizationCodeOptions: any[] = [];
  ECRNoOptions: any[] = []; // 收銀機號下拉選單
  CounterOptions: any[] = []; // 專櫃選項

  constructor(
    private tls23020Service: TLS23020Service,
    private taxableService: TaxableService,
    private discountService: DiscountService,
    private floorService: FloorService,
    private deductionbigCategoryService: DeductionbigCategoryService,
    private commissionTypeService: CommissionTypeService,
    private tls11010Service: Tls11010Service,
    private ECRNoService: ECRNoService,
    private counterNameService: CounterNameService,
    private whetherService: WhetherService,
    private txnStatusService: TxnStatusService,
    private location: Location,
    private pdfService: PdfService,
  ) {
    super();

    this.tls11010Service.getBuildingOptions().subscribe((res) => (this.BUILDING_NO_Options = res));
    this.taxableService.getSystemTypes().subscribe(data => this.taxableOptions = data);
    this.discountService.getLocalDiscountOptions().subscribe(data => this.discountOptions = data);
    this.deductionbigCategoryService.getLocalDeductionCategories().subscribe(data => this.deductionbigCategoryOptions = data);
    this.whetherService.getWhetherOptions().subscribe(data => this.whetherOptions = data);
    this.txnStatusService.getTxnStatusOptions().subscribe(data => this.txnStatusOptions = data);
    this.floorService.getFloors().subscribe(data => this.floorOptions = data);
    this.tls11010Service.getOrgOptions().subscribe((res) => {
      this.OrganizationCodeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
    this.commissionTypeService.getCommissionTypes().subscribe((res) => {
      this.commissionTypeOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
    this.ECRNoService.getECRNo().subscribe((res) => {
      this.ECRNoOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
    this.counterNameService.getCounters().subscribe((res) => {
      this.CounterOptions = res?.map((x: any) => ({
        label: x.label,                                 // 給 table 用
        formLabel: `${x.value} - ${x.label}`,           // 給下拉選單用
        value: x.value,
      })) || [];
    });
  }
  dataForm = this.formBuilder.nonNullable.group({});

  async ngOnInit(): Promise<void> {
    this.initializePage('TLS23020', this.dataForm);
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

      this.tls23020Service.queryTLS23020({
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
  const columns = [
    { header: '序號', field: '__index' }, // ✅ 固定第一欄為序號
    { header: '銷售日期起', field: 'dateStart' },
    { header: '銷售日期迄', field: 'dateEnd' },
    { header: '專櫃編號', field: 'tlt_no' },
    { header: '櫃位名稱', field: 'tlt_name', style: 'text-left' },
    { header: '發票總金額', field: 'sum', style: 'text-right', format: (val: number) => val.toLocaleString() }
  ];

  this.pdfService.exportReportPDF({
    orientation: 'l',
    title: '銷售總額報表',
    dateStart: this.dateStart,
    dateEnd: this.dateEnd,
    printedAt: this.printedAt,
    columns,
    data: this.groupedSummaryData,
    subtotalFields: ['sum'],
    summaryText: [] // ✅ 不列印 A~H 條列文字
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
