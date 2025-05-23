import { Sys0230Service } from './../../../service/API/sys/sys0230.service';
import { Component, OnInit } from '@angular/core';
import {

  FormGroup,
  Validators,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { option, tblUser } from '../../../shared/models/sys/sysb000.module';
import { Column } from '../../../shared/componentkit/table/table.model';

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
  styleUrl: './sys0230.cru.component.scss',
})
// 角色之使用者設定維護 CRU
export class SYS0230CRUComponent extends BasicCruPageComponent<tblUser>
  implements OnInit {

  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [], // ID
    Role_No: ['', [Validators.required, Validators.maxLength(10)]], // 角色代號
    Role_Name: ['', [Validators.required, Validators.maxLength(30)]], // 角色名稱
    Description: ['', [Validators.maxLength(50)]], // 角色註記
  });

  roleUserData: UserOption[] = [];
  whetherOptions: any[] = [
    { value: true, label: '是' },
    { value: false, label: '否' },
  ];
  // ----------------------------------------------------------------
  roleUserColumns: Column[] = [
    {
      field: 'Match', header: '是否配對', visible: true,
      format: (value: boolean) =>
        this.whetherOptions.find((option) => option.value === value)?.label ||
        value,
    },
    { field: 'User_No', header: '使用者代號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
  ]
  selectedRoleUserData: UserOption[] = []; // 選取的使用者資料

  constructor(
    private sys0230Service: Sys0230Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYS0230', this.dataForm);
    this.loadOptions(this.dataForm.get('Role_No')?.value ?? ''); // 載入選項
  }
  // ----------------------------------------------------------------
  // 載入 角色之使用者
  loadOptions(roleNo: string) {
    console.log('需求:', roleNo);
    this.sys0230Service.queryRoleUsers({ Role_No: roleNo }).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.roleUserData = response.Data || [];

          // 初始化被選中的資料（Match 為 true）
          this.selectedRoleUserData = this.roleUserData.filter(user => user.Match === true);

          const user0900 = response.Data.find((u: UserOption) => u.User_No === '0900000001');
          console.log('⏱ 原始 Match 值:', JSON.parse(JSON.stringify(user0900)));

        } else {
          console.error('API error:', response.Status, response.Message);
        }
        this.loading = false;
        this.messageService.unblockUi();
      },
      error: (err: string) => {
        console.error('API error:', err);
        this.loading = false;
        this.messageService.unblockUi();
      },
    });
  }

  // ----------------------------------------------------------------
  // 點擊時變更 match狀態
  onUserSelectionChange(selectedItems: UserOption[]) {
    // 先記錄目前選取的 ID
    const selectedIds = selectedItems.map(item => item.ID);

    // loop 所有 roleUserData 來更新 Match 狀態
    this.roleUserData.forEach(user => {
      // 如果該使用者目前是被選取中的，就設為 true
      // 如果之前是 true 但現在沒被選，就變回 false
      user.Match = selectedIds.includes(user.ID) ? true : false;
    });

    this.selectedRoleUserData = selectedItems;
  }

  // ----------------------------------------------------------------
  onSubmit(frm: FormGroup) {
    // 修改：使用父類的 handleSubmit 方法
    this.handleSubmit(frm, () => {
      switch (this.crudstatus) {
        case CRUDStatus.Create:
          if (this.canAdd()) {
            // this.sys0210Service.createRole(frm.value).subscribe(() => {
            //   this.messageService.successBubble('新增成功');
            //   this.onCancel(); // 新增成功後返回查詢頁面
            // });
          }
          break;
        case CRUDStatus.Edit:
          if (this.canEdit()) {
            // console.log('User資料', frm.value);
            // console.log('變更後的清單', { RoleList: this.selectedRoleUserData.map(item => item.User_No) });
            const requestBody = {
              Role_No: frm.value.Role_No,
              UserNoList: this.selectedRoleUserData
                .filter(item => item.Match === true)
                .map(item => item.User_No),
              DeleteUserNoList: this.selectedRoleUserData
                .filter(item => item.Match === false)
                .map(item => item.User_No),
            };

            console.log('更新的請求內容', requestBody);
            this.sys0230Service.updateRoleUsers(requestBody).subscribe(() => {
              this.messageService.successBubble('更新成功');
              this.onCancel(); // 更新成功後返回查詢頁面
            });
          }
          break;
      }
    });
  }

  submitForm(frm: FormGroup) {
    this.onSubmit(frm);
  }

  onClearForm() {
    this.dataForm.reset(); // 重置表單
  }
}
