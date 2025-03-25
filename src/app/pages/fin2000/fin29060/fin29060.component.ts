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

//1.2.9.6 廠商付款明細表
@Component({
  selector: 'app-fin29060',
  templateUrl: './fin29060.component.html',
  styleUrl: './fin29060.component.scss'
})
export class FIN29060Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    startFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    endFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    startBillDate:[], //立帳日期
    endBillDate:[], //立帳日期
    startTransferDate:[], //開票/匯款日期
    endTransferDate:[], //開票/匯款日期
    startSubjectID: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 科目代號
    endSubjectID: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 科目代號
    summary: ['', [Validators.maxLength(30)]], // 摘要
    noPay: [1, []], // 未付款是否顯示
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
    { field: 'col1', header: '廠商代號', visible: true },
    { field: 'col2', header: '廠商名稱	', visible: true },
    { field: 'col3', header: '應付帳款單號', visible: true },
    { field: 'col4', header: '科目代號', visible: true },
    { field: 'col5', header: '摘要', visible: true },
    { field: 'col6', header: '立帳日期', visible: true },
    { field: 'col7', header: '立帳金額', visible: true },
    { field: 'col8', header: '電匯/開票/單號', visible: true },
    { field: 'col9', header: '開票/匯款日期', visible: true },
    { field: 'col10', header: '傳票號碼', visible: true },
    { field: 'col11', header: '付款金額', visible: true },
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
    this.ProgNo = '120029';
    this.cruPage = '/FIN2000/FIN29060CRU';
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
