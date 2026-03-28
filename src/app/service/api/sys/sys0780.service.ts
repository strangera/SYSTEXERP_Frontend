import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { TreeNode } from '@shared/models/sys/role.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PrivilegeOutput {
  prog_no: string;
  function_code: string;
  isEnable: 'Y' | 'N';
}

@Injectable({
  providedIn: 'root'
})
export class Sys0780Service {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.ApiUrl + '/SYS0000/SYS0780';

  // ==========================================
  // API 呼叫區
  // ==========================================

  /** 根據子模組代碼取得權限結構樹 */
  queryModulePrivileges(body: { prog_no: string }): Observable<ApiResponse<TreeNode[]>> {
    return this.http.post<ApiResponse<TreeNode[]>>(`${this.apiUrl}/queryModulePrivileges`, body);
  }

  /** 提交權限申請表單 (範例) */
  submitApplyReport(body: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/submitSYS0780Apply`, body);
  }

  // ==========================================
  // 樹狀結構處理邏輯 (複用自原 Sys0300)
  // ==========================================

  /** 設置父節點引用，用於向上連動 */
  setParentReferences(node: TreeNode, parent: TreeNode | null = null): TreeNode {
    node.parent = parent || undefined;
    node.children?.forEach(child => this.setParentReferences(child, node));
    node.actions?.forEach(action => this.setParentReferences(action, node));
    return node;
  }

  /** 遞迴排序：子節點與行為按 ID 排序 */
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

  /** 計算節點狀態 (全選/半選/未選) */
  recalculateNodeStatus(node: TreeNode): boolean {
    const subItems = [...(node.children || []), ...(node.actions || [])];
    if (subItems.length === 0) return false;

    const selectedCount = subItems.filter(i => i.IsEnable === true).length;
    const hasPartial = subItems.some(i => i.partialSelected === true);

    const oldIsEnable = node.IsEnable;
    const oldPartial = node.partialSelected;

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

  /** 遞迴計算整棵樹初始狀態 */
  traverseAndCalculateStatus(node: TreeNode): void {
    node.children?.forEach(child => this.traverseAndCalculateStatus(child));
    node.actions?.forEach(action => this.traverseAndCalculateStatus(action));
    this.recalculateNodeStatus(node);
  }

  /** 向下連動勾選 */
  cascadeDown(node: TreeNode, enableValue: boolean | null): void {
    node.IsEnable = enableValue;
    node.partialSelected = false;
    node.children?.forEach(child => this.cascadeDown(child, enableValue));
    node.actions?.forEach(action => this.cascadeDown(action, enableValue));
  }

  /** 向上連動勾選 */
  cascadeUp(node: TreeNode): void {
    if (node.parent && this.recalculateNodeStatus(node.parent)) {
      this.cascadeUp(node.parent);
    }
  }

  /** 提取已選取的權限行為 */
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
}
