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

//1.1.3.1 專櫃發票轉媒體作業
@Component({
  selector: 'app-fin13010',
  templateUrl: './fin13010.component.html',
  styleUrl: './fin13010.component.scss'
})
export class FIN13010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    onedatemm: [, [Validators.required]], // 申報年月
    startSalesDate: [, [Validators.required]], // 領用日期
    endSalesDate: [, [Validators.required]], // 領用日期
    taxNumber: [, [Validators.required]], // 稅籍編號
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
    { field: 'col2', header: '申報年月', visible: true },
    { field: 'col3', header: '類別', visible: true },
    { field: 'col4', header: '字軌', visible: true },
    { field: 'col5', header: '發票號碼(起)', visible: true },
    { field: 'col6', header: '發票號碼(迄)', visible: true },
    { field: 'col7', header: '領用機號', visible: true },
    { field: 'col8', header: '領用單位', visible: true },
    { field: 'col9', header: '領用日期', visible: true },
    { field: 'col10', header: '繳回機台', visible: true },
    { field: 'col11', header: '繳回日期', visible: true },
    { field: 'col12', header: '發票狀態', visible: true },
    { field: 'col13', header: '裝箱箱號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  taxNumberOptions: any[] = [
    { value: 1, label: '701702007' },
    { value: 2, label: '703902223' },
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
    this.ProgNo = '110013';
    this.cruPage = '/FIN1000/FIN13010CRU';
    //
    // ----------------------------------------------------------------
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
