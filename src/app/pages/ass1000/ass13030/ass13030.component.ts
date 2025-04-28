import { AssetsTypeService } from './../../../service/basic/assets-type.service';
import { AssetStatusService } from './../../../service/basic/asset-status.service';
import { SharedCodeService } from './../../../service/basic/shared-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ItemCodeService } from '../../../service/basic/item-code.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { NeedPayTicketService } from '../../../service/basic/need-pay-ticket.service';
import { VendorService } from '../../../service/basic/vendor.service';
//

//3.1.3.3 資產報廢作業
@Component({
  selector: 'app-ass13030',
  templateUrl: './ass13030.component.html',
  styleUrl: './ass13030.component.scss'
})
export class ASS13030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    shareCode: [], // 攤提代號
    assetsCode: [], // 資產編號
    purchaseDateFrom: [], // 購入日期
    purchaseDateTo: [], // 購入日期
    assetStatus: [[] as number[]], // 資產狀態
    keeper: [], // 保管人
    keeperUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 使用單位
    assetType: [[] as number[]], // 資產類型
    accountingCode: [], // 會計科目代號
    supplierCode: [], // 供應商編號
    purchaseAmountFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 購入金額
    purchaseAmountTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 購入金額
    orderNumber: [], // 驗收單號
    entryDateFrom: [], // 入帳日期
    entryDateTo: [], // 入帳日期
    outofLimit: [,], // 已達耐用年限
    displayNumber: [, [this.validationService.numberValidator, Validators.maxLength(160)]], // 	顯示筆數
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
    {
      'shareCode': '1A232300010001', 'assetsCode': '1A232300010001', 'itemCode': '1A232300010001/B1', 'entryDateFrom': '2014/12/31', 'assetStatus': '報修',
      'keeper': '楊先生', 'supplierCode': '/', 'purchaseAmountFrom': 85000000, 'purchaseCode': '', 'depreciationDue': '201912',
    },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'shareCode', header: '攤提代號', visible: true },
    { field: 'assetsCode', header: '資產編號', visible: true },
    { field: 'itemCode', header: '品項編號', visible: true },
    { field: 'entryDateFrom', header: '入賬日期', visible: true },
    { field: 'assetStatus', header: '資產狀態', visible: true },

    { field: 'keeper', header: '保管人', visible: true },
    { field: 'supplierCode', header: '供應商編號', visible: true },
    { field: 'purchaseAmountFrom', header: '購入金額', visible: true },
    { field: 'purchaseCode', header: '採購單號', visible: true },

    { field: 'depreciationDue', header: '折舊到期', visible: true },

    // { field: 'col19', header: '工廠地址', visible: true },
    // { field: 'col20', header: '工廠電話', visible: true },
    // { field: 'col21', header: '工廠傳真', visible: true },

    // { field: 'col22', header: '送貨方式', visible: true },
    // { field: 'col23', header: '退貨處理方式', visible: true },
    // { field: 'col24', header: '廠商送貨期限', visible: true },

    // { field: 'col25', header: '附註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  shareCodeOptions: any[] = [];
  assetsCodeOptions: any[] = [];
  assetsStatusOptions: any[] = [];
  userCodeOptions: any[] = [];
  organizationOptions: any[] = [];
  assetTypeOptions: any[] = [];
  accountingCodeOptions: any[] = [];
  supplierCodeOptions: any[] = [];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private sharedCodeService: SharedCodeService,
    private itemCodeService: ItemCodeService,
    private assetStatusService: AssetStatusService,
    private usercodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
    private assetsTypeService: AssetsTypeService,
    private needPayTicketService: NeedPayTicketService,
    private vendorService: VendorService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310018';
    this.cruPage = '/ASS1000/ASS13030CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.sharedCodeService.getSharedCode().subscribe(data => {
      this.shareCodeOptions = data;
    });
    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.assetsCodeOptions = data;
    });
    //
    this.assetStatusService.getAssetStatus().subscribe(data => {
      this.assetsStatusOptions = data;
    });
    //
    this.usercodeService.getUserCode().subscribe(data => {
      this.userCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;
    });
    //
    this.assetsTypeService.getAssetsTypes().subscribe(data => {
      this.assetTypeOptions = data;
    });
    //
    this.needPayTicketService.getNeedPayTickets().subscribe(data => {
      this.accountingCodeOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.supplierCodeOptions = data;
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
