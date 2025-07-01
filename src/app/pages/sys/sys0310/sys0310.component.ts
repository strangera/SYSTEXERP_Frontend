import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { BasicQueryPageComponent } from '../../../shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { Role } from '../../../shared/models/sys/role.model';
// 4-2-3-1角色系統權限設定
@Component({
  selector: 'app-sys0310',
  templateUrl: './sys0310.component.html',
})

export class SYS0310Component extends BasicQueryPageComponent<Role> implements OnInit {
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10)]], // 角色代碼
    Role_Name: ['', [Validators.maxLength(30)]], // 角色名稱
    ...createPaginationConfig([{ field: 'Role_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Role[] = [];
  columns: Column[] = [
    { field: 'Role_No', header: '角色編號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
    { field: 'Description', header: '描述', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  constructor(
    private sys0210Service: Sys0210Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0310', '/SYS/SYS0310cru', this.queryForm, (form) => this.onSubmit(form));
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0210Service.queryRole(frm.value).subscribe({
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
}
