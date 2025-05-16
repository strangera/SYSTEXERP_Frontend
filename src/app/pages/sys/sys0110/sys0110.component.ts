import { Sys0110Service } from './../../../service/API/sys/sys0110.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
// Shared
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { apiOption, option, SYS1000, Sysb400m, tblUser } from '../module/sysb000.module';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Sysb400Service } from '../../../service/API/sys/sysb400.service';

// 4-2-1-1 使用者基本資料維護
@Component({
  selector: 'app-sys0110',
  templateUrl: './sys0110.component.html',
  styleUrls: ['./sys0110.component.scss'],
})

export class SYS0110Component extends BasicQueryPageComponent<tblUser> implements OnInit {
  // 表單控制
  queryForm = this.formBuilder.group({
    user_No: ['', Validators.maxLength(10)], // 使用者編號
    user_Name: ['', Validators.maxLength(20)], // 使用者名稱
    // user_Password: ['', Validators.maxLength(32)], // 使用者密碼-加密
    // title: ['', Validators.maxLength(6)], // 職稱代碼-SYS1000
    org_ID: [[], Validators.maxLength(20)], // 組織編號 (SYSB400_SYS3100)
    str_dateStart: [null], // 帳號有效開始日期
    str_dateEnd: [null], // 帳號有效結束日期
    status: [[], Validators.maxLength(2)], // 使用者狀態 1=有效 2=停用
    user_type: [[]], // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他

    // user_email: ['', Validators.maxLength(100)], // 使用者email帳號
    // TLT_No: ['', Validators.maxLength(12)], // 所屬專櫃編號
    // remarks: ['', Validators.maxLength(100)], // 備註
    user_priority: [[], Validators.maxLength(1)], // 使用者等級
    // USER_PwdExpireDate: [''], // 密碼到期日 YYYY/MM/DD HH:NN:SS，若使用者登入系統的時間大於此日期，則需強制使用者變更密碼

    ...createPaginationConfig([{ field: 'user_No', order: 1 }]), // 分頁和排序參數
  });

  totalRecords = 0;// 分頁和排序參數 // 排序需要

  // 表格資料
  data: tblUser[] = [];
  columns: Column[] = [
    { field: 'user_No', header: '使用者編號', visible: true },
    { field: 'user_Name', header: '使用者名稱', visible: true },
    { field: 'title', header: '職稱代碼', visible: true },
    {
      field: 'org_ID', header: '組織編號', visible: true, format: (value: string) =>
        this.SYS3100_Options.find((option) => option.No === value)?.Label ||
        value
    },
    { field: 'str_dateStart', header: '帳號有效開始日期', visible: true },
    { field: 'str_dateEnd', header: '帳號有效結束日期', visible: true },
    {
      field: 'status', header: '使用者狀態', visible: true, format: (value: string) =>
        this.userStatusOptions.find((option) => option.value === value)?.label ||
        value
    },
    {
      field: 'user_type', header: '使用者型態', visible: true, format: (value: string) =>
        this.userTypeOptions.find((option) => option.value === value)?.label ||
        value
    },
    { field: 'user_email', header: '使用者email帳號', visible: true },
    { field: 'TLT_No', header: '備註', visible: true },
    { field: 'user_priority', header: '使用者等級', visible: true },
    { field: 'USER_PwdExpireDate', header: '密碼到期日', visible: true },
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
    this.initializePage('SYS0110', '/SYS/SYS0110CRU', this.queryForm, (form) => this.onSubmit(form));
    this.loadOptions();
  }

  // 初始化下拉選單選項
  loadOptions() {
    // *職稱代碼-SYS1000
    this.sys0110Service.queryAllSystemCode({}).subscribe((response) => {
      console.log('回應', response);
      this.titleOptions = response.Data.map((item: SYS1000) => ({
        No: item.SYS_Code,
        Name: item.SYS_Name,
        Label: item.SYS_Type + '-' + item.SYS_Code + '-' + item.SYS_Name,
      }));
    });

    //建立組織下拉清單(SYS3100) 查詢全部
    const query_org = {
      level_id: '',
      org_id: '',
      org_name: '',

      //分頁查詢
      pageSize: 1000,
      pageIndex: 0,
      SortBy: [{ field: 'org_id', order: 1 }],
    };

    this.sysb400Service.querySYSB400(query_org).subscribe((response) => {
      this.SYS3100_Options = response.Data.map((item: Sysb400m) => ({
        No: item.org_id,
        Name: item.org_name,
        Label: item.org_id + '-' + item.org_name,
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
      console.log('查詢表單', frm.value);
      this.sys0110Service.queryUser(frm.value).subscribe({
        next: (response) => {
          if (response.Status === '0000') {
            this.data = response.Data || [];
            this.totalRecords = response.TotalCount || response.Data.length; // 排序需要
            this.queryStateService.setQueryState(this.ProgNo, frm.value);
            console.log('查詢結果', this.data);
          }
          this.loading = false;
          this.messageService.unblockUi();
        },
        error: () => {
          this.loading = false;
          this.messageService.unblockUi();
        },
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
      return;
    }
    // 構建新的 requestBody 格式
    // const requestBody = {
    //   idList: idList, // 符合 API 的 idList 格式
    // };
    // 調用 API
    // this.apiService.deleteTLS51010(requestBody).subscribe({
    //   next: (response) => {
    //     if (response.Status === '0000') {
    //       this.messageService.successBubble('選中項目刪除成功');
    //     } else {
    //       console.error('API error:', response.Status, response.Message);
    //       this.messageService.errorBubble(`刪除失敗: ${response.Message}`);
    //     }
    //   },
    //   error: (err: string) => {
    //     console.error('API error:', err);
    //     this.messageService.errorBubble('刪除失敗');
    //   },
    //   complete: () => {
    //     this.onSubmit(this.queryForm);
    //   },
    // });
    this.selectedItems = [];
  }
}
