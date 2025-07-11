import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { SupplementCategoryService } from '../../../service/basic/supplement-category.service';
import { FloorService } from '../../../service/basic/floor.service';
import { CounterCodeService } from '../../../service/basic/counter-code.service';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';

// 交易補登作業
@Component({
  selector: 'app-tls24010',
  templateUrl: './tls24010.component.html',
})
export class TLS24010Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    SYS_StoreNo: ['', [Validators.maxLength(10)]],       /*店別 → SYS_StoreNo */
    TXN_Uniform: ['', [Validators.maxLength(8)]],        /*統一編號 → TXN_Uniform */
    TXN_TotSaleAmt: ['', [Validators.maxLength(20)]],    /*銷售金額 → TXN_TotSaleAmt */
    TXN_Sales: ['', [Validators.maxLength(20)]],         /*銷貨人員 → TXN_Sales */
    TXN_CustCnt: ['', [Validators.maxLength(4)]],        /*來客數 → TXN_CustCnt */
    UPD_Date: ['', []],                                  /*修正日期 → UPD_Date */
    TXN_MemCard: ['', [Validators.maxLength(30)]],       /*會員卡號 → TXN_MemCard */
    TXN_TotGUI: ['', [Validators.maxLength(20)]],        /*發票金額 → TXN_TotGUI */
    ORG_TXN_Date: ['', []],                              /*原交易日期 → ORG_TXN_Date */
    TLT_No: ['', [Validators.maxLength(12)]],            /*櫃編 → TLT_No */
    UPD_Time: ['', []],                                  /*修正時間 → UPD_Date (只取時間部分，需自行轉換) */
    TXN_Status: ['', [Validators.maxLength(1)]],         /*交易狀態 → TXN_Status */
    TXN_TotOver: ['', [Validators.maxLength(20)]],       /*溢收金額 → TXN_TotOver */
    ORG_ECR_No: ['', [Validators.maxLength(10)]],        /*原收銀機號 → ORG_ECR_No */
    TXN_VIP: ['', [Validators.maxLength(1)]],            /*員購 → TXN_VIP（外交官交易） */
    ECR_No: ['', [Validators.maxLength(10)]],            /*收銀機號 → ECR_No */
    TXN_Mode: ['', [Validators.maxLength(1)]],           /*交易模式 → TXN_Mode */
    ORG_TXN_No: ['', [Validators.maxLength(6)]],         /*原交易序號 → ORG_TXN_No */
    TXN_PreOrder: ['', [Validators.maxLength(1)]],       /*預售 → TXN_PreOrder */
    TXN_No: ['', [Validators.maxLength(8)]],             /*交易序號 → TXN_No */
    TXN_TotTax: ['', [Validators.maxLength(20)]],        /*發票稅額 → TXN_TotTax */
    USR_No: ['', [Validators.maxLength(16)]],            /*原收銀人員 → USR_No（但原收銀人員未明確定義） */
    // !!! 無明確對應欄位的備註項（可保留待後續確認）
    // TXN_OrgUsrNo: ['', []],  /*原收銀人員 → 未在 POS5006 中明確出現，需視實際需求從其他欄位取得 */
  });
  supplementCategoryOptions: any[] = [];
  cashierOptions: any[] = [];
  counterCodeOptions: any[] = [];
  invoiceCarrierTypeOptions: any[] = [];  // 電子發票載具種類選項
  data: any[] = [];
  columns: Column[] = [
    { field: 'salesDate', header: '銷售日期', visible: true },
    { field: 'cashRegisterStatus', header: '收銀機代號', visible: true },
    { field: 'transactionFlow', header: '交易流水號', visible: true },
    { field: 'invoiceNumber', header: '發票號碼', visible: true },
    { field: 'invoiceStatus', header: '發票狀態', visible: true },
    { field: 'counterName', header: '專櫃編號/名稱', visible: true },
    { field: 'transactionType', header: '交易型態', visible: true },
    { field: 'salesTotal', header: '銷售總額', visible: true },
    { field: 'invoiceAmount', header: '發票金額/已開發票金額', visible: true },
    { field: 'profitAmount', header: '溢收金額', visible: true },
    { field: 'transactionCount', header: '交易筆數/銷售單數', visible: true },
    { field: 'repairer', header: '補登者', visible: true },
    { field: 'repairDate', header: '補登日期', visible: true },
    { field: 'remark', header: '備註', visible: true }
  ];
  constructor(
    private supplementCategoryService: SupplementCategoryService,
    private floorService: FloorService,  // 收銀機號
    private counterCodeService: CounterCodeService,  // 專櫃編號
  ) { super(); }
  ngOnInit(): void {
    this.initializePage('TLS24010', 'TLS/TLS24010CRU', this.queryForm, (form) => this.onSubmit(form));
    this.supplementCategoryService.getSupplementCategories().subscribe((data) => {
      this.supplementCategoryOptions = data;
    });
    this.floorService.getFloors().subscribe((data) => {
      this.cashierOptions = data;
    });
    this.counterCodeService.getCounterCodes().subscribe((data) => {
      this.counterCodeOptions = data;
    });
    // 假設有一個服務來獲取電子發票載具種類選項
    this.invoiceCarrierTypeOptions = [
      { label: '載具1', value: 1 },
      { label: '載具2', value: 2 },
      { label: '載具3', value: 3 }
    ];
  }

  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.loading = false;
      // this.queryStateService.setQueryState(this.ProgNo, frm.value);
    });
  }
}
