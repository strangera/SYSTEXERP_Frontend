import { Sys0230Service } from './../../../service/api/sys/sys0230.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { tblUser } from '../../../shared/models/sys/sysb000.model';
import { Column } from '../../../shared/componentkit/table/table.model';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { finalize } from 'rxjs';
import { untilDestroyed } from '@ngneat/until-destroy';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';

export interface UserOption {
  ID: string; // ID
  User_No: string; // 角色代號
  User_Name: string; // 角色名稱
  Match: boolean; // 是否配對
}

// 4-2-2-2 角色之使用者設定維護
@Component({
  selector: 'app-sys0230.cru',
  templateUrl: './sys0230.cru.component.html',
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
// 角色之使用者設定維護 CRU
export class SYS0230CRUComponent extends BasicCruPageComponent<tblUser>
  implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Role_No: [{ value: '', disabled: true }], // 角色代號
    Role_Name: [{ value: '', disabled: true }], // 角色名稱
    Description: [{ value: '', disabled: true }], // 角色註記
  });
  roleUserData: UserOption[] = [];
  roleUserColumns: Column[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
  ]
  selectedRoleUserData: UserOption[] = []; // 選取的使用者資料
  cloneRoleUserData: UserOption[] = []; // 用於儲存原始資料的副本

  constructor(
    private sys0230Service: Sys0230Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYS0230', this.dataForm);
    this.loadOptions(this.dataForm.get('Role_No')?.value ?? ''); // 載入選項
  }
  // 載入 角色之使用者
  loadOptions(roleNo: string) {
    this.sys0230Service.queryRoleUsers({ Role_No: roleNo }).subscribe((response) => {
      this.dialogData = response.Data;
      this.roleUserData = response.Data.filter((user: UserOption) => user.Match);
      this.cloneRoleUserData = this.roleUserData; // 深拷貝
    });
  }
  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      const requestBody = {
        Role_No: frm.getRawValue().Role_No,
        UserNoList: this.roleUserData.map(user => user.User_No),
        DeleteUserNoList: this.cloneRoleUserData
          .filter(user => !this.roleUserData.some(u => u.User_No === user.User_No))
          .map(user => user.User_No),
      }
      this.sys0230Service.updateRoleUsers(requestBody).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(() => {
        this.messageService.successBubble('更新成功');
        this.onCancel(); // 更新成功後返回查詢頁面
      });
    });
  }
  dialogVisible = false;
  selectedItemsDialog: UserOption[] = [];
  dialogData: UserOption[] = [];
  dialogColumns: Column[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
  ];
  isRowSelectable(event: UserOption): boolean {
    return !this.roleUserData || !this.roleUserData.some((item: UserOption) => item.ID === event.ID);
  }
  // onDeleteRoleUser(selectedItems: UserOption[]) {
  //   this.roleUserData = this.roleUserData.filter(row => !selectedItems.includes(row));
  // }
  saveDialog() {
    this.dialogVisible = false;
    this.roleUserData = [...this.roleUserData, ...this.selectedItemsDialog];
    this.selectedItemsDialog = [];
  }
}
