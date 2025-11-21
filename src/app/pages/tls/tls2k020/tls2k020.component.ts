import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// Permissions
import { FunsrightInfo } from '../../../shared/models/system/funsrightInfo';
// Shared

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

// 2.2.19.2 餘代卡領卡作業
@Component({
  selector: 'app-tls2k020',
  templateUrl: './tls2k020.component.html',
  styleUrl: './tls2k020.component.scss',
  standalone: true,
  imports: [MenubarComponent, ButtonComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, MultiSelectComponent, CalendarRangeComponent, TableComponent, TranslateModule]
})
export class TLS2K020Component {
  ProgNo: string = '220098';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    serialnumber: [, [Validators.maxLength(9)]], // 批次號
    receiveCounter: [, [Validators.maxLength(16)]], // 領用櫃號
    status: [[] as number[]], // 狀態
    startdate: [], // 領卡日期
    enddate: [], // 領卡日期
    usagecount: [0, [Validators.required]], // 次數限制 (0 不限制)
  });
  // 表格
  // ----------------------------------------------------------------
  data: any[] = [
    //{ contactPerson: 'A先生', contactDate: '2024-08-08', UID: '123' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 1, progress: '未審核'},
    //{ contactPerson: 'B先生', contactDate: '2024-08-09', UID: '456' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 2, progress: '已審核'},
    //{ contactPerson: 'C先生', contactDate: '2024-08-10', UID: '789' ,industryType: '停車管理', category: '專櫃。意向書',version: 1, rentNumber: 3, progress: '未審核'},
    // 其他資料
  ];
  filteredData: any[] = [...this.data];
  columns: any[] = [
    { field: 'contactPerson', header: '批次號', visible: true },
    { field: 'contactDate', header: '卡號', visible: true },
    { field: 'UID', header: '領用櫃號', visible: true },
    { field: 'industryType', header: '領用日期', visible: true },
    { field: 'category', header: '狀態', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  statusOptions: any[] = [];
  cardOptions: any[] = [
    { label: '餘代卡', value: 1 },
  ];

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {

  }

  canQuery(): boolean {
    return true;
  }

  canAdd(): boolean {
    return true;
  }

  canEdit(): boolean {
    return true;
  }

  onSubmit(frm: FormGroup) {

  }

  onSubmitQuery(frm: FormGroup) {
    // 查詢邏輯
    this.onSubmit(frm);
  }

  onClearForm() {
    this.queryForm.reset();  // 重置表單
  }

  onCreate() {

  }

  onEdit(data: any) {

  }

  onDetail(data: any) {
  }
}
