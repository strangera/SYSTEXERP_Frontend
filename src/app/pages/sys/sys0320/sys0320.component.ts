import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig, formatDateTime } from '../../../shared/componentkit/table/table.model';
import { Sys0110Service } from '../../../service/API/sys/sys0110.service';
import { UserData } from '../../../shared/models/sys/user.model';

@Component({
  selector: 'app-sys0320',
  templateUrl: './sys0320.component.html',
})
// 4.2.3.2 使用者系統權限設定
export class SYS0320Component extends BasicQueryPageComponent<UserData> implements OnInit {
  queryForm = this.formBuilder.group({
    user_No: ['', [Validators.maxLength(10)]], // 使用者代碼
    user_Name: ['', [Validators.maxLength(30)]], // 使用者名稱
    ...createPaginationConfig([{ field: 'user_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: UserData[] = []; columns: Column[] = [
    { field: 'user_No', header: '使用者編號', visible: true },
    { field: 'user_Name', header: '使用者名稱', visible: true },
    { field: 'status', header: '使用者狀態', visible: true, format: (value: string) => value === '1' ? '有效' : value === '2' ? '停用' : value },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員名稱', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員名稱', visible: false },
  ];
  constructor(
    private sys0110Service: Sys0110Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0320', '/SYS/SYS0320CRU', this.queryForm, (form) => this.onSubmit(form));
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0110Service.queryUser(frm.value).subscribe({
        next: (response) => {
          this.data = response.Data
          this.totalRecords = response.TotalCount || response.Data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    });
  }

  // 查詢邏輯
  onSubmitQuery(frm: FormGroup) {
    this.onSubmit(frm);
  }
}
