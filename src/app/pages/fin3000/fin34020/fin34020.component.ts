import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/enum/CRUDstatus';
import { NotificationService } from '../../../shared/service/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//

//1.3.4.2 客戶收款明細表 
@Component({
  selector: 'app-fin34020',
  templateUrl: './fin34020.component.html',
  styleUrl: './fin34020.component.scss'
})
export class FIN34020Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    startFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    endFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    startEstablishDate: [], // 立帳日期
    endEstablishfDate: [], // 立帳日期
    receive_Date_From: [], // 收款日期
    receive_Date_To: [], // 收款日期
    adjust_Date_From: [], // 調整日期
    adjust_Date_To: [], // 調整日期
    startSubjectID: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 科目代號
    endSubjectID: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 科目代號
    display: [1, []], // 應付金額是否顯示
    showUp: [1, []], // 帳款餘額為零是否顯示
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
    { field: 'col1', header: '廠客代號', visible: true },
    { field: 'col2', header: '客戶名稱', visible: true },
    { field: 'col3', header: '收/付', visible: true },
    { field: 'col4', header: '應收帳款單號', visible: true },
    { field: 'col5', header: '科目名稱', visible: true },
    { field: 'col6', header: '立帳日期	', visible: true },
    { field: 'col7', header: '預計收款日', visible: true },
    { field: 'col8', header: '立帳金額	', visible: true },
    { field: 'col9', header: '摘要', visible: true },
    { field: 'col10', header: '收/電/開/調整單號', visible: true },
    { field: 'col11', header: '收款日期	', visible: true },
    { field: 'col12', header: '傳票號碼	', visible: true },
    { field: 'col13', header: '調整/收款金額	', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  showUpOptions: any[] = [
    { value: 1, label: '顯示' },
    { value: 2, label: '不顯示' },
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
    this.ProgNo = '130008';
    this.cruPage = '/FIN3000/FIN34020CRU';
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
