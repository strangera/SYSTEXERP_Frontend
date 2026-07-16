import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/components/menubar/menubar.component';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CalendarRangeComponent } from '../../../shared/components/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/components/input-number/input-number.component';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
//

//1.2.3.3 暫付款申請單列印
@Component({
  selector: 'app-fin23030',
  templateUrl: './fin23030.component.html',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, CalendarRangeComponent, DropdownComponent, ButtonComponent, TranslateModule]
})
export class FIN23030Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    advanceSheetNumber: [, [Validators.maxLength(13)]], // 預支單號
    startRequestDate: [], //申請日期
    endRequestDate: [], //申請日期
    requsetEmployee: [], //申請廠商/員工
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
    { field: 'col1', header: '預支單號', visible: true },
    { field: 'col2', header: '預支金額', visible: true },
    { field: 'col3', header: '申請日期', visible: true },
    { field: 'col4', header: '預計核銷日', visible: true },
    { field: 'col5', header: '廠商編號', visible: true },
    { field: 'col6', header: '付款方式', visible: true },
    { field: 'col7', header: '匯款銀行代號', visible: true },
    { field: 'col8', header: '銀行帳號', visible: true },
    { field: 'col9', header: '帳戶名稱', visible: true },
    { field: 'col10', header: '票據禁止背書轉讓', visible: true },
    { field: 'col11', header: '票據抬頭', visible: true },
    { field: 'col12', header: '摘要', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  requsetEmployeeOptions: any[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120009';
    this.cruPage = '/FIN2000/FIN23030CRU';
    // ----------------------------------------------------------------
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    console.log(frm.value);
    this.submitted = true;
    this.loading = true;

    if (frm.valid && this.canQuery()) {
      // 提交邏輯
      // Service
      // this.xxxService.queryMachine(frm.value as xxxInterface)
      //  .subscribe((response: any) => {
      //    this.rows = response.xxx;
      // });
    }

    this.loading = false;
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
