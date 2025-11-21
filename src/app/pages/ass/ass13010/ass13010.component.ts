import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { EditorTextComponent } from '../../../shared/componentkit/editor-text/editor-text.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

//3.1.3.1 資產維護作業
@Component({
  selector: 'app-ass13010',
  templateUrl: './ass13010.component.html',
  styleUrl: './ass13010.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, MultiSelectComponent, CalendarRangeComponent, InputNumberRangeComponent, EditorTextComponent, TableComponent, TranslateModule]
})
export class ASS13010Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    assetsCode: [, [this.validationService.numberValidator, Validators.maxLength(20)]], // 資產代號
    itemCode: [], // 品項編號
    original_assetsCode: [, [this.validationService.numberValidator, Validators.maxLength(20)]], // 原資產編號
    assetsStatus: [[] as number[]], // 品項編號
    assetsType: [[] as number[]], // 資產類型
    purchaseNumber: [], // 採購單號
    //
    purchaseDateFrom: [], // 購入日期
    purchaseDateTo: [], // 購入日期
    original_priceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 原購入金額
    original_priceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 原購入金額
    supplierCode: [], // 供應商編號
    //
    accounting_Borrow: [], // 所屬會計科目(借)
    accounting_Credit: [], // 所屬會計科目(貸)
    entryDateFrom: [], // 入帳日期
    entryDateTo: [], // 入帳日期
    //
    deviceCode: [, [Validators.maxLength(20)]], // 設備編號
    depreciation: [], // 折舊會計科目
    totalDepreciation: [], // 累計折舊科目
    //
    depreciationLifeFrom: [, [Validators.maxLength(8)]], // 折舊年限
    depreciationLifeTo: [, [Validators.maxLength(8)]], // 折舊年限
    residualFrom: [, [Validators.maxLength(8)]], // 預留殘值
    residualTo: [, [Validators.maxLength(8)]], // 預留殘值
    keepingPerson: [], // 保管人
    keepingUnit: [], // 保管單位
    user: [], // 使用人
    userUnit: [], // 保管單位
    //
    locationCode: [, [Validators.maxLength(10)]], // 位置編號
    maintenanceCode: [, [Validators.maxLength(11)]], // 維修合約編號
    disposalDateFrom: [], // 處份日期(變賣或報廢)
    disposalDateTo: [], // 處份日期(變賣或報廢)
    rentStatus: [[] as number[]], // 出借狀態
    //
    dispose_Manufacturers: [], // 處份廠商
    dispose_Manufacturers_Summons: [, [Validators.maxLength(12)]], // 處份傳票編號
    soldAmountFrom: [, [Validators.max(999999999999)]], // 變賣金額
    soldAmountTo: [, [Validators.max(999999999999)]], // 變賣金額
    displayNumber: [], // 顯示筆數
    //
    disposeRemark: [,], // 處份說明(變賣或報廢)
    remark: [,], // 說明
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
    { field: 'col1', header: '資產代號', visible: true },
    { field: 'col2', header: '品項編號', visible: true },
    { field: 'col3', header: '資產狀態', visible: true },

    { field: 'col4', header: '資產類型', visible: true },
    { field: 'col5', header: '採購單號', visible: true },
    { field: 'col6', header: '購入日期', visible: true },

    { field: 'col7', header: '購入金額', visible: true },
    { field: 'col8', header: '供應商編號', visible: true },

    { field: 'col9', header: '會計科目(借)', visible: true },
    { field: 'col10', header: '會計科目(貸)', visible: true },
    { field: 'col11', header: '入帳日期', visible: true },

    { field: 'col12', header: '設備編號', visible: true },
    { field: 'col13', header: '折舊會計科目', visible: true },
    { field: 'col14', header: '累計折舊科目', visible: true },

    { field: 'col15', header: '折舊年限', visible: true },
    { field: 'col16', header: '預留殘值', visible: true },

    { field: 'col17', header: '保管人', visible: true },
    { field: 'col18', header: '保管單位', visible: true },
    { field: 'col19', header: '使用人', visible: true },
    { field: 'col20', header: '使用單位', visible: true },

    { field: 'col21', header: '位置代號', visible: true },
    { field: 'col22', header: '維修合約編號', visible: true },

    { field: 'col23', header: '處份日期(變賣或報廢)', visible: true },
    { field: 'col24', header: '處份廠商', visible: true },
    { field: 'col25', header: '處份傳票編號', visible: true },

    { field: 'col26', header: '變賣金額', visible: true },
    { field: 'col27', header: '處份說明(變賣或報廢)', visible: true },
    { field: 'col28', header: '說明', visible: true },

    { field: 'col29', header: '攤提代號', visible: true },
    { field: 'col30', header: '原資產編號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  itemCodeOptions: any[] = [];
  assetsStatusOptions: any[] = [];
  assetsTypeOptions: any[] = [];
  orderNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410300002' },
    { value: 3, label: '201410300003' },
  ];
  supplierCodeOptions: any[] = [];

  depreciationOptions: any[] = [];
  applicantCodeOptions: any[] = [];
  rentStatusOptions: any[] = [
    { value: 1, label: '出借' },
    { value: 2, label: '部分歸還' },
    { value: 3, label: '全部歸還' },
  ];
  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310016';
    this.cruPage = '/ASS1000/ASS13010CRU';
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
