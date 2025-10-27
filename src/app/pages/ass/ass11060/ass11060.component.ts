import { TransportationMethodService } from './../../../service/basic/transportation-method.service';
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
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
//

//3.1.1.6 供應商資料維護作業
@Component({
  selector: 'app-ass11060',
  templateUrl: './ass11060.component.html',
  styleUrl: './ass11060.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, InputTextComponent, MultiSelectComponent, CalendarRangeComponent, EditorTextComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class ASS11060Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    vendorId: [, [Validators.maxLength(12)]], // 廠商編號
    vendorUid: [, [Validators.maxLength(10)]], // 廠商統一編號
    vendorCName: ['', [Validators.maxLength(60)]], // 廠商名稱(中文)
    vendorEName: ['', [Validators.maxLength(60)]], // 廠商名稱(英文)
    vendorSName: ['', [Validators.maxLength(10)]], // 廠商簡稱
    invoiceAddress: ['', [Validators.maxLength(60)]], // 發票地址
    //
    principal: ['', [Validators.maxLength(12)]], // 負責人
    principalTitle: ['', [Validators.maxLength(16)]], // 負責人職稱
    principalUid: ['', [Validators.maxLength(10)]], // 負責人身份証字號
    principalPhone: [, [Validators.maxLength(15)]], // 負責人電話
    principalAddress: ['', [Validators.maxLength(100)]], // 負責人聯絡地址
    principalEmail: ['', [Validators.maxLength(60)]], // 負責人電子郵件
    //
    companyAddress: ['', [Validators.maxLength(100)]], // 公司登記地址
    companyPhone: [, [Validators.maxLength(15)]], // 公司登記電話
    companyFax: [, [Validators.maxLength(15)]], // 公司傳真
    //
    orderingAddress: ['', [Validators.maxLength(100)]], // 訂貨地址
    orderingPhone: [, [Validators.maxLength(12)]], // 訂貨電話
    orderingFax: [, [Validators.maxLength(12)]], // 訂貨傳真
    //
    factoryAddress: ['', [Validators.maxLength(100)]], // 工廠地址
    factoryPhone: [, [Validators.maxLength(12)]], // 工廠電話
    factoryFax: [, [Validators.maxLength(12)]], // 工廠傳真
    //
    deliveryMethod: [[] as number[]], // 送貨方式
    returnMethod: [[] as number[]], // 退貨處理方式
    //
    startDeliveryDate: [], // 廠商送貨期限
    endDeliveryDate: [], // 廠商送貨期限
    //
    remark: [,], // 附註
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
    { field: 'col1', header: '廠商編號', visible: true },
    { field: 'col2', header: '廠商統一編號', visible: true },
    { field: 'col3', header: '廠商名稱(中文)', visible: true },
    { field: 'col4', header: '廠商名稱(英文)', visible: true },
    { field: 'col5', header: '廠商簡稱', visible: true },
    { field: 'col6', header: '發票地址', visible: true },
    { field: 'col7', header: '負責人', visible: true },
    { field: 'col8', header: '負責人職稱', visible: true },
    { field: 'col9', header: '負責人身份証字號', visible: true },
    { field: 'col10', header: '負責人電話', visible: true },
    { field: 'col11', header: '負責人聯絡地址', visible: true },
    { field: 'col12', header: '負責人電子郵件', visible: true },

    { field: 'col13', header: '公司登記地址', visible: true },
    { field: 'col14', header: '公司登記電話', visible: true },
    { field: 'col15', header: '公司傳真', visible: true },

    { field: 'col16', header: '訂貨地址', visible: true },
    { field: 'col17', header: '訂貨電話', visible: true },
    { field: 'col18', header: '訂貨傳真', visible: true },

    { field: 'col19', header: '工廠地址', visible: true },
    { field: 'col20', header: '工廠電話', visible: true },
    { field: 'col21', header: '工廠傳真', visible: true },

    { field: 'col22', header: '送貨方式', visible: true },
    { field: 'col23', header: '退貨處理方式', visible: true },
    { field: 'col24', header: '廠商送貨期限', visible: true },

    { field: 'col25', header: '附註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  deliveryMethodOptions: any[] = [];
  returnMethodOptions: any[] = [
    { value: 1, label: '貨運' },
    { value: 2, label: '自取' },
    { value: 3, label: '其他' },
  ];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private transportationMethodService: TransportationMethodService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310006';
    this.cruPage = '/ASS1000/ASS11060CRU';
    //

    //
    this.transportationMethodService.getSystemTypes().subscribe(data => {
      this.deliveryMethodOptions = data;
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
