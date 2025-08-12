import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.2.9.5 應付帳款明細表
@Component({
  selector: 'app-fin29050',
  templateUrl: './fin29050.component.html',
  styleUrl: './fin29050.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberRangeComponent, CalendarRangeComponent, RadiobuttonComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN29050Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    startFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠商代號
    endFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠商代號
    startBillDate: [], //立帳日期
    endBillDate: [], //立帳日期
    startShouldPay: [, [this.validationService.numberValidator, Validators.max(9999999999)]], // 應付金額
    endShouldPay: [, [this.validationService.numberValidator, Validators.max(9999999999)]], // 應付金額
    startSubjectID: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 科目代號
    endSubjectID: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 科目代號
    showUp: [1, []], // 帳款餘額為零是否顯示
    anyRemain: [1, []], // 未付金額是否包含保留款餘額
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
    // { 'name': 'Emily', 'age': 28, '電子信箱': 'emily@example.com', 'city': 'Kaohsiung' },
    // { 'name': 'Michael', 'age': 31, '電子信箱': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, '電子信箱': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'col1', header: '廠客代號', visible: true },
    { field: 'col2', header: '廠客名稱', visible: true },
    { field: 'col3', header: '摘要', visible: true },
    { field: 'col4', header: '立帳日期', visible: true },
    { field: 'col5', header: '傳票編號', visible: true },
    { field: 'col6', header: '應付金額', visible: true },
    { field: 'col7', header: '沖帳金額', visible: true },
    { field: 'col8', header: '保留款金額', visible: true },
    { field: 'col9', header: '沖保留款金額', visible: true },
    { field: 'col10', header: '未付金額', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  factoryIDOptions: any[] = [];
  showUpOptions: any[] = [
    { value: 1, label: '顯示全部' },
    { value: 2, label: '顯示負值' },
  ];
  statusOptions: any[] = [
    { value: 1, label: '作廢' },
    { value: 2, label: '未異動' },
    { value: 3, label: '到期' },
    { value: 4, label: '兌現' },
    { value: 5, label: '撤票' },
    { value: 6, label: '退票' },
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
    this.ProgNo = '120028';
    this.cruPage = '/FIN2000/FIN29050CRU';
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
