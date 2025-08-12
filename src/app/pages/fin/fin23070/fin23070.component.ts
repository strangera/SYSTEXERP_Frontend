import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { VendorService } from '../../../service/basic/vendor.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.2.3.7 暫付款核銷報表
@Component({
  selector: 'app-fin23070',
  templateUrl: './fin23070.component.html',
  styleUrl: './fin23070.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarRangeComponent, InputNumberRangeComponent, MultiSelectComponent, RadiobuttonComponent, ButtonComponent, TranslateModule]
})
export class FIN23070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    prepaySheetNumber: [, [Validators.maxLength(13)]], // 預支單號
    requsetEmployee: [], //申請廠商/員工
    startRequestDate: [], //申請日期
    endRequestDate: [], //申請日期
    startWriteOffDate: [], //實際核銷日期
    endWriteOffDate: [], //實際核銷日期
    startAdvanceAmount: [, [this.validationService.numberValidator, Validators.max(9999999999)]], // 預支金額
    endAdvanceAmount: [, [this.validationService.numberValidator, Validators.max(9999999999)]], // 預支金額
    payoutMethod: [[] as number[]], //付款方式
    writeOffDetail: [1, []], // 顯示核銷明細

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
    { field: 'col1', header: '預支單號', visible: true },
    { field: 'col2', header: '預支金額', visible: true },
    { field: 'col3', header: '申請日期', visible: true },
    { field: 'col4', header: '預計核銷日', visible: true },
    { field: 'col5', header: '廠商代號', visible: true },
    { field: 'col6', header: '付款方式', visible: true },
    { field: 'col7', header: '匯款銀行代號', visible: true },
    { field: 'col8', header: '銀行帳號', visible: true },
    { field: 'col9', header: '帳戶名稱', visible: true },
    { field: 'col10', header: '票據禁止背書轉讓', visible: true },
    { field: 'col11', header: '票據抬頭', visible: true },
    { field: 'col12', header: '摘要', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  requsetEmployeeOptions: any[] = [];
  payoutMethodOptions: any[] = [
    { value: 1, label: '未結案' },
    { value: 2, label: '已結案' },
  ];
  writeOffDetailOptions: any[] = [
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
    private vendorService: VendorService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120013';
    this.cruPage = '/FIN2000/FIN23070CRU';
    //
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    //
    this.vendorService.getVendors().subscribe(data => {
      this.requsetEmployeeOptions = data;
    });
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
