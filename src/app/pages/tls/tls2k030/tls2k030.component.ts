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
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

// 2.2.19.3 餘代卡資料維護作業
@Component({
  selector: 'app-tls2k030',
  templateUrl: './tls2k030.component.html',
  styleUrl: './tls2k030.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputTextComponent, CalendarRangeComponent, InputNumberComponent, MultiSelectComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS2K030Component {
  ProgNo: string = '220099';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    shop: ['', [Validators.maxLength(10)]], // 卡片發行店別
    cardID: [, [Validators.maxLength(14)]], // 餘代卡卡號
    status: [[] as number[]], // 餘代卡狀態
    startdate: [], // 最後使用日
    enddate: [], // 最後使用日
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
    { field: 'contactPerson', header: '餘代卡卡號', visible: true },
    { field: 'contactDate', header: '卡片發行店別', visible: true },
    { field: 'UID', header: '卡片發行日', visible: true },
    { field: 'industryType', header: '發行已開金額', visible: true },
    { field: 'category', header: '發行未開金額', visible: true },
    { field: 'version', header: '最後使用日', visible: true },
    { field: 'rentNumber', header: '消費已開金額', visible: true },
    { field: 'progress', header: '消費未開金額', visible: true },
    { field: 'col1', header: '卡片狀態', visible: true },
    { field: 'col2', header: '備註', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  statusOptions: any[] = [];
  cardOptions: any[] = [
    { label: '餘代卡', value: 1 },
  ];

  constructor(
    private readonly formBuilder: FormBuilder
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
