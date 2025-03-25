import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ItemCodeService } from '../../../service/basic/item-code.service';
import { AssetStatusService } from '../../../service/basic/asset-status.service';
import { AssetsTypeService } from '../../../service/basic/assets-type.service';
import { NeedPayTicketService } from '../../../service/basic/need-pay-ticket.service';
//

//3.1.3.9  資產攤提作業
@Component({
  selector: 'app-ass13090',
  templateUrl: './ass13090.component.html',
  styleUrl: './ass13090.component.scss'
})
export class ASS13090Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    shareCode: [, [Validators.maxLength(20)]], // 攤提代號
    itemCode: [], // 	品項編號
    purchaseDateFrom: [], // 	購入日期
    purchaseDateTo: [], // 	購入日期
    assetStatus: [[] as number[]], // 資產狀態
    assetType: [[] as number[]], // 資產類型
    accountingCode: [], // 會計科目代號
    purchaseAmountFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 購入金額
    purchaseAmountTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 購入金額
    purchaseNumber: [], // 採購單號
    filter: [1, []], // 條件篩選
  });
  // 下拉資料多個呈現
  // ----------------------------------------------------------------
  roles: any[] = [
    { id: 1, roleCode: 'ADMIN', roleName: 'Administrator' },
    { id: 2, roleCode: 'USER', roleName: 'User' },
    { id: 3, roleCode: 'GUEST', roleName: 'Guest' },
  ];
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    { 'shareCode': '1A2323001001', 'itemCode': '1A2323001001/B1', 'purchaseDate': '2014/12/31', 'derditDate': '2014/12/31',
      'assetType': '資產', 'purchaseAmount': 10000, 'amortizationStatus': '已攤提'
    },
    { 'shareCode': '1A2323002001', 'itemCode': '1A2323001001/1F', 'purchaseDate': '2014/12/31', 'derditDate': '2014/12/31',
      'assetType': '資產', 'purchaseAmount': 20000, 'amortizationStatus': '已攤提'
    },
    { 'shareCode': '1A2323003001', 'itemCode': '1A2323001001/2F', 'purchaseDate': '2014/12/31', 'derditDate': '2014/12/31',
      'assetType': '列管品', 'purchaseAmount': 20000, 'amortizationStatus': '已攤提'
    },
  ];
  columns: any[]= [
    { field: 'shareCode', header: '攤提代號', visible: true },
    { field: 'itemCode', header: '品項編號', visible: true },
    { field: 'purchaseDate', header: '購入日期', visible: true },
    { field: 'derditDate', header: '入帳日期', visible: true },
    { field: 'assetType', header: '資產類型', visible: true },
    { field: 'purchaseAmount', header: '購入金額', visible: true },
    { field: 'amortizationStatus', header: '攤提狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  itemCodeOptions:any[] = [];
  assetsStatusOptions: any[] = [];
  assetTypeOptions: any[] = [];
  accountingCodeOptions: any[] = [];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];
  filterOptions: any[] = [
    { value: 1, label: '已設定攤提' },
    { value: 2, label: '未設定攤提' },
  ];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private itemCodeService: ItemCodeService,
    private assetStatusService: AssetStatusService,
    private assetsTypeService: AssetsTypeService,
    private needPayTicketService: NeedPayTicketService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310024';
    this.cruPage = '/ASS1000/ASS13090CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.itemCodeOptions = data;
    });
    //
    this.assetStatusService.getAssetStatus().subscribe(data => {
      this.assetsStatusOptions = data;
    });
    //
    this.assetStatusService.getAssetStatus().subscribe(data => {
      this.assetTypeOptions = data;
    });
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.accountingCodeOptions = data;
    });
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;
    this.messageService.blockUi();

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
    this.messageService.unblockUi();
  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
  // ----------------------------------------------------------------
  onCreate() {
    if (this.canAdd()) {
      this.navigateWithState(this.router, CRUDStatus.Create, null, this.cruPage);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(this.router, CRUDStatus.Edit, data, this.cruPage);
    }
  }

  onDetail(data: any) {
    this.navigateWithState(this.router, CRUDStatus.Read, data, this.cruPage);
  }
}
