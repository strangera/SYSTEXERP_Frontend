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
import { UserCodeService } from '../../../service/basic/user-code.service';
import { PaymentMethodService } from '../../../service/basic/payment-method.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { RadiobuttonComponent } from '../../../shared/componentkit/radiobutton/radiobutton.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//3.1.1.7 備用供應商資料維護作業
@Component({
  selector: 'app-ass11070',
  templateUrl: './ass11070.component.html',
  styleUrl: './ass11070.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, RadiobuttonComponent, InputTextComponent, InputNumberComponent, InputNumberRangeComponent, EditorTextComponent, TableComponent, TranslateModule]
})
export class ASS11070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    startdate: [], // 建檔日期
    enddate: [], // 建檔日期
    receptionPerson: [[] as number[]], // 接洽人員
    vendorUID: [[] as number[]], // 廠商統一編號
    bussinessModel: [1, []], // 營運模式
    vendorCName: ['', [Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    //
    contactPerson: ['', [Validators.maxLength(60)]], // 聯絡人
    contactPhone: [, [Validators.maxLength(15)]], // 聯絡人電話(O)
    contactTitle: ['', [Validators.maxLength(60)]], // 聯絡人職稱
    contactFax: [, [Validators.maxLength(60)]], // 聯絡人傳真
    contactCellphone: [, [Validators.maxLength(10)]], // 聯絡人行動電話
    contactEmail: ['', [Validators.maxLength(100)]], // 聯絡人電子郵件
    //
    companyAddress: ['', [Validators.maxLength(100)]], // 公司地址
    companyResponsibility: ['', [Validators.maxLength(60)]], // 公司負責人
    //
    paymentMethod: [1, []], // 付款方式
    startserialticket: [, [this.validationService.numberValidator]], // 票期
    endserialticket: [, [this.validationService.numberValidator]], // 票期
    services: ['', [Validators.maxLength(100)]], // 服務項目
    //
    remark: [,], // 備註
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
    {
      'startdate': '2024/01/01', 'receptionPerson': 1, 'vendorUID': 1, 'vendorCName': 'A廠商', 'vendorEName': 'A manufactory',
      'contactPerson': 'B先生', 'contactTitle': 'B職稱', 'contactPhone': '062000000', 'contactCellphone': '0911111111', 'contactEmail': 'abc@gmail.com',
      'contactFax': '111111111', 'companyResponsibility': 'C負責人', 'companyAddress': 'C地址', 'paymentMethod': 2, 'bussinessModel': 2,
      'startserialticket': 100, 'remark': 'G',
    },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'startdate', header: '建檔日期', visible: true },
    { field: 'receptionPerson', header: '接洽人員', visible: false },
    { field: 'vendorUID', header: '廠商統一編號', visible: true },
    { field: 'vendorCName', header: '廠商名稱', visible: true },
    { field: 'vendorEName', header: '廠商名稱(英文)', visible: false },

    { field: 'contactPerson', header: '聯絡人', visible: true },
    { field: 'contactTitle', header: '聯絡人職稱', visible: false },
    { field: 'contactPhone', header: '聯絡人電話(O)', visible: true },
    { field: 'contactCellphone', header: '聯絡人行動電話', visible: true },
    { field: 'contactEmail', header: '聯絡人電子郵件', visible: false },
    { field: 'contactFax', header: '聯絡人傳真', visible: false },

    { field: 'companyResponsibility', header: '公司負責人', visible: false },
    { field: 'companyAddress', header: '公司地址', visible: false },

    { field: 'paymentMethod', header: '付款方式', visible: false },
    { field: 'bussinessModel', header: '營運模式', visible: false },

    { field: 'startserialticket', header: '票期', visible: false },
    { field: 'remark', header: '備註', visible: false },
    // { field: 'col18', header: '訂貨傳真', visible: true },

    // { field: 'col19', header: '工廠地址', visible: true },
    // { field: 'col20', header: '工廠電話', visible: true },
    // { field: 'col21', header: '工廠傳真', visible: true },

    // { field: 'col22', header: '送貨方式', visible: true },
    // { field: 'col23', header: '退貨處理方式', visible: true },
    // { field: 'col24', header: '廠商送貨期限', visible: true },

    // { field: 'col25', header: '附註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  receptionPersonOptions: any[] = [];
  vendorUIDOptions: any[] = [];
  bussinessOptions: any[] = [
    { value: 1, label: '工廠直銷' },
    { value: 2, label: '代理商' },
    { value: 3, label: '經銷商' },
    { value: 4, label: '零售連鎖' },
    { value: 5, label: '零售一般' },
  ];
  paymentMethodOptions: any[] = [];
  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private userCodeService: UserCodeService,
    private vendorService: VendorService,
    private paymentMethodService: PaymentMethodService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310007';
    this.cruPage = '/ASS1000/ASS11070CRU';
    //

    //
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.receptionPersonOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.vendorUIDOptions = data;
    });
    //
    this.paymentMethodService.getSystemTypes().subscribe(data => {
      this.paymentMethodOptions = data;
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
