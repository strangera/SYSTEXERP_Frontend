import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Role } from '@shared/models/sys/role.model';
import { Column, createPaginationConfig, formatDateTime } from '@shared/componentkit/table/table.model';
import { Sys0210Service } from '@service/api/sys/sys0210.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { InputTextComponent } from '@shared/componentkit/input-text/input-text.component';

@Component({
  selector: 'app-sys0730',
  templateUrl: './sys0730.component.html',
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
// 角色系統權限列表
export class SYS0730Component extends BasicQueryPageComponent<Role> implements OnInit {
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10)]], // 角色代號
    Role_Name: ['', [Validators.maxLength(30)]], // 角色名稱
    ...createPaginationConfig([{ field: 'Role_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Role[] = [];
  columns: Column[] = [
    { field: 'Role_No', header: '角色代號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true },
    { field: 'Description', header: '描述', visible: true },
    { field: 'CRT_Date', header: '建立日期', visible: false, format: formatDateTime },
    { field: 'CRT_USR_No', header: '建立人員編號', visible: false },
    { field: 'CRT_USR_Name', header: '建立人員姓名', visible: false },
    { field: 'UPD_Date', header: '變更日期', visible: false, format: formatDateTime },
    { field: 'UPD_USR_No', header: '變更人員編號', visible: false },
    { field: 'UPD_USR_Name', header: '變更人員姓名', visible: false },
  ];
  //TODO 把它放在CRU
  // columns: any[] = [
  //   { field: 'mainSystem', header: '主系統', visible: true },
  //   { field: 'subSystem', header: '子系統項目', visible: true },
  //   { field: 'operationCode', header: '作業代碼', visible: true },
  //   { field: 'authorization', header: '具有限額之功能授權', visible: true },
  // ];
  constructor(
    private sys0210Service: Sys0210Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0730', '/SYS/SYS0730cru', this.queryForm);
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0210Service.queryRole(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(response => {
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
