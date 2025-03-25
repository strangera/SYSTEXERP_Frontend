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

//1.3.4.1 應收帳款明細表 
@Component({
  selector: 'app-fin34010',
  templateUrl: './fin34010.component.html',
  styleUrl: './fin34010.component.scss'
})
export class FIN34010Component extends BasicQpageComponent implements OnInit{
  //
  queryForm = this.formBuilder.group({
    startFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    endFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    startEstablishDate: [], // 立帳日期
    endEstablishfDate: [], // 立帳日期
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
    { field: 'col2', header: '廠客名稱', visible: true },
    { field: 'col3', header: '科目名稱', visible: true },
    { field: 'col4', header: '立帳日期', visible: true },
    { field: 'col5', header: '帳款金額', visible: true },
    { field: 'col6', header: '收/付款金額	', visible: true },
    { field: 'col7', header: '調整金額', visible: true },
    { field: 'col8', header: '未收/付金額', visible: true },
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
    this.ProgNo = '130007';
    this.cruPage = '/FIN3000/FIN34010CRU';
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
