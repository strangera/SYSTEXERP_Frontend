import { PurchaseTypeService } from './../../../service/basic/purchase-type.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
//

//3.1.3.5  移轉交接表
@Component({
  selector: 'app-ass13050',
  templateUrl: './ass13050.component.html',
  styleUrl: './ass13050.component.scss'
})
export class ASS13050Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    transferDate: [, [Validators.required]], // 移轉日期
    newStorage_Unit: [, [Validators.required]], // 新保管單位
    newStorage_Person: [''], // 新保管人
    newUsage_Unit: [, [Validators.required]], // 新保管單位
    newUsage_Person: [''], // 新使用人
    //
    purchaseType: [[] as number[]], // 進貨類型
    bigCategoryCode: [], // 大分類編號
    propertyCode: [], // 財產編號
    midCategoryCode: [], // 中分類編號
    tiltle: [1, []], // 標題
    smlCategoryCode: [], // 小分類編號
    //
    keeperUnit: [], // 保管單位
    keeper: [], // 保管人
    userUnit: [], // 使用單位
    user: [], // 使用人
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
    // { 'name': 'Emily', 'age': 28, 'email': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '項目(財產編號)', visible: true },
    { field: 'col2', header: '項目(品項)', visible: true },
    { field: 'col3', header: '項目(數量)', visible: true },
    { field: 'col4', header: '項目(單位)', visible: true },
    { field: 'col5', header: '確定交接', visible: true },

    { field: 'col6', header: '原保管(保管單位)', visible: true },
    { field: 'col7', header: '原保管(保管人)', visible: true },
    { field: 'col8', header: '原保管(使用單位	)', visible: true },
    { field: 'col9', header: '原保管(使用人)', visible: true },

    { field: 'col10', header: '新保管(保管單位)', visible: true },
    { field: 'col11', header: '新保管(保管人)', visible: true },
    { field: 'col12', header: '新保管(使用單位)', visible: true },
    { field: 'col13', header: '新保管(使用人)', visible: true },

    { field: 'col14', header: '資產狀態', visible: true },
    { field: 'col15', header: '原始取得金額', visible: true },
    { field: 'col16', header: '備註', visible: true },

    // { field: 'col17', header: '報廢日期前之帳面價值', visible: true },
    // { field: 'col18', header: '報廢損失', visible: true },

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
  purchaseTypeOptions: any[] = [];
  titleOptions: any[] = [
    { value: 1, label: '交接' },
    { value: 2, label: '移轉' },
  ];
  organizationOptions: any[] = [];
  userCodeOptions: any[] = [];
  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private purchaseTypeService: PurchaseTypeService,
    private organizationNumberService: OrganizationNumberService,
    private userCodeService: UserCodeService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310020';
    this.cruPage = '/ASS1000/ASS13050CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.purchaseTypeService.getPurchaseTypes().subscribe(data => {
      this.purchaseTypeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.userCodeOptions = data;
    });
    //
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
