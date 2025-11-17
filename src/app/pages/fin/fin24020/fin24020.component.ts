import { WhetherService } from './../../../service/basic/whether.service';
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
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//1.2.4.2 保留款沖款維護
@Component({
  selector: 'app-fin24020',
  templateUrl: './fin24020.component.html',
  styleUrl: './fin24020.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarComponent, CalendarRangeComponent, InputNumberRangeComponent, MultiSelectComponent, InputTextComponent, TableComponent, TranslateModule]
})
export class FIN24020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    shouldPayID: [, [Validators.maxLength(14)]], // 應付ID
    factoryID: [], // 廠客代號
    onedatemm: [], // 年月
    accountCash: [, [Validators.maxLength(2)]], // 帳款帳次
    startRefundDate: [], // 退保留款日期
    endRefundDate: [], // 退保留款日期
    startRefundRetainer: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 退保留款金額
    endRefundRetainer: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 退保留款金額
    generatePayout: [[] as number[]], // 是否產生付款資料
    remark: ['', [Validators.maxLength(160)]], // 備註
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
    { field: 'col1', header: '應付ID', visible: true },
    { field: 'col2', header: '廠客代號', visible: true },
    { field: 'col3', header: '年月', visible: true },
    { field: 'col4', header: '帳次', visible: true },
    { field: 'col5', header: '退保留款日期', visible: true },
    { field: 'col6', header: '退保留款金額', visible: true },
    { field: 'col7', header: '是否產生付款資料', visible: true },
    { field: 'col8', header: '備註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  factoryIDOptions: any[] = [];
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private vendorService: VendorService,
    private whetherService: WhetherService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120015';
    this.cruPage = '/FIN2000/FIN24020CRU';
    //
    // ----------------------------------------------------------------
    //
    this.vendorService.getVendors().subscribe(data => {
      this.factoryIDOptions = data;
    });
    //
    this.whetherService.getWhetherOptions().subscribe(data => {
      this.whetherOptions = data;

      // 全選填入
      // let allSystemValues = this.whetherOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   generatePayout: allSystemValues
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
