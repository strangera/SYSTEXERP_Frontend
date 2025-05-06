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
//

//3.1.1.10 倉別設定作業
@Component({
  selector: 'app-ass11100',
  templateUrl: './ass11100.component.html',
  styleUrl: './ass11100.component.scss'
})
export class ASS11100Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    storageType: [, [Validators.maxLength(10)]], // 倉別
    storageName: ['', [Validators.maxLength(40)]], // 倉別名稱
    organizationNumber: [], // 部門代號
    remark: [,], // 備註
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
    { field: 'col2', header: '倉別名稱', visible: true },
    { field: 'col3', header: '部門代號', visible: true },
    { field: 'col4', header: '備註', visible: true },

    // { field: 'col5', header: '所屬會計科目(借)', visible: true },
    // { field: 'col6', header: '所屬會計科目(貸)', visible: true },
    // { field: 'col7', header: '進項稅額科目(借)', visible: true },
    // { field: 'col8', header: '費用科目', visible: true },
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
  organizationNumberOptions: any[] = [];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private organizationNumberService: OrganizationNumberService
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310010';
    this.cruPage = '/ASS1000/ASS11100CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe((data) => {
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
