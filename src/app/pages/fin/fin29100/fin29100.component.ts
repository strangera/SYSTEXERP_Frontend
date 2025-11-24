import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Shared
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberRangeComponent } from '../../../shared/componentkit/input-number-range/input-number-range.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
//

//1.2.9.10 支出憑單明細表
@Component({
  selector: 'app-fin29100',
  templateUrl: './fin29100.component.html',
  styleUrl: './fin29100.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, CalendarRangeComponent, DropdownComponent, InputNumberRangeComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class FIN29100Component extends BasicQpageComponent implements OnInit {
  //
  queryForm = this.formBuilder.group({
    startdate: [, [Validators.required]], // 匯款/開票/調撥日期
    enddate: [, [Validators.required]], // 匯款/開票/調撥日期
    bankCode: [], // 銀行代號
    startserialticket: [, [Validators.max(9999999999999)]], // 匯款/開票/調撥單號
    endserialticket: [, [Validators.max(9999999999999)]], // 匯款/開票/調撥單號
    type: [[] as number[]], // 型態
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
    { field: 'col1', header: '型態', visible: true },
    { field: 'col2', header: '匯款/開票/調撥單號', visible: true },
    { field: 'col3', header: '匯款/開票/調撥日期', visible: true },
    { field: 'col4', header: '廠商代號', visible: true },
    { field: 'col5', header: '匯款/開票/調撥金額', visible: true },
    { field: 'col6', header: '匯款/調撥手續費', visible: true },
    { field: 'col7', header: '付款銀行', visible: true },
    { field: 'col8', header: '支票號碼', visible: true },
    { field: 'col9', header: '到期日', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  bankCodeOptions: any[] = [];
  typeOptions: any[] = [
    { value: 1, label: '開票' },
    { value: 2, label: '匯款' },
    { value: 3, label: '調撥' },
  ];

  constructor(
    private formBuilder: FormBuilder,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    // 初始化
    this.ProgNo = '120033';
    this.cruPage = '/FIN2000/FIN29100CRU';
    // ----------------------------------------------------------------
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {

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

  }

  onEdit(data: any) {
  }

  onDetail(data: any) {
  }
}
