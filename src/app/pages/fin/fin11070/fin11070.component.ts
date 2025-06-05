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

@Component({
  selector: 'app-fin11070',
  templateUrl: './fin11070.component.html',
  styleUrl: './fin11070.component.scss'
})

//1.1.1.7 二聯式電子發票筆數核對表
export class FIN11070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
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
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col0', header: '交易日期', visible: true },
    { field: 'col1', header: '一般交易(A)	', visible: true },
    { field: 'col2', header: '作廢退貨(B)', visible: true },
    { field: 'col3', header: '註銷(C)', visible: true },
    { field: 'col4', header: '當日正負正(D)', visible: true },
    { field: 'col5', header: '跨日誤作廢(E)', visible: true },
    { field: 'col6', header: '一般交易(A-D)', visible: true },
    { field: 'col7', header: '(跨期)作廢退貨(B-D-E)', visible: true },
    { field: 'col8', header: '註銷', visible: true },
    { field: 'col9', header: '發票號碼是否重複', visible: true },
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
    this.ProgNo = '110007';
    this.cruPage = '/FIN1000/FIN11070CRU';
    //
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------

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
