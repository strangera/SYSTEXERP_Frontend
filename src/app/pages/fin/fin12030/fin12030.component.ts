import { InvoiceStatusService } from './../../../service/basic/invoice-status.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { AuthService } from '../../../service/system/auth.service';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
//
import { AllInvoiceCategoryService } from './../../../service/basic/all-invoice-category.service';
import { CounterCodeService } from './../../../service/basic/counter-code.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarComponent } from '../../../shared/componentkit/calendar/calendar.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';

//1.1.2.3 發票狀況明細查詢
@Component({
    selector: 'app-fin12030',
    templateUrl: './fin12030.component.html',
    styleUrl: './fin12030.component.scss',
    standalone: true,
    imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, DropdownComponent, InputTextComponent, InputNumberComponent, InputNumberRangeComponent, CalendarRangeComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN12030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    twodatemm: [], // 發票年月
    onedatemm: [], // 申報年月
    invoiceType: [], // 發票類別
    wordTrack: ['', [Validators.maxLength(2)]], // 字軌
    registerID: [], // 收銀機號
    serialInvoice: [, [Validators.maxLength(8)]], // 發票號碼
    startserialInvoice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(起)
    endserialInvoice: [, [this.validationService.numberValidator, Validators.maxLength(8)]], // 發票號碼(迄)
    recruitingUnit: ['', [Validators.maxLength(6)]], // 領用單位
    startReceiveDate: [], // 領用日期
    endReceiveDate: [], // 領用日期
    startReturnDate: [], // 繳回日期
    endReturnDate: [], // 繳回日期
    usageStatus: [[] as number[]], // 發票狀態
    returnRegister: [], // 繳回機台
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
  invoiceTypeOptions: any[] = [];
  registerIDOptions: any[] = [];
  usageStatusOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private allInvoiceCategoryService: AllInvoiceCategoryService,
    private counterCodeService: CounterCodeService,
    private invoiceStatusService: InvoiceStatusService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '110012';
    this.cruPage = '/FIN1000/FIN12030CRU';
    //
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    //
    this.allInvoiceCategoryService.getAllInvoiceCategorys().subscribe(data => {
      this.invoiceTypeOptions = data;
    });
    //
    this.counterCodeService.getCounterCodes().subscribe(data => {
      this.registerIDOptions = data;
    });
    //
    this.invoiceStatusService.getInvoiceStatus().subscribe(data => {
      this.usageStatusOptions = data;

      // 全選填入
      // let allSystemValues = this.usageStatusOptions.map(system => system.value);
      // this.queryForm.patchValue({
      //   usageStatus: allSystemValues
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
