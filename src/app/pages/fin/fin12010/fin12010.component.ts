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
import { UsageTypeService } from './../../../service/basic/usage-type.service';

@Component({
  selector: 'app-fin12010',
  templateUrl: './fin12010.component.html',
  styleUrl: './fin12010.component.scss'
})

//1.1.2.1 電子式發票各系統配號維護
export class FIN12010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    twodatemm: [], // 發票年月
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    startserialInvoice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(起)
    endserialInvoice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(迄)
    usageType: [[] as number[]], // 使用別
    usageStatus: [], // 使用狀態
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
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '發票年月', visible: true },
    { field: 'col2', header: '字軌', visible: true },
    { field: 'col3', header: '發票號碼(起)', visible: true },
    { field: 'col4', header: '發票號碼(迄)', visible: true },
    { field: 'col5', header: 'NEXT發票配號號碼', visible: true },
    { field: 'col6', header: '使用別', visible: true },
    { field: 'col7', header: '使用狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  usageTypeOptions: any[] = [];
  usageStatusOptions: any[] = [
    { value: 1, label: '使用完' },
    { value: 2, label: '未使用完' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private usageTypeService: UsageTypeService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110010';
    this.cruPage = '/FIN1000/FIN12010CRU';
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.usageTypeService.getSystemTypes().subscribe(data => {
      this.usageTypeOptions = data;

      // 全選填入
      // let allSystemValues = this.usageTypeOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   usageType: allSystemValues
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
  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }
}
