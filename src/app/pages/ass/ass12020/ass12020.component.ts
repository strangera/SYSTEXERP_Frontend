import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
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
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//

//3.1.2.2 詢價登錄作業
@Component({
  selector: 'app-ass12020',
  templateUrl: './ass12020.component.html',
  styleUrl: './ass12020.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, DropdownComponent, InputNumberRangeComponent, CalendarRangeComponent, InputNumberComponent, TableComponent, TranslateModule]
})
export class ASS12020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    itemCode: [], // 品項編號
    supplierCode: [], // 	供應商編號
    purchaseFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 品項進價(報價金額)
    purchaseTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 品項進價(報價金額)
    singlePriceFrom: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 品項單價
    singlePriceTo: [, [this.validationService.numberValidator, Validators.max(99999999)]], // 品項單價
    itemUnit: [], // 品項單位
    reportFrom: [], // 報價期限
    reportTo: [], // 報價期限
    loginBatches: [, [this.validationService.numberValidator]], // 品項進價(報價金額)
    addNumber: [, [Validators.required, Validators.maxLength(3)]], // 需求單號
    modifyNumber: [, [Validators.required, Validators.maxLength(3)]], // 修改筆數
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
    { field: 'col1', header: '登錄批號', visible: true },
    { field: 'col2', header: '供應商編號', visible: true },
    { field: 'col3', header: '登錄日期', visible: true },
    { field: 'col4', header: '報價期限', visible: true },
    { field: 'col5', header: '說明', visible: true },
    // { field: 'col6', header: '需求日期', visible: true },
    // { field: 'col7', header: '請購申請狀態', visible: true },
    // { field: 'col8', header: '新增筆數', visible: true },
    // { field: 'col9', header: '折舊科目(借)', visible: true },
    // { field: 'col10', header: '累計折舊科目(貸)', visible: true },
    // { field: 'col11', header: '折舊年限', visible: true },
    // { field: 'col12', header: '說明', visible: true },

    // { field: 'col13', header: '公司地址', visible: true },
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
  supplierCodeOptions: any[] = [];
  itemUnitOptions: any[] = [];

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
    this.ProgNo = '310012';
    this.cruPage = '/ASS1000/ASS12020CRU';
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
