import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import '../../../../assets/font/NotoSansTC-VariableFont_wght-normal';
import { PdfService } from '../../../service/basic/pdf.service';
import { StatusFlagService } from '../../../service/basic/status-flag.service';
import { WhetherService } from '../../../service/basic/whether.service';
import { TXN_SubtypeService } from '../../../service/basic/TXN_Subtype.service';
import { CarrierTypeService } from '../../../service/basic/carrier-type.service';
type DisplayMode = 'Detail' | 'Summary';
interface ReportColumn {
  header: string;
  field: string;
  format?: (value: any) => string | number | null;
  style?: string;
}
@Component({
  selector: 'app-tls23010-cru',
  templateUrl: './tls23010-cru.component.html',
  styleUrls: ['./tls23010-cru.component.scss']
})
export class TLS23010CRUComponent extends BasicCruPageComponent<any> {
  mergedView: boolean = true;
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
    this.displayMode = state?.displayMode ?? 'Detail'; // 
    this.printedAt = new Date().toLocaleString('zh-TW', { hour12: false });

    this.dateStart = state.queryFormValue?.TXN_DateStart || '';
    this.dateEnd = state.queryFormValue?.TXN_DateEnd || '';
    console.log('✅ TLS23010CRUComponent displayMode:', this.displayMode); // 
    this.initializePage('TLS23010', this.dataForm);

    this.statusFlagService.getStatusFlags().subscribe(res => this.statusFlagOptions = res);
    this.whetherService.getWhetherOptions().subscribe(res => this.whetherOptions = res);
    this.txnSubtypeService.getTXNSubtype().subscribe(res => this.transactionSubTypeOptions = res);
    this.carrierTypeService.getCarrierType().subscribe(res => this.carrierTypeOptions = res);
    this.updatePdfSummary();
  }

 
  private _displayMode: 'Detail' | 'Summary' = 'Detail';

get displayMode(): 'Detail' | 'Summary' {
  return this._displayMode;
}

set displayMode(value: 'Detail' | 'Summary') {
  this._displayMode = value;

  if (value === 'Summary') {
    this.mergedView = false; // ✅ Summary 模式不允許合併顯示
  }

  // ✅ 更新報表內容
  this.updatePdfSummary(); // summary 重新運算
}


  formatDateToYMD(dateStr: string): string {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? '' : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
  }
  formatTimeToHHMM(timeStr: string): string {
  const date = new Date(`1970-01-01T${timeStr}`);
  if (isNaN(date.getTime())) return '';
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
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
  if (this.displayMode === 'Detail') {
    const A = this.getSum('TXN_TotSaleAmt');       // 發票金額
    const B = this.getSum('TXN_TotPayAmt');        // 已開發票的支付工具
    const C = this.getSum('TXN_TotOver');          // 已開發票的支付工具溢收
    const D = this.getSum('TXN_Deposit');          // 訂金
    const E = this.getSum('TXN_DepositSettle');    // 訂金結帳金額
    const F = this.getSum('TXN_DepositUsed');      // 訂金結帳的訂金
    const G = this.getSum('TXN_TotDisc');          // 預售 (使用折扣金額欄位)
    const H = this.getSum('TXN_TaxFreeCertNo');    // 預售結帳金額

    const discountValue = A + B - C + E - G + H;
    const paymentValue = A + B + D - F;

    this.pdfSummary = [
      `(A)發票金額 =\t${A.toLocaleString()}`,
      `(B)已開發票的支付工具 =\t${B.toLocaleString()}`,
      `(C)已開發票的支付工具溢收 =\t${C.toLocaleString()}`,
      `(D)訂金 =\t${D.toLocaleString()}`,
      `(E)訂金結帳全額 =\t${E.toLocaleString()}`,
      `(F)訂金結帳的訂金 =\t${F.toLocaleString()}`,
      `(G)預售 =\t${G.toLocaleString()}`,
      `(H)預售結帳金額 =\t${H.toLocaleString()}`,
      '====================================================',
      `折扣別(專櫃業績) = (A) + (B) - (C) + (E) - (G) + (H)=\t${discountValue.toLocaleString()}`,
      `付款別(支付工具) = (A) + (B) + (D) - (F)=\t${paymentValue.toLocaleString()}`
    ];
  } else if (this.displayMode === 'Summary') {
    const totalAmt = this.getSum('TXN_TotSaleAmt');
    const totalTxn = this.getSum('TotalTxn');

    this.pdfSummary = [
      `總金額合計 = ${totalAmt.toLocaleString()}`,
      `總交易筆數合計 = ${totalTxn.toLocaleString()}`,
      '=============================',
      `平均每筆金額 = ${totalTxn > 0 ? (totalAmt / totalTxn).toFixed(2) : '0.00'}`
    ];
  }
}

 get columns(): ReportColumn[] {
    switch (this.displayMode) {
      case 'Detail':
        return [{
      field: 'TXN_Date',
      header: '銷售日期',
    
      format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }
    },
    { field: 'ECR_No', header: '機號',  },
    { field: 'TXN_No', header: '交易序號', style: 'text-right' },
    { field: 'tlt_no', header: '專櫃編號'  },
    { field: 'tlt_name', header: '櫃位名稱', style: 'text-left' }, // 非 POS5006 欄位，UI 顯示用
    { field: 'TXN_Uniform', header: '統一編號',  },
    { field: 'gui_track', header: '字軌',  }, // 假設為字軌顯示
    { field: 'GUIBegNo', header: '起始發票號碼',  },
    { field: 'GUIEndNo', header: '結束發票號碼',  },
    {
      field: 'TXN_TotGUI', header: '發票金額', 
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TotSaleAmt',
      header: '銷售金額',
    
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_TotOver', header: '溢收金額', 
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    }, {
      field: 'TXN_FlagStatus',
      header: '狀態旗標',
    
      format: (val: any) => this.getLabelFromOptions(val, this.statusFlagOptions)
    },
    {
      field: 'TXN_Status',
      header: '交易型態',
    
      format: (val: any) => this.getLabelFromOptions(val, this.txnStatusOptions)
    },
    {
      field: 'TXN_Subtype',
      header: '交易附屬型態',
    
      format: (val: any) => this.getLabelFromOptions(val, this.transactionSubTypeOptions)
    },
    {
      field: 'TXN_TotPayAmt', header: '訂金實收', 
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    { field: 'TXN_TaxFreeCertNo', header: '外交官免稅卡號',  },
    { field: 'TXN_Time', header: '起始時間', format: this.formatTimeToHHMM.bind(this) },
    { field: 'TXN_Time', header: '結束時間', format: this.formatTimeToHHMM.bind(this) },
    { field: 'USR_No', header: '收銀員',  style: 'text-left' },
    { field: 'TXN_PreOrderNo', header: '預售/訂金單號',  },
    { field: 'ORG_TXN_Date', header: '原交易日期',  },
    { field: 'ORG_ECR_No', header: '原收銀機號',  },
    { field: 'ORG_TXN_No', header: '原交易序號',  },
    { field: 'TXN_PkngUID', header: '停車車牌',  },
    { field: 'TXN_MemID', header: '會員卡號',  },
    {
      field: 'TXN_TotDisc', header: '折扣/讓金額', 
      style: 'text-right',
      format: (val: number) => val?.toLocaleString('en-US') || '0'
    },
    {
      field: 'TXN_YN',
      header: '銷貨清單列印狀態',
    
      format: () => '是'
    },

    {
      field: 'TXN_DonateType',
      header: '捐贈狀態',
    
      format: (val: any) => this.getLabelFromOptions(val, this.whetherOptions)
    },
    { field: 'TXN_GUILoveCode', header: '捐贈社福團體代碼',  },
    { field: 'TXN_GUIRemark', header: '防偽隨機碼',  },
    {
      field: 'TXN_GUI_CarrType',
      header: '載具種類',
    
      format: (val: any) => this.getLabelFromOptions(val, this.carrierTypeOptions)
    },
    { field: 'TXN_GUI_CarrId', header: '共通性載具號碼',  },
    {
      field: 'TXN_PrintGUI',
      header: '電子發票是否列印', //是從 **POS5006.TXN_PrintTimes** 計算出來的結果。
    
      format: (val: any) => this.getYesNoLabel(val)
    },
    {
      field: 'TXN_PrintGUI',
      header: '信用卡別',
    
      
    },
    {
      field: 'TXN_PrintGUI',
      header: '號碼',
    
      
    },
    {
      field: 'TXN_PrintGUI',
      header: '分期期數',
    
     
    },
    {
      field: 'TXN_PrintGUI',
      header: '金額',
    
      
    },
         ];

case 'Summary':
  return [
    {
      field: 'TXN_Date',
      header: '銷售日期',
    
      format: (val: string) => {
        const date = new Date(val);
        return isNaN(date.getTime())
          ? val
          : `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
      }},
      { field: 'tlt_no', header: '專櫃編號' },
      { field: 'tlt_name', header: '櫃位名稱' },
      { field: 'TXN_TotSaleAmt', header: '發票總金額', style: 'text-right', format: this.moneyFormat },
  
 ];

      default:
        return [{ header: '錯誤', field: '', format: () => '未知模式' }];
    }
  }

}
