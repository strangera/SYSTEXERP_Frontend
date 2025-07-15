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
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.2.9.12 應付帳款進項發票對應表
@Component({
    selector: 'app-fin29120',
    templateUrl: './fin29120.component.html',
    styleUrl: './fin29120.component.scss',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputTextComponent, InputNumberRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN29120Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    onedatemm: [, [Validators.required]], // 申報年月
    track: ['', [Validators.maxLength(2)]], // 字軌
    startFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    endFactoryID: [, [this.validationService.numberValidator, Validators.max(99999999999999)]], // 廠客代號
    startserialticket: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(起)
    endserialticket: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 發票號碼(迄)
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
    { field: 'col1', header: '傳票號碼', visible: true },
    { field: 'col2', header: '廠商統編', visible: true },
    { field: 'col3', header: '應付ID', visible: true },
    { field: 'col4', header: '付款日期', visible: true },
    { field: 'col5', header: '立帳日期', visible: true },
    { field: 'col6', header: '立帳金額', visible: true },
    { field: 'col7', header: '沖帳金額', visible: true },
    { field: 'col8', header: '發票號碼', visible: true },
    { field: 'col9', header: '發票日期', visible: true },
    { field: 'col10', header: '未稅金額	', visible: true },
    { field: 'col11', header: '稅額金額', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  dateTypeOptions: any[] = [
    { value: 1, label: '立帳日' },
    { value: 2, label: '預計立帳日' },
  ];
  expiredOptions: any[] = [
    { value: 1, label: '已到期' },
    { value: 2, label: '未到期' },
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
    this.ProgNo = '120035';
    this.cruPage = '/FIN2000/FIN29120CRU';
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
