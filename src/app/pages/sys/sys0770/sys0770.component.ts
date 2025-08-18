import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { TranslateModule } from '@ngx-translate/core';
import { BasicQueryPageComponent } from '@shared/componentextends/basic-qpage/basic-query-page.component';
import { Column, createPaginationConfig } from '@shared/componentkit/table/table.model';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize, Observable } from 'rxjs';
import { DropdownComponent } from '@shared/componentkit/dropdown/dropdown.component';
import { SelectItem } from 'primeng/api'; // PrimeNG SelectItem

// 導入 SYS0770 服務和模型
import {
  QuerySYS0770Request,
  QueryUsersResponse,
  QueryUserRolesResponse,
  Sys0770Service
} from '@service/api/sys/sys0770.service';
import { ApiResponse } from '@service/system/auth.service';

// 定義授權型態的列舉
export enum AuthorizationType {
  User = 'User',
  Role = 'Role'
}

@Component({
  selector: 'app-sys0770',
  templateUrl: './sys0770.component.html',
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
// 所有使用者設定的角色權限列表
export class SYS0770Component extends BasicQueryPageComponent<QueryUsersResponse | QueryUserRolesResponse> implements OnInit {
  // 查詢表單，包含授權型態和分頁/排序參數
  queryForm = this.formBuilder.group({
    authType: [AuthorizationType.User, [Validators.required]], // 授權型態，預設為 'User'
    ...createPaginationConfig([{ field: 'User_No', order: 1 }]), // 初始無特定排序，由 authType 決定
  });

  totalRecords = 0;
  // 資料類型為聯集，因為會根據 authType 改變
  data: (QueryUsersResponse | QueryUserRolesResponse)[] = [];

  // 授權型態下拉選單選項
  authTypeOptions: SelectItem[] = [
    { label: '使用者', value: AuthorizationType.User },
    { label: '角色', value: AuthorizationType.Role }
  ];

  // 動態表格欄位定義
  columns: Column[] = [];

  constructor(
    private readonly sys0770Service: Sys0770Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0770', '/SYS/SYS0770cru', this.queryForm);

    // 監聽授權型態的變化，並立即觸發一次查詢
    this.queryForm.controls.authType.valueChanges
      .pipe(untilDestroyed(this))
      .subscribe(value => {
        this.updateTableConfig(value as AuthorizationType); // 更新表格欄位和預設排序
      });
    // 初始化表格配置（根據預設的 authType）
    this.updateTableConfig(this.queryForm.controls.authType.value as AuthorizationType);
  }

  /**
   * 根據選定的授權型態更新表格欄位和預設排序
   */
  updateTableConfig(authType: AuthorizationType): void {
    if (authType === AuthorizationType.User) {
      this.columns = [
        { field: 'User_No', header: '使用者編號', visible: true, showSort: true },
        { field: 'User_Name', header: '使用者名稱', visible: true, showSort: true },
      ];
      this.data = [];
    } else { // AuthorizationType.Role
      this.columns = [
        { field: 'User_No', header: '使用者編號', visible: true, showSort: true },
        { field: 'User_Name', header: '使用者名稱', visible: true, showSort: true },
        { field: 'Role_No', header: '角色代號', visible: true, showSort: true },
        { field: 'Role_Name', header: '角色名稱', visible: true, showSort: true },
      ];
      this.data = [];
    }
  }

  // 表單提交邏輯
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const authType = frm.value.authType;
      const requestBody: QuerySYS0770Request = {
        pageIndex: frm.value.pageIndex,
        pageSize: frm.value.pageSize,
        SortBy: frm.value.SortBy
      };

      let queryObservable: Observable<ApiResponse<any[]>>;

      if (authType === AuthorizationType.User) {
        queryObservable = this.sys0770Service.queryAllUsers(requestBody);
      } else { // AuthorizationType.Role
        queryObservable = this.sys0770Service.queryUserRoles(requestBody);
      }

      queryObservable
        .pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        )
        .subscribe((response) => {
          if (response.Data) {
            this.data = response.Data;
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
