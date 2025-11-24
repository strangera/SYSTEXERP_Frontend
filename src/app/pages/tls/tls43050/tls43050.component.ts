import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationExtras } from '@angular/router';
// Permissions
import { FunsrightInfo } from '../../../shared/models/system/funsrightInfo';
// Shared
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeComponent } from '../../../shared/componentkit/calendar-range/calendar-range.component';
import { DropdownComponent } from '../../../shared/componentkit/dropdown/dropdown.component';
import { InputNumberComponent } from '../../../shared/componentkit/input-number/input-number.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';

// 2.4.3.5 訊息狀態查詢作業
@Component({
  selector: 'app-tls43050',
  templateUrl: './tls43050.component.html',
  styleUrl: './tls43050.component.scss',
  standalone: true,
  imports: [MenubarComponent, AccordionModule, FormsModule, ReactiveFormsModule, InputNumberComponent, DropdownComponent, InputTextComponent, CalendarRangeComponent, ButtonComponent, TableComponent, TranslateModule]
})
export class TLS43050Component {
  ProgNo: string = '240013';
  // 權限
  funInfo?: FunsrightInfo;

  // 查詢
  // ----------------------------------------------------------------
  loading: boolean = false;
  submitted: boolean = false;
  queryForm = this.formBuilder.group({
    messageCode: [, [Validators.maxLength(13)]], // Input serial number
    registerCode: [, [Validators.maxLength(6)]], // Input serial number
    groupCode: [, [Validators.maxLength(3)]], // Input serial number
    status: [], // DropDown
    loginID: [, [Validators.maxLength(7)]], // Input serial number
    approverID: [, [Validators.maxLength(7)]], // Input serial number
    mMessage: ['', [Validators.maxLength(60)]], // Input Text
    dMessage: ['', [Validators.maxLength(60)]], // Input Text
    startdate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
    enddate: [], // 日期限制 (start-end datetime yyyy/mm/dd)
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
    { field: 'contactPerson', header: '訊息案號代碼', visible: true },
    { field: 'contactDate', header: '收銀機代碼', visible: true },
    { field: 'UID', header: '群組代碼', visible: true },
    { field: 'industryType', header: '狀態', visible: true },
    { field: 'category', header: '登錄人ID', visible: true },
    { field: 'version', header: '審核人ID', visible: true },
    { field: 'rentNumber', header: '顯示文字(M)', visible: true },
    { field: 'progress', header: '顯示文字(D)', visible: true },
    { field: 'col1', header: '登錄時間', visible: true },
    // 其他欄位
  ];
  // ----------------------------------------------------------------
  statusOptions: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {

  }

  // 權限
  // ----------------------------------------------------------------
  canQuery(): boolean {
    return true;
  }
  canAdd(): boolean {
    return true;
  }
  canEdit(): boolean {
    return true;
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
    if (this.canAdd()) {
      this.navigateWithState(CRUDStatus.Create);
    }
  }

  onEdit(data: any) {
    if (this.canEdit()) {
      this.navigateWithState(CRUDStatus.Edit, data);
    }
  }

  onDetail(data: any) {
    console.log(data);
    this.navigateWithState(CRUDStatus.Read, data);
  }

  navigateWithState(crudstatus: CRUDStatus, rowdata?: any) {
    let extras: NavigationExtras = {
      state: {
        crudstatus: crudstatus,
        rowdata: rowdata,
      },
    };

    console.log(crudstatus);

  }
}
