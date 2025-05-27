import { Sys0230Service } from './../../../service/API/sys/sys0230.service';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  Validators,
} from '@angular/forms';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { apiOption, option, tblUser } from '../../../shared/models/sys/sysb000.module';
import { Column, createPaginationConfig } from '../../../shared/componentkit/table/table.model';

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
  styleUrls: ['./sys0220.cru.component.scss'],
})

// 4-2-2-4使用者之角色設定維護 CRU
export class SYS0220CRUComponent extends BasicCruPageComponent<tblUser>
  implements OnInit {
  // 表單
  dataForm = this.formBuilder.nonNullable.group({
    ID: [], //ID
    user_No: ['', [Validators.required, Validators.maxLength(10)]], // 使用者編號
    user_Name: ['', [Validators.required, Validators.maxLength(20)]], // 使用者名稱
    user_Password: [''], // 使用者密碼-加密
    title: ['', Validators.maxLength(6)], // 職稱代碼-SYS1000
    org_ID: ['', Validators.maxLength(20)], // 組織編號 (SYSB400_SYS3100)

    str_dateStart: [null], // 帳號有效開始日期
    str_dateEnd: [null], // 帳號有效結束日期
    status: ['', [Validators.required, Validators.maxLength(1)]], // 使用者狀態 1=有效 2=停用
    user_type: ['', [Validators.required, Validators.maxLength(1)]], // 使用者型態 1=公司內部人員(default) 2=專櫃人員 3=其他

    user_email: ['', Validators.maxLength(100)], // 使用者email帳號
    TLT_No: ['', Validators.maxLength(12)], // 所屬專櫃編號
    remarks: ['', Validators.maxLength(100)], // 備註
    user_priority: ['', Validators.maxLength(1)], // 使用者等級
    USER_PwdExpireDate: [null], // 密碼到期日 YYYY/MM/DD HH:NN:SS，若使用者登入系統的時間大於此日期，則需強制使用者變更密碼

    last_Login: [null], // 最近一次登入

    ...createPaginationConfig([{ field: 'user_No', order: 1 }]), // 分頁和排序參數
  });

  // 用戶資訊
  userInfo: tblUser | null = null;

  // 下拉選單選項
  titleOptions: apiOption[] = [];
  SYS3100_Options: apiOption[] = [];
  userStatusOptions: option[] = [];
  userTypeOptions: option[] = [];
  whetherOptions: any[] = [
    { value: true, label: '是' },
    { value: false, label: '否' },
  ];

  roleUserData: RoleOption[] = [];
  // ----------------------------------------------------------------
  roleUserColumns: Column[] = [
    {
      field: 'Match', header: '是否配對', visible: true,
      format: (value: boolean) =>
        this.whetherOptions.find((option) => option.value === value)?.label ||
        value,
    },
    { field: 'role_no', header: '角色代號', visible: true },
    { field: 'role_name', header: '角色名稱', visible: true },
    { field: 'description', header: '角色註記', visible: true },

  ]
  selectedRoleUserData: RoleOption[] = []; // 選取的使用者資料

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
    console.log('需求:', userNo);
    this.sys0220Service.queryUserRoles({ User_No: userNo }).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.roleUserData = response.Data || [];

          // 初始化被選中的資料（Match 為 true）
          this.selectedRoleUserData = this.roleUserData.filter(user => user.Match === true);
          // console.log('result', this.selectedRoleUserData);

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
  onUserSelectionChange(selectedItems: RoleOption[]) {
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
            console.log('frm', frm.value);
            if (this.dataForm.get('user_No')?.value !== '' || null) {
              const requestBody = {
                User_No: this.dataForm.get('user_No')?.value,
                RoleNoList: this.selectedRoleUserData.map(item => item.role_no),
              };

              console.log('更新的請求內容', requestBody);
              this.sys0220Service.updateUserRoles(requestBody).subscribe(() => {
                this.messageService.successBubble('更新成功');
                this.onCancel(); // 更新成功後返回查詢頁面
              });
            }
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
