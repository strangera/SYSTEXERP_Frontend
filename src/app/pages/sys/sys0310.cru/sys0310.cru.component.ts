import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Role, TreeNode } from '../../../shared/models/sys/role.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sys0210Service } from '../../../service/API/sys/sys0210.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ApiResponse } from '../../../service/system/auth.service';
import { Sys0230Service } from '../../../service/API/sys/sys0230.service';

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
            // 在這裡呼叫輔助方法，為每個節點及其子節點設置 parent 引用
            const transformedNode = this.setParentReferences(node);

            switch (transformedNode.id) {
              case 'ASS00000':
                this.ASS00000Data = transformedNode;
                break;
              case 'CPM0000':
                this.CPM0000Data = transformedNode;
                break;
              case 'FIN00000':
                this.FIN00000Data = transformedNode;
                break;
              case 'SYS0000':
                this.SYS0000Data = transformedNode;
                break;
              case 'TLS00000':
                this.TLS00000Data = transformedNode;
                break;
              default:
                break;
            }
          });
          // 初始載入時，更新所有父節點的 partialSelected 狀態
          this.updateAllParentNodeStatuses();
          this.setInitialOpenStateForSecondLevelNodes();
          this.cdr.markForCheck(); // 觸發一次變更檢測
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }
  private setParentReferences(node: TreeNode, parent: TreeNode | null = null): TreeNode {
    const newNode: TreeNode = { ...node, parent: parent || undefined };

    // 初始化 partialSelected 和 isOpen
    if (newNode.partialSelected === undefined) {
      newNode.partialSelected = false;
    }
    // 為第二層節點（模組下的直接子節點）初始化 isOpen
    // 我們假設 `item` 是指模組的直接子節點，它們會有 `isOpen` 屬性
    if (parent && parent.id && parent.id.endsWith('00000') || parent?.id.endsWith('0000')) { // 判斷是否為模組的直接子節點
      if (newNode.isOpen === undefined) {
        newNode.isOpen = false;
      }
    }


    if (newNode.children && newNode.children.length > 0) {
      newNode.children = newNode.children.map(child =>
        this.setParentReferences(child, newNode)
      );
    }

    if (newNode.actions && newNode.actions.length > 0) {
      newNode.actions = newNode.actions.map(action =>
        this.setParentReferences(action, newNode)
      );
    }

    return newNode;
  }

  private updateAllParentNodeStatuses() {
    const modules = [this.FIN00000Data, this.ASS00000Data, this.TLS00000Data, this.SYS0000Data, this.CPM0000Data];
    modules.forEach(moduleData => {
      if (moduleData) {
        // 從最底層的 behavior 開始，向上更新所有父節點的狀態
        this.traverseAndCalculateStatus(moduleData);
      }
    });
  }

  private traverseAndCalculateStatus(node: TreeNode) {
    // 先遞迴處理子節點和 actions，確保它們的狀態是最新的
    if (node.children) {
      node.children.forEach(child => this.traverseAndCalculateStatus(child));
    }
    if (node.actions) {
      node.actions.forEach(action => this.traverseAndCalculateStatus(action));
    }

    // 計算當前節點 (node) 的 IsEnable 和 partialSelected 狀態
    // 只有當節點有 children 或 actions 時才需要計算
    if ((node.children && node.children.length > 0) || (node.actions && node.actions.length > 0)) {
      let totalSelectableItems = 0;
      let selectedItemsCount = 0;
      let hasPartialSelectedChild = false;

      // 統計所有直接子節點的狀態
      if (node.children) {
        node.children.forEach(child => {
          totalSelectableItems++; // 每個子節點本身是可選單元
          if (child.IsEnable) {
            selectedItemsCount++;
          }
          if (child.partialSelected) {
            hasPartialSelectedChild = true;
          }
        });
      }

      // 統計所有 actions (行為) 的狀態
      if (node.actions) {
        node.actions.forEach(action => {
          totalSelectableItems++; // 每個 action 也是可選單元
          if (action.IsEnable) {
            selectedItemsCount++;
          }
        });
      }

      // 根據子項的狀態更新當前節點
      if (totalSelectableItems === 0) {
        // 沒有任何可選項目，父節點應該是未勾選
        node.IsEnable = false;
        node.partialSelected = false;
      } else if (selectedItemsCount === totalSelectableItems) {
        // 所有可選項目都已選中，父節點完全勾選
        node.IsEnable = true;
        node.partialSelected = false;
      } else if (selectedItemsCount > 0 || hasPartialSelectedChild) {
        // 有部分項目選中或有部分選中的子節點，父節點部分勾選
        node.IsEnable = false; // 不是完全勾選
        node.partialSelected = true;
      } else {
        // 沒有任何項目選中，父節點未勾選
        node.IsEnable = false;
        node.partialSelected = false;
      }
    }
  }
  private setInitialOpenStateForSecondLevelNodes() {
    const modules = [this.FIN00000Data, this.ASS00000Data, this.TLS00000Data, this.SYS0000Data, this.CPM0000Data];
    modules.forEach(moduleData => {
      if (moduleData && moduleData.children) {
        moduleData.children.forEach(item => { // 這就是你說的第二層 `item`
          // 檢查 `item` 的直接子節點或 actions 中是否有任何 `partialSelected` 為 true
          let shouldOpen = false;
          if (item.children) {
            if (item.children.some(child => child.partialSelected || child.IsEnable)) {
              shouldOpen = true;
            }
          }
          if (item.actions) {
            // 雖然 actions 通常不會有 partialSelected 屬性，但為了通用性還是檢查一下
            if (item.actions.some(action => action.partialSelected || action.IsEnable)) {
              shouldOpen = true;
            }
          }

          // 如果 item 本身是 partialSelected，也應該打開
          if (item.partialSelected) {
            shouldOpen = true;
          }

          item.isOpen = shouldOpen;
        });
      }
    });
  }
  onNodeCheckboxChange(node: TreeNode, newValue: boolean) {
    node.IsEnable = newValue; // 更新當前節點的 IsEnable

    // 1. 向下聯動：如果當前節點被勾選/取消勾選，則其所有子節點和 actions 都應同步
    this.cascadeDown(node, newValue);

    // 2. 向上聯動：從當前節點開始，向上更新所有父節點的 IsEnable 和 partialSelected
    this.cascadeUp(node);

    this.cdr.markForCheck(); // 觸發變更檢測以更新 UI
  }
  private cascadeUp(node: TreeNode) {
    if (!node.parent) {
      return; // 如果沒有父節點，則停止遞迴
    }

    const parentNode = node.parent;
    let totalSelectableChildrenAndActions = 0;
    let selectedChildrenAndActionsCount = 0;
    let hasPartialSelectedChildOrAction = false;

    // 計算父節點的所有直接子節點和 actions 的狀態
    // 注意：這裡應該是統計父節點的所有直接子節點 (children) 和 actions
    if (parentNode.children) {
      parentNode.children.forEach(child => {
        totalSelectableChildrenAndActions++;
        if (child.IsEnable) {
          selectedChildrenAndActionsCount++;
        }
        if (child.partialSelected) { // 檢查子節點是否有部分選中狀態
          hasPartialSelectedChildOrAction = true;
        }
      });
    }

    if (parentNode.actions) {
      parentNode.actions.forEach(action => {
        totalSelectableChildrenAndActions++;
        if (action.IsEnable) {
          selectedChildrenAndActionsCount++;
        }
      });
    }

    // 根據子項的狀態更新父節點
    const oldParentIsEnable = parentNode.IsEnable;
    const oldParentPartialSelected = parentNode.partialSelected;

    if (totalSelectableChildrenAndActions === 0) {
      parentNode.IsEnable = false;
      parentNode.partialSelected = false;
    } else if (selectedChildrenAndActionsCount === totalSelectableChildrenAndActions) {
      // 所有子項都已選中，父節點完全勾選
      parentNode.IsEnable = true;
      parentNode.partialSelected = false;
    } else if (selectedChildrenAndActionsCount > 0 || hasPartialSelectedChildOrAction) {
      // 有部分子項選中或有部分選中的子節點，父節點部分勾選
      parentNode.IsEnable = false; // 不是完全勾選
      parentNode.partialSelected = true;
    } else {
      // 沒有任何子項選中
      parentNode.IsEnable = false;
      parentNode.partialSelected = false;
    }

    // 如果父節點的狀態發生了改變，則繼續向上遞迴
    if (oldParentIsEnable !== parentNode.IsEnable || oldParentPartialSelected !== parentNode.partialSelected) {
      this.cascadeUp(parentNode);
    }
  }

  private cascadeDown(node: TreeNode, enableValue: boolean) {
    node.IsEnable = enableValue;
    node.partialSelected = false; // 當父節點明確勾選或取消勾選時，它不再是 partialSelected

    if (node.children) {
      node.children.forEach(child => this.cascadeDown(child, enableValue));
    }
    if (node.actions) {
      node.actions.forEach(action => this.cascadeDown(action, enableValue));
    }
  }

  inputSwitchOpen(node: TreeNode): void {
    if (node.partialSelected) {
      return;
    }
    node.isOpen = !node.isOpen;
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
            program.actions.forEach(behavior => {
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
