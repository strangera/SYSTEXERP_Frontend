import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { NotificationService } from '../../../shared/components/notification-message/notification.service';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/components/multi-select/multi-select.component';
import { TableComponent } from '../../../others/component/table/table.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//

//1.2.7.2 形成開票明細資料
@Component({
  selector: 'app-fin27020',
  templateUrl: './fin27020.component.html',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarRangeComponent, InputTextComponent, MultiSelectComponent, TableComponent, TranslateModule]
})
export class FIN27020Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    transferSource: [, [Validators.maxLength(12)]], // 開票單號
    buildDateFrom: [], // 建立日期
    buildDateTo: [], // 建立日期
    ticketDateFrom: [], // 開票日期
    ticketDateTo: [], // 開票日期
    bankCode: [, [Validators.maxLength(8)]], // 銀行代號
    bankName: [, [Validators.maxLength(40)]], // 	銀行名稱
    tossSummon: [[] as number[]], // 拋轉傳票
    summonNumber: [, [Validators.maxLength(12)]], // 傳票編號
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
    { field: 'col1', header: '開票來源單號', visible: true },
    { field: 'col2', header: '建立日期', visible: true },
    { field: 'col3', header: '開票日期', visible: true },
    { field: 'col4', header: '銀行代號', visible: true },
    { field: 'col5', header: '銀行名稱', visible: true },
    { field: 'col6', header: '拋轉傳票', visible: true },
    { field: 'col7', header: '傳票編號', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  whetherOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private messageService: NotificationService,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120021';
    this.cruPage = '/FIN2000/FIN27020CRU';
    //
    // ----------------------------------------------------------------
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
