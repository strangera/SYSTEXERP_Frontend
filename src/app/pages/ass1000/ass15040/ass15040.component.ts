import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { ItemCodeService } from '../../../service/basic/item-code.service';
//

//3.1.5.4 財產目錄之會計科目報表 
@Component({
  selector: 'app-ass15040',
  templateUrl: './ass15040.component.html',
  styleUrl: './ass15040.component.scss'
})
export class ASS15040Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    baseYYMM: [,[Validators.required]], // 基準日
    //
    keeperUnit: [], // 保管單位
    accountcode: [], // 會計科目代碼
    itemCode: [], // 品項編號
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
  columns: any[]= [
    { field: 'col1', header: '財產編號', visible: true },
    { field: 'col2', header: '品項編號', visible: true },
    { field: 'col3', header: '品項名稱', visible: true },

    { field: 'col4', header: '耐用年數', visible: true },
    { field: 'col5', header: '購入日期', visible: true },
    { field: 'col6', header: '取得成本', visible: true },
    { field: 'col7', header: '預留殘值', visible: true },

    { field: 'col8', header: '年初累計折舊', visible: true },
    { field: 'col9', header: '本期折舊金額', visible: true },
    { field: 'col10', header: '本月折舊金額', visible: true },
    { field: 'col11', header: '累計折舊金額', visible: true },

    { field: 'col12', header: '帳面價值', visible: true },
    { field: 'col13', header: '保管單位', visible: true },

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
  organizationOptions: any[] = [];
  AccountcodeOptions: any[] = [
    { value: 1, label: '1501' },
    { value: 2, label: '150101' },
    { value: 3, label: '1511' },
    { value: 4, label: '151101' },
    { value: 5, label: '1512' },
    { value: 6, label: '151201' },
    { value: 7, label: '1521' },
    { value: 8, label: '152101' },
    { value: 9, label: '1522' },
    { value: 10, label: '152201' },
  ];
  itemCodeOptions:any[] = [];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private organizationNumberService: OrganizationNumberService,
    private itemCodeService: ItemCodeService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310035';
    this.cruPage = '/ASS1000/ASS15040CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationOptions = data;
    });
    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.itemCodeOptions = data;
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
