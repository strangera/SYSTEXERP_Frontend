import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Role, TreeNode } from '../../../shared/models/sys/role.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sys0210Service } from '../../../service/API/sys/sys0210.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ApiResponse } from '../../../service/system/auth.service';
import { trigger, style, animate, transition } from '@angular/animations';
import { Sys0230Service } from '../../../service/API/sys/sys0230.service';

export const expandAnimation = trigger('expandAnimation', [
  // 當元素進入 DOM 時 (item.IsEnable 從 false 變 true)
  transition(':enter', [
    style({ height: '0px', opacity: 0, overflow: 'hidden' }), // 初始狀態
    animate('200ms ease-in-out', style({ height: '*', opacity: 1 })) // 動畫到完全顯示
  ]),
  // 當元素離開 DOM 時 (item.IsEnable 從 true 變 false)
  transition(':leave', [
    style({ height: '*', opacity: 1, overflow: 'hidden' }), // 初始狀態 (當前高度)
    animate('200ms ease-in-out', style({ height: '0px', opacity: 0 })) // 動畫到完全隱藏
  ])
]);

interface PrivilegeOutput {
  prog_no: string;
  function_code: string;
  isEnable: 'Y' | 'N'; // 這裡明確為 'Y' 或 'N'
}

// 4.2.3.1 角色系統權限設定 CRU
@Component({
  selector: 'app-sys0310.cru',
  templateUrl: './sys0310.cru.component.html',
  styleUrls: ['./sys0310.cru.component.scss'],
  animations: [expandAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// 角色系統權限設定 CRU
export class SYS0310CRUComponent extends BasicCruPageComponent<Role> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Role_No: [{ value: '', disabled: true }], // 角色代碼
    Role_Name: [{ value: '', disabled: true }], // 角色名稱
    Description: [{ value: '', disabled: true }], // 角色描述
  });
  FIN00000Data: TreeNode | undefined; // 人資財會模組
  ASS00000Data: TreeNode | undefined; // 物業管理模組
  TLS00000Data: TreeNode | undefined; // 商場管理模組
  SYS0000Data: TreeNode | undefined; // 權限及基本資料
  CPM0000Data: TreeNode | undefined; // 行銷管理模組
  activeIndex = 0;
  columns: Column[] = [
    { field: 'label', header: '程式名稱' }, // 可以改為更通用的名稱，如 '名稱' 或 '項目'
  ];
  constructor(
    private sys0210Service: Sys0210Service,
    private sys0230Service: Sys0230Service,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYS0310', this.dataForm);
    this.sys0210Service.queryRolePrivileges({ Role_No: `${this.rowdata?.Role_No}` }).subscribe({
      next: (response: ApiResponse<TreeNode[]>) => {
        if (response.Data && Array.isArray(response.Data)) {
          response.Data.forEach(node => {
            switch (node.id) { // 這裡改為使用 node.id
              case 'ASS00000':
                this.ASS00000Data = node; // 賦值單個 TreeNode 物件
                break;
              case 'CPM0000':
                this.CPM0000Data = node;
                break;
              case 'FIN00000':
                this.FIN00000Data = node;
                break;
              case 'SYS0000':
                this.SYS0000Data = node;
                break;
              case 'TLS00000':
                this.TLS00000Data = node;
                break;
              default:
                break;
            }
          });
          this.cdr.markForCheck();
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }
  onSubmit(): void {
    const privilegeList: PrivilegeOutput[] = [];

    const processModuleData = (moduleData: TreeNode | undefined) => {
      if (!moduleData || !moduleData.children) {
        return;
      }

      // 遍歷 Level 2: item (e.g., FIN00000.children)
      moduleData.children.forEach(item => {
        if (!item.children) {
          return;
        }

        // 遍歷 Level 3: subItem (e.g., item.children)
        item.children.forEach(subItem => {
          if (!subItem.children) {
            return;
          }

          // 遍歷 Level 4: program (e.g., subItem.children)
          subItem.children.forEach(program => { // <-- 這是新的 "program" 層次
            if (!program.children) {
              return;
            }

            // 遍歷 Level 5: behavior (functions, e.g., program.children)
            program.children.forEach(behavior => {
              // 檢查 behavior 的 IsEnable 狀態
              if (behavior.IsEnable !== undefined && behavior.IsEnable) { // 確保 IsEnable 存在
                privilegeList.push({
                  prog_no: program.id,       // Level 4 的 id (這個現在是你要的 prog_no)
                  function_code: behavior.id,  // Level 5 的 id (這個現在是你要的 function_code)
                  isEnable: 'Y'  // 根據 IsEnable 狀態給 'Y' 或 'N'
                });
              }
            });
          });
        });
      });
    };

    // 依序處理每個模組的數據
    processModuleData(this.FIN00000Data);
    processModuleData(this.ASS00000Data);
    processModuleData(this.TLS00000Data);
    processModuleData(this.SYS0000Data);
    processModuleData(this.CPM0000Data);

    console.log('Generated Privilege List:', privilegeList);

    const body = {
      Role_No: this.dataForm.value.Role_No,
      data: privilegeList
    };

    this.sys0230Service.updateRolePrivileges(body).subscribe({
      next: (response: ApiResponse<any>) => {
        console.log('Update Role Privileges Response:', response);
        this.loading = false;
        this.onCancel();
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  selectedChildId: string | null = null;

  getIconClass(moduleId: string): string {
    switch (moduleId) {
      case 'FIN00000':
        return 'pi pi-users';
      case 'ASS00000':
        return 'pi pi-briefcase';
      case 'TLS00000':
        return 'pi pi-shopping-bag';
      case 'SYS0000':
        return 'pi pi-user';
      case 'CPM0000':
        return 'pi pi-chart-pie';
      default:
        return 'pi pi-circle';
    }
  }
  trackByFn(index: number, item: any): string {
    return item.id; // 假設每個 TreeNode 都有唯一的 'id'
  }
}
