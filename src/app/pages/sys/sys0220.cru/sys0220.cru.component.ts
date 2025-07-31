import { Sys0230Service } from './../../../service/api/sys/sys0230.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { tblUser } from '../../../shared/models/sys/sysb000.module';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { untilDestroyed } from '@ngneat/until-destroy';
import { finalize } from 'rxjs';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';

export interface RoleOption {
  ID: string; // ID
  role_no: string; // 使用者代號
  role_name: string; // 角色名稱
  description: string; // 角色註記
  Match: boolean; // 是否配對
}

@Component({
  selector: 'app-sys0220-cru',
  templateUrl: './sys0220.cru.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    TableComponent,
    NgIf,
    TranslateModule,
    DialogComponent
  ],
})

// 4-2-2-4使用者之角色設定維護 CRU
export class SYS0220CRUComponent extends BasicCruPageComponent<tblUser>
  implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    user_No: ['', [Validators.required, Validators.maxLength(10)]], // 使用者編號
    user_Name: ['', [Validators.required, Validators.maxLength(20)]], // 使用者名稱
  });
  roleUserData: RoleOption[] = [];
  roleUserColumns: Column[] = [
    { field: 'role_no', header: '角色代號', visible: true },
    { field: 'role_name', header: '角色名稱', visible: true },
    { field: 'description', header: '角色註記', visible: true },
  ]
  selectedRoleUserData: RoleOption[] = []; // 選取的使用者資料
  cloneRoleUserData: RoleOption[] = []; // 用於儲存原始資料的副本
  constructor(
    private sys0220Service: Sys0230Service, //這邊的api設定與SYS0220共用
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYS0220', this.dataForm);
    this.loadOptions(this.dataForm.get('user_No')?.value ?? ''); // 載入選項
  }

  // ----------------------------------------------------------------
  // 載入 角色之使用者
  loadOptions(userNo: string) {
    this.sys0220Service.queryUserRoles({ User_No: userNo }).subscribe((response) => {
      this.dialogData = response.Data;
      this.roleUserData = response.Data.filter((role: RoleOption) => role.Match);
      this.cloneRoleUserData = this.roleUserData; // 深拷貝
    });
  }
  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const requestBody = {
        User_No: frm.getRawValue().user_No,
        RoleNoList: this.roleUserData.map(role => role.role_no),
      }
      this.sys0220Service.updateUserRoles(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(() => {
        this.messageService.successBubble('更新成功');
        this.onCancel(); // 更新成功後返回查詢頁面
      });
    });
  }
  dialogVisible = false;
  selectedItemsDialog: RoleOption[] = [];
  dialogData: RoleOption[] = [];
  dialogColumns: Column[] = [
    { field: 'role_no', header: '角色代號', visible: true },
    { field: 'role_name', header: '角色名稱', visible: true },
  ];
  isRowSelectable(event: RoleOption): boolean {
    return !this.roleUserData || !this.roleUserData.some((item: RoleOption) => item.ID === event.ID);
  }
  saveDialog() {
    this.dialogVisible = false;
    this.roleUserData = [...this.roleUserData, ...this.selectedItemsDialog];
    this.selectedItemsDialog = [];
  }
}
