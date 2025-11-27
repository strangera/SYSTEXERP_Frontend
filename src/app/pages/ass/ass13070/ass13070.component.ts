import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//

//3.1.3.7  財產保管單位設定作業
@Component({
  selector: 'app-ass13070',
  templateUrl: './ass13070.component.html',
  styleUrl: './ass13070.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, MultiSelectComponent, CalendarRangeComponent, DropdownComponent, TableComponent, TranslateModule]
})
export class ASS13070Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    purchaseType: [[] as number[]], // 進貨類型
    bigCategoryCode: [], // 大分類編號
    purchaseDateFrom: [], // 購入日期
    purchaseDateTo: [], // 購入日期
    midCategoryCode: [], // 中分類編號
    purchaseNumber: [], // 進貨單號
    smlCategoryCode: [], // 小分類編號
    keeper: [], // 保管人
    keeperUnit: [], // 保管單位
    propertyCode: [], // 財產編號
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
      'propertyType': '資產', 'purchaseNumber': 20150128003, 'propertyCode': '1C263800000010000142', 'itemCode': '桌上型電腦 ',
      'purchaseDateFrom': '2024/06/13', 'purchaseAmount': 18950, 'keeperUnit': '會員Team', 'keeper': '朱先生',
      'user': '會員Team', 'userUnit': '朱先生',
    },
    // { 'name': 'Michael', 'age': 31, 'email': 'michael@example.com', 'city': 'Taipei' },
    // { 'name': 'Sarah', 'age': 24, 'email': 'sarah@example.com', 'city': 'Tainan' },
    // 其他資料
  ];
  columns: any[] = [
    { field: 'propertyType', header: '財產類型', visible: true },
    { field: 'purchaseNumber', header: '進貨單號', visible: true },
    { field: 'propertyCode', header: '財產編號', visible: true },
    { field: 'itemCode', header: '品項', visible: true },
    { field: 'purchaseDateFrom', header: '購入日期', visible: true },
    { field: 'purchaseAmount', header: '原購入金額', visible: true },

    { field: 'keeperUnit', header: '原保管單位', visible: true },
    { field: 'keeper', header: '原保管人', visible: true },
    { field: 'user', header: '原使用單位', visible: true },
    { field: 'userUnit', header: '原使用人', visible: true },

    { field: 'bigCategory', header: '大分類編號', visible: false },
    { field: 'midCategory', header: '中分類編號', visible: false },
    { field: 'smlCategory', header: '小分類編號', visible: false },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  //
  purchaseTypeOptions: any[] = [];
  purchaseNumberOptions: any[] = [
    { value: 1, label: '201410300001' },
    { value: 2, label: '201410310001' },
    { value: 3, label: '201410310002' },
    { value: 4, label: '201410310004' },
    { value: 5, label: '201410310005' },
    { value: 6, label: '201410310006' },
    { value: 7, label: '201411010001' },
    { value: 8, label: '201411010002' },
    { value: 9, label: '201411010003' },
    { value: 10, label: '201411150001' },
  ];
  userCodeOptions: any[] = [];
  organizationOptions: any[] = [];
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
    this.ProgNo = '310022';
    this.cruPage = '/ASS1000/ASS13070CRU';
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
