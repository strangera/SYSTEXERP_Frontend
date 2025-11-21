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
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//

//3.1.3.11  資產差異表
@Component({
  selector: 'app-ass13110',
  templateUrl: './ass13110.component.html',
  styleUrl: './ass13110.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberRangeComponent, CalendarRangeComponent, DropdownComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class ASS13110Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    inventory_NumberFrom: [, [Validators.max(9999999999), this.validationService.numberValidator]], // 清點單號
    inventory_NumberTo: [, [Validators.max(9999999999), this.validationService.numberValidator]], // 清點單號
    inventory_DateFrom: [], // 清點日期
    inventory_DateTo: [], // 清點日期
    inventory_PersonCode: [], // 清點人代碼
    inventory_DataStatus: [[] as number[]], //資產狀態(盤點後)
    assetsType: [[] as number[]], // 資產類別
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
    { field: 'col1', header: '財產編號', visible: true },
    { field: 'col2', header: '財產名稱', visible: true },
    { field: 'col3', header: '清點單號', visible: true },
    { field: 'col4', header: '購入日期', visible: true },
    { field: 'col5', header: '購入金額', visible: true },
    { field: 'col6', header: '重估後金額', visible: true },
    { field: 'col7', header: '累計折舊', visible: true },
    { field: 'col8', header: '未折餘額', visible: true },
    { field: 'col9', header: '資產狀態', visible: true },
    { field: 'col10', header: '保管單位', visible: true },

    // { field: 'col11', header: '會計科目代號', visible: true },
    // { field: 'col12', header: '購入金額', visible: true },
    // { field: 'col13', header: '驗收單號', visible: true },

    // { field: 'col14', header: '入帳日期', visible: true },
    // { field: 'col15', header: '條件篩選', visible: true },
    // { field: 'col16', header: '顯示筆數', visible: true },

    // { field: 'col17', header: '報廢日期前之帳面價值', visible: true },
    // { field: 'col18', header: '報廢損失', visible: true },

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
  userCodeOptions: any[] = [];
  dataStatusOptions: any[] = [
    { value: 1, label: '良好' },
    { value: 2, label: '損壞' },
    { value: 3, label: '下落不明' },
  ];
  assetsTypeOptions: any[] = [];

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
    this.ProgNo = '310026';
    this.cruPage = '/ASS1000/ASS13110CRU';
    //
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
