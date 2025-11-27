import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { SystemOption, SystemOptionsService } from '@service/system/sys1000.service';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column, createPaginationConfig, formatDate, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { apiOption, option, tblUser } from '../../../shared/models/sys/sysb000.model';
import { UserData } from '../../../shared/models/sys/user.model';
import { Sys0110Service } from './../../../service/api/sys/sys0110.service';
import { user_priorityOptions } from './sys0110.model';

// 4-2-1-1 使用者基本資料維護
@Component({
  selector: 'app-sys0110',
  templateUrl: './sys0110.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeQuickComponent,
    TableComponent,
    TranslateModule,
  ],
})

export class SYS0110Component extends BasicQueryPageComponent<UserData> implements OnInit {
  // 表單控制
  queryForm = this.formBuilder.group({
    user_No: ['', Validators.maxLength(10)], // 使用者編號
    user_Name: ['', Validators.maxLength(20)], // 使用者名稱
    user_priority: [null], // 使用者等級 > 規格?不知道內容
    org_ID: [[]], // 組織編號 (SYSB400_SYS3100)
    str_dateStart: [null], // 帳號有效開始日期
    str_dateEnd: [null], // 帳號有效結束日期
    last_loginStart: [null], // 帳號有效開始日期
    last_loginEnd: [null], // 帳號有效結束日期
    status: [[]], // 使用者狀態 1=有效 2=停用
    user_type: [[]], // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他
    ...createPaginationConfig([{ field: 'user_No', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要
  user_priorityOptions = user_priorityOptions;

  // 表格資料
  data: UserData[] = [];
  columns: Column[] = [
    { field: 'user_No', header: '使用者編號', visible: true },
    { field: 'user_Name', header: '使用者名稱', visible: true },
    {
      field: 'title', header: '職位', visible: true, format: (value: string) =>
        this.titleOptions.find((option) => option.No === value)?.Label || value
    },
    {
      field: 'org_ID', header: '組織編號', visible: true, format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.Label || value
    },
    { field: 'str_date', header: '帳號有效開始日期', visible: true, format: formatDate },
    { field: 'end_date', header: '帳號有效結束日期', visible: true, format: formatDate },
    { field: 'last_Login', header: '上次登入時間', visible: true, format: formatDateTime },  // 還沒串資料
    {
      field: 'status', header: '狀態', visible: true, format: (value: string) =>
        this.userStatusOptions.find((option) => option.value === value)?.label ||
        value
    },
    {
      field: 'user_type', header: '使用者型態', visible: true, format: (value: string) =>
        this.userTypeOptions.find((option) => option.value === value)?.label ||
        value
    },
    { field: 'user_email', header: '電子信箱', visible: true },
    { field: 'TLT_No', header: '所屬專櫃編號', visible: true },
    { field: 'remarks', header: '備註', visible: true },
    { field: 'user_priority', header: '使用者等級', visible: true },
    { field: 'USER_PwdExpireDate', header: '密碼到期日', visible: true, format: formatDate },
    { field: 'CRT_Date', header: '建立日期', visible: true, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: true },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: true },
    { field: 'UPD_Date', header: '變更日期', visible: true, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: true },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: true },
  ];
  selectedItems: tblUser[] = [];// 多選項目

  // 下拉選單選項
  titleOptions: apiOption[] = [];
  SYS3100_Options: apiOption[] = [];
  userStatusOptions: option[] = [];
  userTypeOptions: option[] = [];

  constructor(
    private sysb400Service: Sysb400Service,
    private sys0110Service: Sys0110Service,
  ) {
    super(); // 呼叫父類別建構子
  }

  ngOnInit(): void {
    this.initializePage('SYS0110', '/SYS/SYS0110cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  // 初始化下拉選單選項
  loadOptions() {
    this.titleOptions = SystemOptionsService.getOptions('T103').map((item: SystemOption) => ({
      No: item.SYS_Code,
      Name: item.SYS_Name,
      Label: item.SYS_Code + '-' + item.SYS_Name,
    }));
    this.sysb400Service.querySYS3100_DropDownList().pipe(untilDestroyed(this)).subscribe((response) => {
      this.SYS3100_Options = response.Data.map(item => ({ ...item, Label: item.No + '-' + item.Name, }));
    });
    this.userTypeOptions = [{ value: '1', label: '公司內部人員' }, { value: '2', label: '專櫃人員' }, { value: '3', label: '其他' },];
    this.userStatusOptions = [{ value: '1', label: '有效' }, { value: '2', label: '停用' },];
  }

  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.sys0110Service.queryUser(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
        this.queryStateService.setQueryState(this.ProgNo, frm.value);
        this.data = response.Data || [];
        this.totalRecords = response.TotalCount;
      });
    });
  }
  // 刪除項目
  onDelete(data: tblUser | tblUser[]): void {
    this.confirmationService.confirm({
      header: '確定要停用選中的項目嗎？',
      message: '此操作將停用選中的使用者帳號，請確認是否繼續。',
      accept: () => {
        const items = Array.isArray(data) ? data : [data];
        if (items.length === 0) return;
        // 收集所有有效的 ID
        const idList = items.filter((item) => item && item.id != null && item.id !== undefined).map((item) => item.id);
        if (idList.length === 0) {
          this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
          console.log('項目', items);
          return;
        }
        this.sys0110Service.deleteUser({ ids: idList }).pipe(untilDestroyed(this)).subscribe({
          next: (res) => { console.log(res); },
          error: (err: string) => { console.error('API error:', err); },
          complete: () => { this.onSubmit(this.queryForm); },
        });
        this.selectedItems = [];
      }
    });
  }
}
