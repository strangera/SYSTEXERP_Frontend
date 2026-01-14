import { Injectable } from '@angular/core';
import { TreeNode } from '../../../shared/models/sys/role.model';

export interface PrivilegeOutput {
  prog_no: string;
  function_code: string;
  isEnable: 'Y' | 'N';
}

@Injectable({
  providedIn: 'root'
})
export class Sys0300Service {

  /** 設置父節點引用 */
  setParentReferences(node: TreeNode, parent: TreeNode | null = null): TreeNode {
    node.parent = parent || undefined;
    node.children?.forEach(child => this.setParentReferences(child, node));
    node.actions?.forEach(action => this.setParentReferences(action, node));
    return node;
  }

  /** 遞迴排序：子節點(字母排序)與行為(數字排序) */
  sortNodeData(node: TreeNode): TreeNode {
    if (node.children?.length) {
      node.children.sort((a, b) => a.id.localeCompare(b.id));
      node.children.forEach(child => this.sortNodeData(child));
    }
    if (node.actions?.length) {
      node.actions.sort((a, b) => {
        const idA = parseInt(a.id, 10);
        const idB = parseInt(b.id, 10);
        return (isNaN(idA) || isNaN(idB)) ? a.id.localeCompare(b.id) : idA - idB;
      });
    }
    return node;
  }

  /** 計算並更新單個節點狀態 */
  recalculateNodeStatus(node: TreeNode): boolean {
    const subItems = [...(node.children || []), ...(node.actions || [])];
    if (subItems.length === 0) return false;

    const selectedCount = subItems.filter(i => i.IsEnable === true).length;
    const hasPartial = subItems.some(i => i.partialSelected === true);

    const oldIsEnable = node.IsEnable;
    const oldPartial = node.partialSelected;

    node.enabledCount = selectedCount;
    node.totalCount = subItems.length;

    if (selectedCount === subItems.length) {
      node.IsEnable = true;
      node.partialSelected = false;
    } else if (selectedCount > 0 || hasPartial) {
      node.IsEnable = false;
      node.partialSelected = true;
    } else {
      node.IsEnable = null;
      node.partialSelected = false;
    }
    return oldIsEnable !== node.IsEnable || oldPartial !== node.partialSelected;
  }

  /** 遍歷並計算整棵樹的狀態 */
  traverseAndCalculateStatus(node: TreeNode): void {
    node.children?.forEach(child => this.traverseAndCalculateStatus(child));
    node.actions?.forEach(action => this.traverseAndCalculateStatus(action));
    this.recalculateNodeStatus(node);
  }

  /** 向下連動 */
  cascadeDown(node: TreeNode, enableValue: boolean | null): void {
    node.IsEnable = enableValue;
    node.partialSelected = false;
    node.children?.forEach(child => this.cascadeDown(child, enableValue));
    node.actions?.forEach(action => this.cascadeDown(action, enableValue));
  }

  /** 向上連動 */
  cascadeUp(node: TreeNode): void {
    if (node.parent && this.recalculateNodeStatus(node.parent)) {
      this.cascadeUp(node.parent);
    }
  }

  /** 搜尋過濾邏輯 */
  filterNode(node: TreeNode, text: string): boolean {
    if (!text) {
      node.isHidden = false;
      node.children?.forEach(child => this.filterNode(child, text));
      return true;
    }
    const isMatch = node.label.toLowerCase().includes(text) ||
      (node.prog_id && node.prog_id.toLowerCase().includes(text));

    let hasVisibleChild = false;
    node.children?.forEach(child => {
      if (this.filterNode(child, text)) hasVisibleChild = true;
    });

    node.isHidden = !(isMatch || hasVisibleChild);
    if (hasVisibleChild && text) node.isOpen = true;
    return !node.isHidden;
  }

  /** 計算作業統計 */
  getStatistics(modules: TreeNode[]): { enabled: number, total: number } {
    let enabled = 0;
    let total = 0;
    modules.forEach(m => {
      m.children?.forEach(cat => {
        cat.children?.forEach(prog => {
          prog.children?.forEach(beh => {
            if (beh.IsEnable === true || beh.partialSelected === true) enabled++;
          });
        });
      });
    });
    // 總數計算邏輯維持你的版本
    modules.forEach(m => {
      m.children?.forEach(cat => {
        cat.children?.forEach(prog => {
          total += (prog.children?.length ?? 0);
        });
      });
    });
    return { enabled, total };
  }

  getEnabledPrivileges(node: TreeNode, list: PrivilegeOutput[] = []): PrivilegeOutput[] {
    if (node.actions?.length) {
      node.actions.forEach(act => {
        if (act.IsEnable === true) {
          list.push({ prog_no: node.id, function_code: act.id, isEnable: 'Y' });
        }
      });
    }
    node.children?.forEach(child => this.getEnabledPrivileges(child, list));
    return list;
  }

  /** 根據選取狀況決定初始展開 (第二層) */
  setInitialOpenState(moduleDataList: TreeNode[]) {
    moduleDataList.forEach(moduleData => {
      moduleData.children?.forEach(item => {
        const hasActive = (nodes?: TreeNode[]) => nodes?.some(n => n.partialSelected || n.IsEnable);
        item.isOpen = item.partialSelected || hasActive(item.children) || hasActive(item.actions);
      });
    });
    return moduleDataList;
  }

  /** 遞迴提取選取的權限 (此為業務格式轉換，建議保留在頁面或移至特定 Helper) */
  extractEnabledPrivileges(node: TreeNode, privilegeList: PrivilegeOutput[]) {
    if (node.actions?.length) {
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
    node.children?.forEach(child => this.extractEnabledPrivileges(child, privilegeList));
  }
}
