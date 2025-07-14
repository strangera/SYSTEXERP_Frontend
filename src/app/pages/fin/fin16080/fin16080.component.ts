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

//1.1.6.8 媒申核對報表
@Component({
  selector: 'app-fin16080',
  templateUrl: './fin16080.component.html',
  styleUrl: './fin16080.component.scss'
})
export class FIN16080Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    declareYm: [, [Validators.required]], // 	申報年月
    startdate: [, [Validators.required]], // 銷售日期
    enddate: [, [Validators.required]], // 銷售日期
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
    { field: 'col1', header: '折扣別報表(A)', visible: true },
    { field: 'col2', header: 'A-(B-B2)', visible: true },
    { field: 'col3', header: '日結傳票(B)', visible: true },
    { field: 'col4', header: '已開券類溢收', visible: true },
    { field: 'col5', header: '(B+B1)-(C+C2)-C3', visible: true },
    { field: 'col6', header: '型態別報表(C)', visible: true },
    { field: 'col7', header: '無發票號碼(C1)', visible: true },
    { field: 'col8', header: '已開支付(C2)', visible: true },
    { field: 'col9', header: '--(C3)', visible: true },
    { field: 'col10', header: '(C-C1)-D', visible: true },
    { field: 'col11', header: '二電/二收/二手(D)', visible: true },
    { field: 'col12', header: '三電/三手(D)', visible: true },
    { field: 'col13', header: '二收跨日作廢(D)', visible: true },
    { field: 'col14', header: '二收退貨(D)', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------

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
    this.ProgNo = '110038';
    this.cruPage = '/FIN1000/FIN16080CRU';
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
