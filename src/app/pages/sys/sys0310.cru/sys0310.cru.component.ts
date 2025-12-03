import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { AccordionModule } from 'primeng/accordion';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputSwitchModule } from 'primeng/inputswitch';
import { PanelModule } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { finalize } from 'rxjs';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { Sys0230Service } from '../../../service/api/sys/sys0230.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { Role, TreeNode } from '../../../shared/models/sys/role.model';

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
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    NgIf,
    ProgressSpinnerModule,
    TabViewModule,
    PrimeTemplate,
    NgClass,
    NgFor,
    Button,
    InputSwitchModule,
    AccordionModule,
    CheckboxModule,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    CdkVirtualForOf,
    TranslateModule,
    TriStateCheckboxModule,
    NgTemplateOutlet
  ],
})
// 角色系統權限設定 CRU
export class SYS0310CRUComponent extends BasicCruPageComponent<Role> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Role_No: [{ value: '', disabled: true }], // 角色代號
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
    this.sys0210Service.queryRolePrivileges({ Role_No: `${this.rowdata?.Role_No}` }).pipe(untilDestroyed(this)).subscribe({
      next: (response: ApiResponse<TreeNode[]>) => {
        if (response.Data && Array.isArray(response.Data)) {
          response.Data.forEach(node => {
            // 1. 設置 parent 引用
            let transformedNode = this.setParentReferences(node);

            // 2. 【新增】對整個樹狀結構進行排序
            transformedNode = this.sortNodeData(transformedNode);

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
  /**
  * 遞迴地對節點及其子節點的 children 和 actions 進行排序 (依據 id)。
  * 注意：針對 actions 的 id，由於是數字字串，我們將其轉為數字再排序。
  * @param node 要排序的節點
  * @returns 排序後的節點
  */
  private sortNodeData(node: TreeNode): TreeNode {
    // 1. 遞迴處理子節點 (children)
    if (node.children && node.children.length > 0) {
      // 先對子節點進行排序 (使用字串 id 排序，通常這層的 id 是複合代碼)
      node.children.sort((a, b) => a.id.localeCompare(b.id));
      // 再遞迴處理每個子節點的子項
      node.children = node.children.map(child => this.sortNodeData(child));
    }

    // 2. 處理行為權限 (actions) - 修正數字字串排序問題
    if (node.actions && node.actions.length > 0) {
      // *** 核心修正點：將 a.id 和 b.id 轉換為數字再相減 ***
      node.actions.sort((a, b) => {
        const idA = parseInt(a.id, 10);
        const idB = parseInt(b.id, 10);

        // 確保 NaN 或非數字情況下的健壯性
        if (isNaN(idA) || isNaN(idB)) {
          // 如果無法轉換為數字，則退回字串比較
          return a.id.localeCompare(b.id);
        }
        // 數字比較
        return idA - idB;
      });
    }

    return node;
  }
  private setParentReferences(node: TreeNode, parent: TreeNode | null = null): TreeNode {
    const newNode: TreeNode = { ...node, parent: parent || undefined };
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
  /**
   * 計算並更新單個父節點的 IsEnable 和 partialSelected 狀態
   * @param node 需要計算狀態的節點 (通常是父節點)
   * @returns 狀態是否發生變化
   */
  private recalculateNodeStatus(node: TreeNode): boolean {
    if (!((node.children && node.children.length > 0) || (node.actions && node.actions.length > 0))) {
      return false; // 如果沒有子項，則不需計算
    }

    let totalSelectableItems = 0;
    let selectedItemsCount = 0;
    let hasPartialSelectedChild = false;

    const childrenAndActions = [...(node.children || []), ...(node.actions || [])];

    childrenAndActions.forEach(child => {
      totalSelectableItems++;
      if (child.IsEnable === true) { // 檢查是否完全啟用
        selectedItemsCount++;
      }
      if (child.partialSelected === true) { // 檢查子節點是否有部分選中狀態
        hasPartialSelectedChild = true;
      }
    });

    const oldIsEnable = node.IsEnable;
    const oldPartialSelected = node.partialSelected;

    if (totalSelectableItems === 0) {
      node.IsEnable = null;
      node.partialSelected = false;
    } else if (selectedItemsCount === totalSelectableItems) {
      node.IsEnable = true;
      node.partialSelected = false;
    } else if (selectedItemsCount > 0 || hasPartialSelectedChild) {
      node.IsEnable = false;
      node.partialSelected = true;
    } else {
      node.IsEnable = null;
      node.partialSelected = false;
    }

    return oldIsEnable !== node.IsEnable || oldPartialSelected !== node.partialSelected;
  }
  private traverseAndCalculateStatus(node: TreeNode) {
    if (node.children) {
      node.children.forEach(child => this.traverseAndCalculateStatus(child));
    }
    if (node.actions) {
      node.actions.forEach(action => this.traverseAndCalculateStatus(action));
    }
    // 計算當前節點 (node) 的 IsEnable 和 partialSelected 狀態
    this.recalculateNodeStatus(node);
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
    node.IsEnable = newValue === false ? null : newValue; // 更新當前節點的 IsEnable

    // 1. 向下聯動：如果當前節點被勾選/取消勾選，則其所有子節點和 actions 都應同步
    this.cascadeDown(node, node.IsEnable);

    // 2. 向上聯動：從當前節點開始，向上更新所有父節點的 IsEnable 和 partialSelected
    this.cascadeUp(node);

    this.cdr.markForCheck(); // 觸發變更檢測以更新 UI
  }
  private cascadeUp(node: TreeNode) {
    if (!node.parent) {
      return; // 如果沒有父節點，則停止遞迴
    }
    // 如果父節點的狀態發生了改變，則繼續向上遞迴
    if (this.recalculateNodeStatus(node.parent)) {
      this.cascadeUp(node.parent);
    }
  }

  private cascadeDown(node: TreeNode, enableValue: boolean | null) {
    node.IsEnable = enableValue;
    node.partialSelected = false; // 當父節點明確勾選或取消勾選時，它不再是 partialSelected

    if (node.children) {
      node.children.forEach(child => this.cascadeDown(child, enableValue));
    }
    if (node.actions) {
      node.actions.forEach(action => this.cascadeDown(action, enableValue));
    }
  }
  /**
 * 遞迴地遍歷樹狀節點，提取所有啟用的行為權限。
 * @param node 當前節點
 * @param privilegeList 收集結果的陣列
 */
  private extractEnabledPrivileges(node: TreeNode, privilegeList: PrivilegeOutput[]) {
    if (node.actions && node.actions.length > 0) {
      node.actions.forEach(behavior => {
        if (behavior.IsEnable === true) {
          privilegeList.push({
            prog_no: node.id,
            function_code: behavior.id,
            isEnable: 'Y'
          });
        }
      });
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        this.extractEnabledPrivileges(child, privilegeList);
      });
    }
  }
  onSubmit(): void {
    const privilegeList: PrivilegeOutput[] = [];
    const modules = [this.FIN00000Data, this.ASS00000Data, this.TLS00000Data, this.SYS0000Data, this.CPM0000Data];

    // 對每個模組執行遞迴提取
    modules.forEach(moduleData => {
      if (moduleData) {
        this.extractEnabledPrivileges(moduleData, privilegeList);
      }
    });
    const body = {
      Role_No: this.dataForm.getRawValue().Role_No,
      data: privilegeList
    };
    this.loading = true;

    this.sys0230Service.updateRolePrivileges(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      this.messageService.successBubble(res.Message);
      this.systemDataService.getFunRightsInfo().pipe(untilDestroyed(this)).subscribe(() => {
        this.onCancel();
      });
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
  trackByFn(index: number, item: TreeNode): string {
    return item.id; // 假設每個 TreeNode 都有唯一的 'id'
  }
  getEnabledLength(node: TreeNode): number {
    return node.children ? node.children.filter(child => child.IsEnable).length : 0;
  }
}
