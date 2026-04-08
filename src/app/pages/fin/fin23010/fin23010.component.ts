import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
//

//1.2.3.1 暫付款申請作業
@Component({
  selector: 'app-fin23010',
  templateUrl: './fin23010.component.html',
  styleUrl: './fin23010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarRangeComponent, InputNumberRangeComponent, DropdownComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class FIN23010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    advanceSheetNumber: [, [Validators.maxLength(13)]], // 預支單號
    startRequestDate: [], //申請日期
    endRequestDate: [], //申請日期
    startAdvanceAmount: [, [this.validationService.numberValidator, Validators.max(9999999999)]], // 預支金額
    endAdvanceAmount: [, [this.validationService.numberValidator, Validators.max(9999999999)]], // 預支金額
    startWriteOffDate: [], //預計核銷日
    endWriteOffDate: [], //預計核銷日
    requsetEmployee: [], //申請廠商/員工
    payoutMethod: [[] as number[]], //付款方式
    transferAccount: [], //匯款銀行代號
    bankAccount: [, [Validators.maxLength(20)]], // 銀行帳號
    accountName: ['', [Validators.maxLength(64)]], // 帳戶名稱
    ticketTransfer: [[] as number[]], // 票據禁止背書轉讓
    ticketTitle: ['', [Validators.maxLength(20)]], // 票據抬頭
    startExpectPayDate: [], //預計付款日
    endExpectPayfDate: [], //預計付款日
    summary: ['', [Validators.maxLength(160)]], // 摘要
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
    { field: 'col1', header: '預支單號', visible: true },
    { field: 'col2', header: '預支金額', visible: true },
    { field: 'col3', header: '申請日期', visible: true },
    { field: 'col4', header: '預計核銷日', visible: true },
    { field: 'col5', header: '廠商編號', visible: true },
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

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private validationService: ValidationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120007';
    this.cruPage = '/FIN2000/FIN23010CRU';
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
