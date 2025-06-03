import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup } from '@angular/forms';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { apiOption, tblRole, tblUser } from '../../../shared/models/sys/sysb000.module';
import { CRUDStatus } from '../../../shared/models/system/CRUDstatus';
import { Sys0210Service } from '../../../service/API/sys/sys0210.service';
import { Sys0230Service } from '../../../service/API/sys/sys0230.service';

// 來源角色擁有的權限
export interface AuthOption {
  id: string; // ID
  label: string; // 角色代號
  children: AuthOption[]; // 角色名稱
  IsEnable: boolean; // 是否允許
  partialSelected: boolean; // 是否勾選
}

// 配對角色
export interface UserOption {
  ID: string; // ID
  User_No: string; // 角色代號
  User_Name: string; // 角色名稱
  Match: boolean; // 是否配對
}

// 4-2-2-3角色複製 CRU
@Component({
  selector: 'app-sys0240.cru',
  templateUrl: './sys0240.cru.component.html',
  styleUrl: './sys0240.cru.component.scss'
})

export class SYS0240CRUComponent extends BasicCruPageComponent<tblUser>
  implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [], // ID
    Role_No: ['', [Validators.required, Validators.maxLength(10)]], // 來源角色代碼
    Role_Name: ['', [Validators.required, Validators.maxLength(30)]], // 來源角色名稱
    Target_No: ['', [Validators.required, Validators.maxLength(10)]], // 目標角色代碼
    Target_Name: ['', [Validators.maxLength(30)]], // 目標角色名稱
    IsAllCopy: [false],
  });

  roleUserData: AuthOption[] = [];
  showUserData: AuthOption[] = [];
  whetherOptions: any[] = [
    { value: true, label: '是' },
    { value: false, label: '否' },
  ];

  targetOptions: apiOption[] = []; //目標角色
  roleUserAuthData: UserOption[] = []; //目標權限
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

  treeNodes = [
    "模組", "系統", "作業", "分頁", "權限"
  ];
  selectedRoleUserData: AuthOption[] = []; // 選取的使用者資料

  constructor(
    private sys0210Service: Sys0210Service,
    private sys0230Service: Sys0230Service,
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYS0240', this.dataForm);
    this.loadOptions(this.dataForm.get('Role_No')?.value ?? ''); // 載入選項
  }
  // ----------------------------------------------------------------
  // 載入 角色之使用者
  loadOptions(roleNo: string) {
    // 複製對象的角色
    this.sys0210Service.queryRole({}).subscribe((response) => {
      console.log('回應', response);
      this.targetOptions = response.Data.filter((item: tblRole) => item.Role_No !== roleNo) //複製清單排除自己
        .map((item: tblRole) => ({
          No: item.Role_No,
          Name: item.Role_Name,
          Label: item.Role_No + '-' + item.Role_Name,
        }));
    });

    //查詢 角色權限
    this.sys0230Service.queryRoleUsers({ Role_No: roleNo }).subscribe((response) => {
      console.log('角色權限 回應', response);
      this.roleUserAuthData = response.Data
    });

    // 樹狀圖 (顯示權限)
    this.sys0210Service.queryRolePrivileges({ Role_No: roleNo }).subscribe({
      next: (response) => {
        if (response.Status === '0000') {
          this.roleUserData = response.Data || [];

          // console.log('回傳使用者資料:', this.roleUserData);

          this.showUserData = this.filterSelectedTree(this.roleUserData); //只保留勾選的結構
          console.log('只保留已勾選的結構(顯示):', this.showUserData);
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

  // ---樹狀資料---
  // toggleSelection(node: AuthOption, selected: boolean) {
  //   node.partialSelected = selected;
  //   if (node.children?.length) {
  //     node.children.forEach(child => this.toggleSelection(child, selected));
  //   }
  // }

  onMembersSelected(selected: any[]) {
    console.log('從子元件選到的:', selected);
  }

  // 點擊時變更 match狀態
  onUserSelectionChange(selectedItems: AuthOption[]) {
    // 先記錄目前選取的 ID
    const selectedIds = selectedItems.map(item => item.id);

    // loop 所有 roleUserData 來更新 Match 狀態
    this.roleUserData.forEach(user => {
      // 如果該使用者目前是被選取中的，就設為 true
      // 如果之前是 true 但現在沒被選，就變回 false
      user.partialSelected = selectedIds.includes(user.id) ? true : false;
    });

    this.selectedRoleUserData = selectedItems;

    console.log('選擇的項目', this.selectedRoleUserData);
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
            const requestBody = {
              Source_No: this.dataForm.get('Role_No')?.value ?? '',
              Target_No: frm.value.Target_No,
              IsAllCopy: frm.value.IsAllCopy
            };

            console.log('更新的請求內容', requestBody);
            this.sys0210Service.copyRoleSettings(requestBody).subscribe(() => {
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

  // 扁平化資料
  filterSelectedTree(data: AuthOption[]): AuthOption[] {
    return data
      .map(node => {
        const selectedChildren = this.filterSelectedTree(node.children || []);
        const isSelected = node.partialSelected || selectedChildren.length > 0;
        if (isSelected) {
          return {
            ...node,
            children: selectedChildren
          };
        }
        return null;
      })
      .filter(node => node !== null) as AuthOption[];
  }
}
