import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { IUserResponse, Sys0110Service } from '@service/api/sys/sys0110.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { Sys0710Response, Sys0710Service } from '@service/api/sys/sys0710.service';

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
    DropdownComponent
  ],
})
// 使用者系統權限列表
export class SYS0710Component extends BasicQueryPageComponent<Sys0710Response> implements OnInit {
  queryForm = this.formBuilder.group({
    user_No: ['', [Validators.required]], // 使用者編號
    ...createPaginationConfig([{ field: 'MainSystemCode', order: 1 }]), // 分頁和排序參數
  });
  totalRecords = 0;// 分頁和排序參數 // 排序需要
  data: Sys0710Response[] = [];
  userNoOptions: IUserResponse[] = [];
  columns: Column[] = [
    { field: 'User_No', header: '使用者編號', visible: true, showSort: false },
    { field: 'User_Name', header: '使用者名稱', visible: true, showSort: false },
    { field: 'MainSystemCode', header: '主系統代碼', visible: true },
    { field: 'MainSystemName', header: '主系統名稱', visible: true },
    { field: 'SubsystemCode', header: '子系統代碼', visible: true },
    { field: 'SubsystemName', header: '子系統名稱', visible: true },
    { field: 'Prog_No', header: '作業代碼', visible: true },
    { field: 'Prog_Name', header: '作業名稱', visible: true },
    { field: 'FunctionButtons', header: '具有權限之功能按鍵', visible: true },
  ];
  constructor(
    private readonly sys0110Service: Sys0110Service,
    private readonly sys0710Service: Sys0710Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0710', '/SYS/sys0710cru', this.queryForm);
    this.sys0110Service.queryAllUsers().pipe(untilDestroyed(this)).subscribe(response => {
      if (response.Data) {
        this.userNoOptions = response.Data.map((user: IUserResponse) => {
          return {
            ...user,
            label: user.user_No + ' - ' + user.user_Name
          }
        });
      }
    })
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      this.sys0710Service.querySys0710(frm.value).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((response) => {
        if (response.Data) {
          this.data = response.Data
          this.totalRecords = response.TotalCount || response.Data.length;
          this.queryStateService.setQueryState(this.ProgNo, frm.value);
        } else {
          this.data = [];
          this.totalRecords = 0;
        }
      });
    });
  }
}
