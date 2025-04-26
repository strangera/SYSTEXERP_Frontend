import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ItemCodeService } from '../../../service/basic/item-code.service';
import { PurchaseTypeService } from '../../../service/basic/purchase-type.service';
import { AssetStatusService } from '../../../service/basic/asset-status.service';
//

//3.1.5.2  財產保管清冊
@Component({
  selector: 'app-ass15020',
  templateUrl: './ass15020.component.html',
  styleUrl: './ass15020.component.scss'
})
export class ASS15020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    keepingDepartment: [], // 保管部門
    keepingPerson: [], // 保管人
    usageDepartment: [], // 使用部門
    usagePerson: [], // 使用人員
    //
    propertyCode: [], // 財產編號
    itemCode: [], // 品項編號
    propertyType: [], // 財產類型
    assetStatus: [], // 資產狀態
    purchaseDateFrom: [], // 購入日期
    purchaseDateTo: [], // 購入日期
    grouping: [1, []], // 群組分類
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
    { field: 'col1', header: '資產代號', visible: true },
    { field: 'col2', header: '財產名稱', visible: true },
    { field: 'col3', header: '設備編號', visible: true },
    { field: 'col4', header: '購入日期', visible: true },
    { field: 'col5', header: '資產狀態', visible: true },

    { field: 'col6', header: '保管單位', visible: true },
    { field: 'col7', header: '保管人', visible: true },
    { field: 'col8', header: '使用單位', visible: true },
    { field: 'col9', header: '使用人', visible: true },
    { field: 'col10', header: '原購入金額', visible: true },
    { field: 'col11', header: '備註', visible: true },

    // { field: 'col12', header: '購入金額', visible: true },
    // { field: 'col13', header: '驗收單號', visible: true },

    // { field: 'col14', header: '入帳日期', visible: true },
    // { field: 'col15', header: '條件篩選', visible: true },
    // { field: 'col16', header: '顯示筆數', visible: true },

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

  // bigCategoryCodeOptions: any[]=[
  //   { value: 1, label: 'A/裝潢工程' },
  //   { value: 2, label: 'B/其他工程' },
  //   { value: 3, label: 'C/電腦及電子零件產品' },
  //   { value: 4, label: 'D/電力及照明系統' },
  //   { value: 5, label: 'E/家電家具設備' },
  //   { value: 6, label: 'F/機消空電水零配件' },
  //   { value: 7, label: 'G/辦公及營運庶務' },
  //   { value: 8, label: 'K/印刷品(非廣告行銷)' },
  // ];
  keepingDepartmentOptions: any[] = [];
  keepingPersonOptions: any[] = [];
  propertyCodeOptions: any[] = [
    { value: 1, label: '1A23230000001000001' },
    { value: 2, label: '1A23230000002000001' },
    { value: 3, label: '1A23230000003000001' },
    { value: 4, label: '1A23230000004000001' },
    { value: 5, label: '1A23230000005000001' },
  ];
  itemCodeOptions: any[] = [];
  propertyTypeOptions: any[] = [];
  assetsStatusOptions: any[] = [];
  groupingOptions: any[] = [
    { value: 1, label: '保管部門' },
    { value: 2, label: '保管人員' },
    { value: 3, label: '品項編號' },
    { value: 4, label: '財產類型' },
  ];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private organizationNumberService: OrganizationNumberService,
    private userCodeService: UserCodeService,
    private itemCodeService: ItemCodeService,
    private purchaseTypeService: PurchaseTypeService,
    private assetStatusService: AssetStatusService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310033';
    this.cruPage = '/ASS1000/ASS15020CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.keepingDepartmentOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.keepingPersonOptions = data;
    });
    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.itemCodeOptions = data;
    });
    //
    this.purchaseTypeService.getPurchaseTypes().subscribe(data => {
      this.propertyTypeOptions = data;
    });
    //
    this.assetStatusService.getAssetStatus().subscribe(data => {
      this.assetsStatusOptions = data;
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
