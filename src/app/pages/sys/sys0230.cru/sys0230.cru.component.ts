import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { DialogComponent } from '@shared/componentkit/dialog/dialog.component';
import { PanelModule } from 'primeng/panel';
import { finalize } from 'rxjs';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { TableComponent } from '../../../shared/componentkit/table/table.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { tblUser } from '../../../shared/models/sys/sysb000.model';
import { Sys0230Service } from './../../../service/api/sys/sys0230.service';

export interface UserOption {
  ID: string; // ID
  User_No: string; // 使用者代號
  User_Name: string; // 使用者名稱
  Match: boolean; // 是否配對 (指示此使用者是否已與此角色匹配)
}

// 4-2-2-2 角色之使用者設定維護 CRU
@Component({
  selector: 'app-sys0230-cru',
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
    DialogComponent,
  ],
})
export class SYS0230CRUComponent extends BasicCruPageComponent<tblUser> implements OnInit {
  // 表單控制項，用於顯示角色資訊 (角色代號、角色名稱、角色註記)
  dataForm = this.formBuilder.nonNullable.group({
    Role_No: [{ value: '', disabled: true }], // 角色代號 (不可編輯)
    Role_Name: [{ value: '', disabled: true }], // 角色名稱 (不可編輯)
    Description: [{ value: '', disabled: true }], // 角色註記 (不可編輯)
  });

  // 主表格資料：已指派給此角色的使用者列表
  assignedUsers: UserOption[] = [];
  // 記錄頁面載入時，最初已指派給此角色的使用者列表 (用於計算提交時的刪除清單)
  private initialAssignedUsers: UserOption[] = [];
  // 主表格選取項目：選取的主表格使用者資料
  selectedAssignedUsers: UserOption[] = [];

  // 從後端載入的所有使用者列表，包含已匹配和未匹配的 (作為彈跳視窗篩選的原始資料源)
  private allUsersFromServer: UserOption[] = [];
  // 彈跳視窗表格資料：目前可供選取指派的使用者列表 (會根據篩選和已指派列表動態更新)
  availableUsers: UserOption[] = [];
  // 彈跳視窗選取項目：選取的彈跳視窗使用者資料
  selectedAvailableUsers: UserOption[] = [];

  // 彈跳視窗的顯示狀態
  dialogVisible = false;

  // 彈跳視窗篩選表單控制項
  filterDialogForm = this.formBuilder.nonNullable.group({
    User_No: [''], // 篩選使用者編號
    User_Name: [''], // 篩選使用者名稱
  });

  // 主表格的欄位定義
  assignedUsersColumns: Column[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
  ];

  // 彈跳視窗表格的欄位定義
  availableUsersColumns: Column[] = [
    { field: 'User_No', header: '使用者編號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
  ];

  constructor(private sys0230Service: Sys0230Service) {
    super(); // 呼叫父類 BasicCruPageComponent 的建構子
  }

  ngOnInit(): void {
    // 初始化頁面，設定程式編號和主表單
    this.initializePage('SYS0230', this.dataForm);
    // 載入角色下的使用者資料
    this.loadRoleUsers(this.dataForm.get('Role_No')?.value ?? '');

    // 監聽篩選表單的變化，並在變化時觸發篩選可選取的使用者
    this.filterDialogForm.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.filterAvailableUsers();
    });
  }

  /**
   * 載入指定角色下的所有使用者資訊。
   * 從後端取得所有使用者，並區分為已指派和未指派兩類。
   * @param roleNo 角色代號
   */
  loadRoleUsers(roleNo: string) {
    this.sys0230Service.queryRoleUsers({ Role_No: roleNo }).subscribe((response) => {
      // 儲存從伺服器載入的所有使用者 (包括已匹配和未匹配的)
      this.allUsersFromServer = response.Data as UserOption[];

      // 初始化已指派使用者列表 (主表格資料)
      this.assignedUsers = this.allUsersFromServer.filter((user: UserOption) => user.Match);
      // 記錄初始載入的已指派使用者，用於計算提交時的刪除清單
      this.initialAssignedUsers = [...this.assignedUsers];

      // 初始化可選取使用者列表 (彈跳視窗資料)，會根據當前已指派的使用者動態生成
      this.filterAvailableUsers();
    });
  }

  /**
   * 處理表單提交，更新角色的使用者關聯。
   * 根據頁面上的變化，計算要新增和要刪除的使用者清單。
   * @param frm 當前的主表單 FormGroup
   */
  onSubmit(frm: FormGroup) {
    // 使用父類的 handleSubmit 方法處理提交邏輯 (例如表單驗證、loading 狀態)
    this.handleSubmit(frm, () => {
      // 取得目前已指派的使用者編號清單
      const currentAssignedUserNos = this.assignedUsers.map((user) => user.User_No);
      // 取得最初已指派的使用者編號清單
      const initialAssignedUserNos = this.initialAssignedUsers.map((user) => user.User_No);

      // 計算要刪除的使用者清單：在初始列表中但不在目前列表中的使用者
      const deleteUserNoList = initialAssignedUserNos.filter(
        (userNo) => !currentAssignedUserNos.includes(userNo)
      );

      // 構建請求主體
      const requestBody = {
        Role_No: frm.getRawValue().Role_No, // 角色代號
        UserNoList: currentAssignedUserNos, // 最終要指派給該角色的使用者清單 (包括新增和原本就有的)
        DeleteUserNoList: deleteUserNoList, // 要從該角色移除的使用者清單
      };

      // 呼叫 API 更新角色使用者
      this.sys0230Service
        .updateRoleUsers(requestBody)
        .pipe(
          untilDestroyed(this),
          finalize(() => (this.loading = false)) // 無論成功失敗都關閉 loading
        )
        .subscribe(() => {
          this.messageService.successBubble('更新成功');
          this.onCancel(); // 更新成功後返回查詢頁面
        });
    });
  }

  /**
   * 處理彈跳視窗的儲存動作，將選取的使用者從可選取列表移至已指派列表。
   */
  saveDialog() {
    this.dialogVisible = false; // 關閉彈跳視窗

    // 將彈跳視窗中選取的使用者添加到主表格的已指派使用者列表
    this.assignedUsers = [...this.assignedUsers, ...this.selectedAvailableUsers];

    // 清空彈跳視窗的選取狀態
    this.selectedAvailableUsers = [];
    // 重置篩選表單，以便下次打開時顯示完整的未指派列表
    this.filterDialogForm.reset();

    // 重新篩選可選取列表，以更新彈跳視窗中的數據
    this.filterAvailableUsers();
  }

  /**
   * 處理從主表格中刪除使用者（即取消指派）。
   * 將被刪除的使用者從已指派列表移回可選取列表。
   * @param usersToDelete 要從已指派列表中移除的使用者清單
   */
  onDelete(usersToDelete: UserOption[]) {
    // 從已指派使用者列表中移除這些使用者
    this.assignedUsers = this.assignedUsers.filter(
      (assignedUser) => !usersToDelete.some((deletedUser) => deletedUser.ID === assignedUser.ID)
    );

    // 重新篩選可選取列表，以更新彈跳視窗中的數據
    this.filterAvailableUsers();
  }

  /**
   * 根據篩選表單的輸入，篩選彈跳視窗中可選取的使用者列表。
   * 這個方法現在會從 `allUsersFromServer` 中過濾，並排除任何已經在 `assignedUsers` 中的項目。
   */
  filterAvailableUsers(): void {
    const { User_No, User_Name } = this.filterDialogForm.value;

    // 從所有使用者列表開始篩選
    let filteredData = [...this.allUsersFromServer];

    // 應用使用者編號篩選
    if (User_No) {
      filteredData = filteredData.filter((user) => user.User_No.includes(User_No));
    }
    // 應用使用者名稱篩選
    if (User_Name) {
      filteredData = filteredData.filter((user) => user.User_Name.includes(User_Name));
    }

    // 最後，確保篩選後的列表只包含那些目前尚未被指派的使用者
    this.availableUsers = filteredData.filter(
      (availableUser) => !this.assignedUsers.some((assignedUser) => assignedUser.ID === availableUser.ID)
    );
  }
}
