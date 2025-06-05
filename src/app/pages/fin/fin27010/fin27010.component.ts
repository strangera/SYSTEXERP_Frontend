import { WhetherService } from './../../../service/basic/whether.service';
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

//1.2.7.1 產生開票付款資料
@Component({
  selector: 'app-fin27010',
  templateUrl: './fin27010.component.html',
  styleUrl: './fin27010.component.scss'
})
export class FIN27010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    transferSource: [], //開票來源單號
    buildDateFrom: [], // 建立日期
    buildDateTo: [], // 建立日期
    settlementDateFrom: [], // 預計收/付款日
    settlementDateTo: [], // 預計收/付款日
    form: [[] as number[]], // 是否形成開票
    ticketNumber: [, [Validators.maxLength(12)]], // 開票單號
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
    { field: 'col1', header: '開票來源單號', visible: true },
    { field: 'col2', header: '建立日期', visible: true },
    { field: 'col3', header: '預計收/付款日', visible: true },
    { field: 'col4', header: '是否形成開票', visible: true },
    { field: 'col5', header: '開票單號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  transferSourceOptions: any[] = [
    { value: 1, label: 'D20140106001/2014/0106/Y' },
    { value: 2, label: 'D20140106002/2014/0106/Y' },
    { value: 3, label: 'D20140106003/2014/0106/Y' },
  ];

  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private whetherService: WhetherService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120020';
    this.cruPage = '/FIN2000/FIN27010CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;

      // 全選填入
      // let allSystemValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   form: allSystemValues
      // });
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
