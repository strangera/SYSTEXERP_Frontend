import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Role } from '@shared/models/sys/role.model';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { Sys0210Service } from '@service/api/sys/sys0210.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';

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
    DropdownComponent
  ],
})
// 角色系統權限列表
export class SYS0730Component extends BasicQueryPageComponent<any> implements OnInit {
  queryForm = this.formBuilder.group({
    Role_No: ['', [Validators.maxLength(10)]], // 角色代號
    ...createPaginationConfig([{ field: 'Role_No', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: any[] = [];
  columns: Column[] = [
    { field: '', header: '主系統', visible: true },
    { field: '', header: '子系統項目', visible: true },
    { field: '', header: '作業代碼', visible: true },
    { field: '', header: '具有限額之功能授權', visible: true },
  ];
  roleCodeOptions: Role[] = [];
  constructor(
    private sys0210Service: Sys0210Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0730', '/SYS/SYS0730cru', this.queryForm);
    this.sys0210Service.queryAllRole().pipe(untilDestroyed(this)).subscribe(response => {
      if (response.Data) {
        this.roleCodeOptions = response.Data.map((role: Role) => {
          return {
            ...role,
            label: role.Role_No + ' - ' + role.Role_Name
          }
        });
      }
    })
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
