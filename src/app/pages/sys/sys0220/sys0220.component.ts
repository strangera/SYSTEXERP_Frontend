import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { TableReportComponent } from '@shared/componentkit/table-report/table-report.component';
import { ReportColumn } from '@shared/componentkit/table-report/table-report.model';
import { AccordionModule } from 'primeng/accordion';
import { finalize } from 'rxjs';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { CalendarRangeQuickComponent } from '../../../shared/componentkit/calendar-range-quick/calendar-range-quick.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { MultiSelectComponent } from '../../../shared/componentkit/multi-select/multi-select.component';
import { apiOption, option, SYS1000, tblUser } from '../../../shared/models/sys/sysb000.model';
import { UserData } from '../../../shared/models/sys/user.model';

@Component({
  selector: 'app-sys0220',
  templateUrl: './sys0220.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    MultiSelectComponent,
    CalendarRangeQuickComponent,
    ButtonComponent,
    TableReportComponent,
    TranslateModule,
  ],
})

export class SYS0220Component extends BasicQueryPageComponent<UserData> implements OnInit {
  // 查詢
  queryForm = this.formBuilder.group({
    user_No: ['', Validators.maxLength(10)], // 使用者編號
    user_Name: ['', Validators.maxLength(20)], // 使用者名稱
    // user_Password: ['', Validators.maxLength(32)], // 使用者密碼-加密
    // title: ['', Validators.maxLength(6)], // 職位-SYS1000
    org_ID: [[], Validators.maxLength(20)], // 組織編號 (SYSB400_SYS3100)
    str_dateStart: [null], // 帳號有效開始日期
    str_dateEnd: [null], // 帳號有效結束日期
    status: [[], Validators.maxLength(2)], // 使用者狀態 1=有效 2=停用
    user_type: [[]], // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他

    // user_email: ['', Validators.maxLength(100)], // 使用者email帳號
    // TLT_No: ['', Validators.maxLength(12)], // 所屬專櫃編號
    // remarks: ['', Validators.maxLength(100)], // 備註
    user_priority: [[], Validators.maxLength(1)], // 使用者等級 (user fillin)
    // USER_PwdExpireDate: [''], // 密碼到期日 YYYY/MM/DD HH:NN:SS，若使用者登入系統的時間大於此日期，則需強制使用者變更密碼

    pageSize: [30],
    pageIndex: [1], // 你將初始頁碼改為 1
    SortBy: [[{ field: 'user_No', order: 1 }]],
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要

  // 表格資料
  data: UserData[] = [];
  lastQueryBody: any;
  columns: ReportColumn[] = [
    { field: 'user_No', header: '使用者編號', visible: true },
    { field: 'user_Name', header: '使用者名稱', visible: true },
    {
      field: 'status', header: '使用者狀態', visible: true, format: (value: string) =>
        this.userStatusOptions.find((option) => option.value === value)?.label ||
        value
    },
    { field: 'title', header: '職位', visible: true },
    {
      field: 'org_ID', header: '組織編號', visible: true, format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.Label ||
        value
    },
    { field: 'str_date', header: '帳號有效開始日期', visible: true, format: (value: string) => value ? new Date(value).toLocaleDateString() : '' },
    { field: 'end_date', header: '帳號有效結束日期', visible: true, format: (value: string) => value ? new Date(value).toLocaleDateString() : '' },
    {
      field: 'user_type', header: '使用者型態', visible: true, format: (value: string) =>
        this.userTypeOptions.find((option) => option.value === value)?.label ||
        value
    },
    { field: 'user_email', header: '電子信箱', visible: true },
    { field: 'TLT_No', header: '所屬專櫃編號', visible: true },
    { field: 'remarks', header: '備註', visible: true },
    { field: 'user_priority', header: '使用者等級', visible: true },
    { field: 'USER_PwdExpireDate', header: '密碼到期日', visible: true, format: (value: string) => value ? new Date(value).toLocaleDateString() : '' },
  ];
  selectedItems: tblUser[] = [];// 多選項目

  // 下拉選單選項
  titleOptions: apiOption[] = [];
  SYS3100_Options: apiOption[] = [];
  userStatusOptions: option[] = [];
  userTypeOptions: option[] = [];

  constructor(
    private readonly sysb400Service: Sysb400Service,
    public readonly sys0110Service: Sys0110Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0220', '/SYS/SYS0220cru', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }
  // 初始化下拉選單選項
  loadOptions() {
    // *職位-SYS1000
    this.sys0110Service.queryAllSystemCode({}).subscribe((response) => {
      console.log('回應', response);
      this.titleOptions = response.Data.map((item: SYS1000) => ({
        No: item.SYS_Code,
        Name: item.SYS_Name,
        Label: item.SYS_Type + '-' + item.SYS_Code + '-' + item.SYS_Name,
      }));
    });

    //建立組織下拉清單(SYS3100) 查詢全部
    this.sysb400Service.querySYS3100_DropDownList().subscribe((response) => {
      this.SYS3100_Options = response.Data.map((item) => ({
        No: item.No,
        Name: item.Name,
        Label: item.No + '-' + item.Name,
      }));
    });

    this.userTypeOptions = [
      // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他
      { value: '1', label: '公司內部人員' },
      { value: '2', label: '專櫃人員' },
      { value: '3', label: '其他' },
    ];

    this.userStatusOptions = [
      // 1=有效 2=停用
      { value: '1', label: '有效' },
      { value: '2', label: '停用' },
    ];
  }

  // 提交查詢：處理表單並呼叫查詢 API
  onSubmit(frm: FormGroup): void {
    this.handleSubmit(frm, () => {
      this.sys0110Service.queryUser(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        if (response.Data) {
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.data = response.Data;
          this.totalRecords = response.TotalCount;
          this.lastQueryBody = frm.value;
        } else {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }
  // 刪除項目
  onDelete(data: tblUser | tblUser[]): void {
    const items = Array.isArray(data) ? data : [data];
    if (items.length === 0) return;
    // 收集所有有效的 ID
    const idList = items.filter((item) => item && item.id != null && item.id !== undefined).map((item) => item.id);
    if (idList.length === 0) {
      this.messageService.errorBubble('無法刪除：選中的項目缺少有效 ID');
      console.log('項目', items);
      return;
    }
    // 構建新的 requestBody 格式
    const requestBody = {
      ids: idList, // 符合 API 的 idList 格式
    };
    console.log('Delete body:', JSON.stringify(requestBody, null, 2));
    // 調用 API
    this.sys0110Service.deleteUser(requestBody).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.messageService.successBubble('選中項目刪除成功');
        } else {
          console.error('API error:', response.Status, response.Message);
          this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.messageService.errorBubble('刪除失敗');
      },
      complete: () => {
        this.onSubmit(this.queryForm);
      },
    });
    this.selectedItems = [];
  }
}
