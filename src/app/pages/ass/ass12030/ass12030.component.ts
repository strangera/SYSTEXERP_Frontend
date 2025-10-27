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
import { ItemCodeService } from './../../../service/basic/item-code.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { OrganizationNumberService } from '../../../service/basic/organization-number.service';
import { VendorService } from '../../../service/basic/vendor.service';
import { PaperStatusService } from '../../../service/basic/paper-status.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { AccordionModule } from 'primeng/accordion';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';


//3.1.2.3 採購申請作業
@Component({
  selector: 'app-ass12030',
  templateUrl: './ass12030.component.html',
  styleUrl: './ass12030.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, CalendarRangeComponent, InputNumberRangeComponent, MultiSelectComponent, TableComponent, TranslateModule]
})
export class ASS12030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    purchaseNumber: [, [this.validationService.numberValidator, Validators.maxLength(11)]], // 採購單號
    itemCode: [], // 品項編號
    applicantCode: [], // 申請人編號
    organizationNumber: [], // 部門代號
    applicationDateFrom: [], // 申請日期
    applicationDateTo: [], // 申請日期
    supplierCode: [], // 	供應商編號
    taxAmountFrom: [, [Validators.maxLength(8)]], // 稅額
    taxAmountTo: [, [Validators.maxLength(8)]], // 稅額
    noTaxAmountFrom: [, [Validators.maxLength(8)]], // 未稅總金額
    noTaxAmountTo: [, [Validators.maxLength(8)]], // 未稅總金額
    totalTaxAmountFrom: [, [Validators.maxLength(8)]], // 含稅總金額
    totalTaxAmountTo: [, [Validators.maxLength(8)]], // 含稅總金額
    paperStatus: [[] as number[]], // 採購單狀態
    reviewerCode: [], // 審核人編號
    reviewDateFrom: [], // 審核日期
    reviewDateTo: [], // 審核日期
    checkoutDateFrom: [], // 結帳日期
    checkoutDateTo: [], // 結帳日期
    storage: [], // 倉別
    printNumber: [, [Validators.required, Validators.maxLength(3)]], // 項次列印筆數
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
    { field: 'col1', header: '採購單號', visible: true },
    { field: 'col2', header: '申請人編號', visible: true },
    { field: 'col3', header: '部門代號', visible: true },
    { field: 'col4', header: '申請日期', visible: true },
    { field: 'col5', header: '供應商編號', visible: true },
    { field: 'col6', header: '稅額', visible: true },
    { field: 'col7', header: '未稅總金額', visible: true },
    { field: 'col8', header: '含稅總金額', visible: true },
    { field: 'col9', header: '採購單狀態', visible: true },
    { field: 'col10', header: '審核人編號', visible: true },
    { field: 'col11', header: '審核日期', visible: true },
    { field: 'col12', header: '結帳日期', visible: true },
    { field: 'col13', header: '說明', visible: true },

    // { field: 'col14', header: '付款方式', visible: true },
    // { field: 'col15', header: '營運模式', visible: true },
    // { field: 'col16', header: '票期', visible: true },
    // { field: 'col17', header: '備註', visible: true },
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
  itemCodeOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  organizationNumberOptions: any[] = [];
  supplierCodeOptions: any[] = [];
  paperStatusOptions: any[] = [];
  storageOptions: any[] = [
    { value: 1, label: '總公司' },
    { value: 2, label: '測試' },
  ];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
    private itemCodeService: ItemCodeService,
    private userCodeService: UserCodeService,
    private organizationNumberService: OrganizationNumberService,
    private vendorService: VendorService,
    private paperStatusService: PaperStatusService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310013';
    this.cruPage = '/ASS1000/ASS12030CRU';
    //

    //
    this.itemCodeService.getSystemTypes().subscribe(data => {
      this.itemCodeOptions = data;
    });
    //
    this.userCodeService.getUserCode().subscribe(data => {
      this.applicantCodeOptions = data;
    });
    //
    this.organizationNumberService.getOrganizationNumbers().subscribe(data => {
      this.organizationNumberOptions = data;
    });
    //
    this.vendorService.getVendors().subscribe(data => {
      this.supplierCodeOptions = data;
    });
    //
    this.paperStatusService.getSystemTypes().subscribe(data => {
      this.paperStatusOptions = data;
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
