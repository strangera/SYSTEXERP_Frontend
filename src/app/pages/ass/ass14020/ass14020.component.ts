import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { AuthService } from '../../../service/system/auth.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarComponent } from '../../../shared/components/calendar/calendar.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { ValidationService } from '../../../shared/service/validation.service';
//

//3.1.4.2  請款關帳作業
@Component({
  selector: 'app-ass14020',
  templateUrl: './ass14020.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarComponent, InputNumberComponent, ButtonComponent, TranslateModule]
})
export class ASS14020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    closeDate: [, [Validators.required]], // 關帳日期
    //
    maintenanceID: [], // 發票維護單號
    noTaxAmount: [, [this.validationService.numberValidator]], // 未稅總金額
    taxAmount: [, [this.validationService.numberValidator]], // 稅額
    totalAmount: [, [this.validationService.numberValidator]], // 總金額
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
    { field: 'col1', header: '發票/收據號碼', visible: true },
    { field: 'col2', header: '供應商編號', visible: true },
    { field: 'col3', header: '請款單據種類', visible: true },
    { field: 'col4', header: '驗收單號', visible: true },
    { field: 'col5', header: '發票維護單號', visible: true },
    { field: 'col6', header: '發票格式', visible: true },
    { field: 'col7', header: '稅別', visible: true },
    { field: 'col8', header: '扣抵別', visible: true },
    // { field: 'col9', header: '資產狀態', visible: true },
    // { field: 'col10', header: '保管單位', visible: true },

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

  // taxTypeOptions:any[]=[
  //   { value: 1, label: '應稅' },
  //   { value: 2, label: '免稅' },
  // ];

  //
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
    private authService: AuthService,
    private validationService: ValidationService,
    //
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '310029';
    this.cruPage = '/ASS1000/ASS14020CRU';
    //

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
