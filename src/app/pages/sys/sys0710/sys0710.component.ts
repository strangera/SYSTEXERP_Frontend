import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { UserData } from '@shared/models/sys/user.model';
import { Column, createPaginationConfig, formatDateTime } from '@shared/componentkit/table/table.model';
import { Sys0110Service } from '@service/api/sys/sys0110.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-sys0710',
  templateUrl: './sys0710.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    TableComponent,
    TranslateModule,
    InputTextComponent
  ],
})
// 使用者系統權限列表
export class SYS0710Component extends BasicQueryPageComponent<UserData> implements OnInit {
  queryForm = this.formBuilder.group({
    user_No: ['', [Validators.maxLength(10)]], // 使用者編號
    user_Name: ['', [Validators.maxLength(30)]], // 使用者名稱
    ...createPaginationConfig([{ field: 'user_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: UserData[] = [];
  columns: Column[] = [
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
  //TODO: 把它放在cru
  // columns: any[] = [
  //   // { field: 'serialNumber', header: '序號', visible: true },
  //   { field: 'userCode', header: '使用者代碼', visible: true },
  //   { field: 'userName', header: '使用者名稱', visible: true },
  //   { field: 'mainSystemCode', header: '主系統代碼', visible: true },
  //   { field: 'mainSystemName', header: '主系統名稱', visible: true },
  //   { field: 'subSystemCode', header: '子系統代碼', visible: true },
  //   { field: 'subSystemName', header: '子系統名稱', visible: true },
  //   { field: 'operationCode', header: '作業代碼', visible: true },
  //   { field: 'operationName', header: '作業名稱', visible: true },
  //   { field: 'authorization', header: '具有權限之功能按鍵', visible: true },
  // ];
  constructor(
    private sys0110Service: Sys0110Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0710', '/SYS/sys0710cru', this.queryForm);
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0110Service.queryUser(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        if (response.Data) {
          this.data = response.Data
          this.totalRecords = response.TotalCount || response.Data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        } else {
          this.data = [];
          this.totalRecords = 0;
          this.messageService.warnBubble(response.Message);
        }
      });
    });
  }
}
