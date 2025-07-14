import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//1.1.5.3 形成申報書
@Component({
  selector: 'app-fin15030',
  templateUrl: './fin15030.component.html',
  styleUrl: './fin15030.component.scss'
})
export class FIN15030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    declareType: [, [Validators.required]], // 	申報書種類
    declareYm: [, [Validators.required]], // 	申報年月
    taxNumber: [, [Validators.required]], // 	稅籍編號
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
    { field: 'col1', header: '申報年月', visible: true },
    { field: 'col2', header: '申報書種類', visible: true },
    { field: 'col3', header: '進貨總金額之進貨及費用', visible: true },
    { field: 'col4', header: '進貨總金額之固定資產', visible: true },
    { field: 'col5', header: '進口免稅貨物', visible: true },
    { field: 'col6', header: '購買國外勞務給付額', visible: true },
    { field: 'col7', header: '上期(月)累積留扺稅額	', visible: true },
    { field: 'col8', header: '專案退稅金額(調整金額)', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  declareTypeOptions: any[] = [
    { value: 1, label: 401 },
    { value: 2, label: 403 },
  ];

  taxNumberOptions: any[] = [
    { value: 1, label: 701702007 },
    { value: 2, label: 703902223 },
  ];


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110029';
    this.cruPage = '/FIN1000/FIN15030CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
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
