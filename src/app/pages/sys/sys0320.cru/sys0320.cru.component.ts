import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TreeNode } from '../../../shared/models/sys/role.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Column } from '../../../shared/componentkit/table/table.model';
import { ApiResponse } from '../../../service/system/auth.service';
import { UserData } from '../../../shared/models/sys/user.model';
import { Sys0110Service } from '../../../service/api/sys/sys0110.service';
import { Sys0230Service } from '../../../service/api/sys/sys0230.service';
import { untilDestroyed } from '@ngneat/until-destroy';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { PanelModule } from 'primeng/panel';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { NgIf, NgClass, NgFor } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { finalize } from 'rxjs';

interface PrivilegeOutput {
  prog_no: string;
  function_code: string;
  isEnable: 'Y' | 'N'; // 這裡明確為 'Y' 或 'N'
}
// 4.2.3.2 使用者系統權限設定 CRU
@Component({
  selector: 'app-sys0320.cru',
  templateUrl: './sys0320.cru.component.html',
  styleUrls: ['./sys0320.cru.component.scss'],
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
  ],
})
// 使用者系統權限設定 CRU
export class SYS0320CRUComponent extends BasicCruPageComponent<UserData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    user_No: [{ value: '', disabled: true }], // 角色代號
    user_Name: [{ value: '', disabled: true }], // 角色名稱
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
    private sys0110Service: Sys0110Service,
    private sys0230Service: Sys0230Service,
    private cdr: ChangeDetectorRef,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYS0320', this.dataForm);
    this.sys0110Service.queryUserPrivileges({ user_no: `${this.rowdata?.user_No}` }).pipe(untilDestroyed(this)).subscribe({
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
    // 這裡我們不修改 setParentReferences，它負責建立樹狀結構，
    // isDisable 判斷應該在處理使用者互動時進行。
    const newNode: TreeNode = { ...node, parent: parent || undefined };

    if (newNode.partialSelected === undefined) {
      newNode.partialSelected = false;
      newNode.IsEnable = null;
    }
    if (parent && parent.id && parent.id.endsWith('00000') || parent?.id.endsWith('0000')) {
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
        this.traverseAndCalculateStatus(moduleData);
      }
    });
  }

  private traverseAndCalculateStatus(node: TreeNode) {
    if (node.children) {
      node.children.forEach(child => this.traverseAndCalculateStatus(child));
    }
    if (node.actions) {
      node.actions.forEach(action => this.traverseAndCalculateStatus(action));
    }

    if ((node.children && node.children.length > 0) || (node.actions && node.actions.length > 0)) {
      let totalSelectableItems = 0;
      let selectedItemsCount = 0;
      let hasPartialSelectedChild = false;

      // 統計所有直接子節點的狀態
      if (node.children) {
        node.children.forEach(child => {
          totalSelectableItems++;
          // 在這裡，我們需要考慮 isDisable 的節點，它們永遠被視為已啟用
          if (child.IsEnable || child.isDisable) {
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
          totalSelectableItems++;
          if (action.IsEnable || action.isDisable) {
            selectedItemsCount++;
          }
        });
      }

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
    }
  }
  private setInitialOpenStateForSecondLevelNodes() {
    const modules = [this.FIN00000Data, this.ASS00000Data, this.TLS00000Data, this.SYS0000Data, this.CPM0000Data];
    modules.forEach(moduleData => {
      if (moduleData && moduleData.children) {
        moduleData.children.forEach(item => {
          let shouldOpen = false;
          if (item.children) {
            if (item.children.some(child => child.partialSelected || child.IsEnable)) {
              shouldOpen = true;
            }
          }
          if (item.actions) {
            if (item.actions.some(action => action.partialSelected || action.IsEnable)) {
              shouldOpen = true;
            }
          }

          if (item.partialSelected) {
            shouldOpen = true;
          }

          item.isOpen = shouldOpen;
        });
      }
    });
  }
  private createUpdatedNode(node: TreeNode, newProps: Partial<TreeNode>): TreeNode {
    return { ...node, ...newProps };
  }
  // --- 修改這裡 ---
  onNodeCheckboxChange(node: TreeNode, newValue: boolean) {
    // 檢查節點是否被禁用，如果是，則直接返回，不進行任何操作
    if (node.isDisable) {
      return;
    }

    const updatedNode = this.createUpdatedNode(node, { IsEnable: newValue === false ? null : newValue, partialSelected: false });

    this.cascadeDown(updatedNode, updatedNode.IsEnable);
    this.cascadeUp(updatedNode);

    this.cdr.markForCheck();
  }

  private cascadeUp(node: TreeNode) {
    if (!node.parent) {
      return;
    }

    const parentNode = node.parent;
    let totalSelectableChildrenAndActions = 0;
    let selectedChildrenAndActionsCount = 0;
    let hasPartialSelectedChildOrAction = false;

    if (parentNode.children) {
      parentNode.children.forEach(child => {
        totalSelectableChildrenAndActions++;
        // 向上聯動時，如果子節點被禁用或啟用，都計入已選中
        if (child.IsEnable || child.isDisable) {
          selectedChildrenAndActionsCount++;
        }
        if (child.partialSelected) {
          hasPartialSelectedChildOrAction = true;
        }
      });
    }

    if (parentNode.actions) {
      parentNode.actions.forEach(action => {
        totalSelectableChildrenAndActions++;
        if (action.IsEnable || action.isDisable) {
          selectedChildrenAndActionsCount++;
        }
      });
    }

    const oldParentIsEnable = parentNode.IsEnable;
    const oldParentPartialSelected = parentNode.partialSelected;

    if (totalSelectableChildrenAndActions === 0) {
      parentNode.IsEnable = null;
      parentNode.partialSelected = false;
    } else if (selectedChildrenAndActionsCount === totalSelectableChildrenAndActions) {
      parentNode.IsEnable = true;
      parentNode.partialSelected = false;
    } else if (selectedChildrenAndActionsCount > 0 || hasPartialSelectedChildOrAction) {
      parentNode.IsEnable = false;
      parentNode.partialSelected = true;
    } else {
      parentNode.IsEnable = null;
      parentNode.partialSelected = false;
    }

    if (oldParentIsEnable !== parentNode.IsEnable || oldParentPartialSelected !== parentNode.partialSelected) {
      this.cascadeUp(parentNode);
    }
  }

  // --- 修改這裡 ---
  private cascadeDown(node: TreeNode, enableValue: boolean | null) {
    // 如果節點被禁用，則不改變它的狀態，直接返回
    if (node.isDisable) {
      return;
    }

    node.IsEnable = enableValue;
    node.partialSelected = false;

    if (node.children) {
      node.children.forEach(child => this.cascadeDown(child, enableValue));
    }
    if (node.actions) {
      node.actions.forEach(action => this.cascadeDown(action, enableValue));
    }
  }
  onSubmit(): void {
    const privilegeList: PrivilegeOutput[] = [];

    const processModuleData = (moduleData: TreeNode | undefined) => {
      if (!moduleData || !moduleData.children) {
        return;
      }

      moduleData.children.forEach(item => {
        if (!item.children) {
          return;
        }

        item.children.forEach(subItem => {
          if (!subItem.children) {
            return;
          }

          subItem.children.forEach(program => {
            if (!program.children) {
              return;
            }

            program.actions.forEach(behavior => {
              // 提交時，將 IsEnable 或 isDisable 為 true 的節點都視為啟用
              if (behavior.IsEnable || behavior.isDisable) {
                privilegeList.push({
                  prog_no: program.id,
                  function_code: behavior.id,
                  isEnable: 'Y'
                });
              }
            });
          });
        });
      });
    };

    processModuleData(this.FIN00000Data);
    processModuleData(this.ASS00000Data);
    processModuleData(this.TLS00000Data);
    processModuleData(this.SYS0000Data);
    processModuleData(this.CPM0000Data);

    const body = {
      user_no: this.dataForm.value.user_No,
      data: privilegeList
    };
    this.loading = true;

    this.sys0230Service.updateUserPrivileges(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      console.log('Update Role Privileges Response:', res);
      this.messageService.successBubble(res.Message);
      this.authService.getFunRightsInfo().pipe(untilDestroyed(this)).subscribe(() => {
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
    return item.id;
  }

  getEnabledLength(node: TreeNode): number {
    // 這裡的邏輯也應該考慮 isDisable 的節點，將其視為已啟用
    return node.children ? node.children.filter(child => child.IsEnable || child.isDisable).length : 0;
  }
}
