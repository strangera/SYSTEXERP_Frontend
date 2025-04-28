import { OrganizationNumberService } from './../../../service/basic/organization-number.service';
import { UserCodeService } from './../../../service/basic/user-code.service';
import { ItemCodeService } from './../../../service/basic/item-code.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//3.1.2.1 請購申請作業
@Component({
  selector: 'app-ass12010',
  templateUrl: './ass12010.component.html',
  styleUrl: './ass12010.component.scss'
})
export class ASS12010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    storage: [], // 倉別
    demandNumber: [, [Validators.maxLength(12)]], // 需求單號
    itemCode: [], // 品項代碼
    applicantCode: [], // 申請人代號
    organizationNumber: [], // 部門代號
    requestDateFrom: [], // 需求日期
    requestDateTo: [], // 需求日期
    requestStatus: [[] as number[]], // 請購申請狀態
    addNumber: [, [Validators.required, Validators.maxLength(3)]], // 需求單號
    modifyNumber: [, [Validators.required, Validators.maxLength(3)]], // 修改筆數
    printNumber: [, [Validators.required, Validators.maxLength(3)]], // 項次列印筆數
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
    { field: 'col1', header: '倉別', visible: true },
    { field: 'col2', header: '需求單號', visible: true },
    { field: 'col3', header: '品項代碼', visible: true },
    { field: 'col4', header: '申請人代號', visible: true },
    { field: 'col5', header: '部門代號', visible: true },
    { field: 'col6', header: '需求日期', visible: true },
    { field: 'col7', header: '請購申請狀態', visible: true },
    // { field: 'col8', header: '新增筆數', visible: true },
    // { field: 'col9', header: '折舊科目(借)', visible: true },
    // { field: 'col10', header: '累計折舊科目(貸)', visible: true },
    // { field: 'col11', header: '折舊年限', visible: true },
    // { field: 'col12', header: '說明', visible: true },

    // { field: 'col13', header: '公司地址', visible: true },
    // { field: 'col14', header: '付款方式', visible: true },
    // { field: 'col15', header: '營運模式', visible: true },
    // { field: 'col16', header: '票期', visible: true },
    // { field: 'col17', header: '備註', visible: true },
    // { field: 'col18', header: '訂貨傳真', visible: true },

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
  storageOptions: any[] = [
    { value: 1, label: '總公司' },
    { value: 2, label: '測試' },
  ];
  requestStatusOptions: any[] = [
    { value: 1, label: '已申請' },
    { value: 2, label: '已審核' },
  ];
  itemCodeOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private itemCodeService: ItemCodeService,
    private userCodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310011';
    this.cruPage = '/ASS1000/ASS12010CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.itemCodeOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.applicantCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationNumberOptions = data;
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
