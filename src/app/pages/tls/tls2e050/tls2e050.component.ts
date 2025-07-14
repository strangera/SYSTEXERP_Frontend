import { OrderService } from './../../../service/basic/order.service';
import { PayDayService } from './../../../service/basic/pay-day.service';
import { WhetherService } from './../../../service/basic/whether.service';
import { IndustryTypeService } from './../../../service/basic/industry-type.service';
import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { FloorService } from './../../../service/basic/floor.service';
import { CounterCodeService } from './../../../service/basic/counter-code.service';
import { SettlementMethodService } from './../../../service/basic/settlement-method.service';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
// Permissions
import { FunsrightInfo, PermissionsInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';

import { ValidationService } from '../../../shared/service/validation.service';
import { CommissionTypeService } from '../../../service/basic/commission-type.service';
import { CooperationMethodService } from '../../../service/basic/cooperation-method.service';

// 2.2.14.5 專櫃帳款試算彙總表
@Component({
  selector: 'app-tls2e050',
  templateUrl: './tls2e050.component.html',
  styleUrl: './tls2e050.component.scss'
})
export class TLS2E050Component {
  ProgNo: string = '220074';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    startdate: [], // 查詢年月
    enddate: [], // 查詢年月
    checkout: [], // 結帳方式
    vendorID: [], // 廠商編號
    counterID: [], // 專櫃編號
    organizationCode: [], // 組織代碼
    commissionMethod: [], // 抽成方式
    floor: [], // 樓層
    industry: [], // 大分類 / 中分類
    vendorInvoice: [[] as number[]], // 是否使用業主發票
    showAccount: [,], // 只顯示應付帳款小於0
    showStock: [,], // 只顯示進貨總額小於0
    net: [,], // 是否NET
    payDay: [], // 結帳後n天付款
    category: [[] as number[]], // 類別
    order: [1, []], // 排序方式
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    // { contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    // { contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    // { contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'contactPerson', header: '廠編', visible: true },
    { field: 'contactDate', header: '廠商名稱', visible: true },
    { field: 'UID', header: '專櫃編號', visible: true },
    { field: 'industryType', header: '櫃位名稱', visible: true },
    { field: 'category', header: '抽成方式', visible: true },
    { field: 'version', header: '結帳年月', visible: true },
    { field: 'rentNumber', header: '大分類', visible: true },
    { field: 'progress', header: '結算方式', visible: true },
    { field: 'col1', header: '結算方式', visible: true },
    { field: 'col2', header: '帳次', visible: true },
    { field: 'col3', header: '付款期限(天數)', visible: true },
    { field: 'col4', header: '銷貨淨額(應稅)', visible: true },
    { field: 'col5', header: '銷貨淨額(免稅)', visible: true },
    { field: 'col6', header: '銷貨淨額(稅額)', visible: true },
    { field: 'col7', header: '抽成額(應稅)	', visible: true },
    { field: 'col8', header: '抽成額(免稅)', visible: true },
    { field: 'col9', header: '抽成額(稅額)', visible: true },
    { field: 'col10', header: '進貨(應稅)', visible: true },
    { field: 'col11', header: '進貨(免稅)', visible: true },
    { field: 'col12', header: '進項稅額', visible: true },
    { field: 'col13', header: '進貨總額(含稅)', visible: true },
    { field: 'col14', header: '應收帳款(代扣未稅(開立))', visible: true },
    { field: 'col15', header: '應收帳款(代扣稅額)', visible: true },
    { field: 'col16', header: '應收帳款(代扣金額(不開立))', visible: true },
    { field: 'col17', header: '應收帳款(租金未稅)', visible: true },
    { field: 'col18', header: '應收帳款(租金稅額)', visible: true },
    { field: 'col19', header: '應收帳款(應收合計)', visible: true },
    { field: 'col20', header: '包底抽成不足(含稅)', visible: true },
    { field: 'col21', header: '應付帳款(含稅)', visible: true },

    // 其他欄位
  ];
  // ----------------------------------------------------------------
  checkoutOptions: any[] = [];
  counterNameOptions: any[] = [];
  commissionMethodOptions: any[] = [];
  floorOptions: any[] = [];
  organizationCodeOptions: any[] = [];
  industryOptions: any[] = [];
  vendorInvoiceOptions: any[] = [];
  payDayOptions: any[] = [];
  categoryOptions: any[] = [];
  orderOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    private settlementMethodService: SettlementMethodService,
    private counterCodeService: CounterCodeService,
    private commissionTypeService: CommissionTypeService,
    private floorService: FloorService,
    private organizationNumberService: OrganizationNumberService,
    private industryTypeService: IndustryTypeService,
    private whetherService: WhetherService,
    private payDayService: PayDayService,
    private cooperationMethodService: CooperationMethodService,
    private orderService: OrderService,
  ) {
  }

  ngOnInit(): void {
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.settlementMethodService.getSettlementMethods().subscribe(data => {
      this.checkoutOptions = data;
    });
    //
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.counterNameOptions = data;
    });
    //
    this.commissionTypeService.getCommissionTypes().subscribe(data => {
      this.commissionMethodOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationCodeOptions = data;
    });
    //
    this.floorService.getFloors().subscribe(data => {
      this.floorOptions = data;
    });
    //
    this.industryTypeService.getSystemTypes().subscribe(data => {
      this.industryOptions = data;
    });
    //
    this.payDayService.getSystemTypes().subscribe(data => {
      this.payDayOptions = data;
    });
    //
    this.orderService.getSystemTypes().subscribe(data => {
      this.orderOptions = data;
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.vendorInvoiceOptions = data;

      // 全選填入
      // let allSystemValues = this.vendorInvoiceOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   vendorInvoice: allSystemValues
      // });
    });
    //
    this.cooperationMethodService.getCooperationMethods().subscribe(data => {
      this.categoryOptions = data;

      // 全選填入
      // let allSystemValues = this.categoryOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   category: allSystemValues
      // });
    });
  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return true;
  }
  canAdd(): boolean {
    return true;
  }
  canEdit(): boolean {
    return true;
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
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    console.log(crudstatus);

    this.router.navigate(['/TLS2000/TLS2E050CRU'], extras);
  }
}
