import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { TreeModule } from 'primeng/tree';

export interface Column {
  value: string;
  label: string;
}

@Component({
    selector: 'app-tree-dropdown-nest',
    templateUrl: './tree-dropdown-nest.component.html',
    styleUrl: './tree-dropdown-nest.component.scss',
    standalone: true,
    imports: [Button, OverlayPanelModule, NgFor, NgIf, TreeModule, PrimeTemplate, NgClass]
})
export class TreeDropdownNestComponent implements OnInit {
  @Input() members: any[] = []; // 允許外部傳入成員資料
  @Input() isNestedInput = false; // 是否直接傳入巢狀結構
  @Input() canSelectAll = false; // 是否能夠全選

  // 用字串陣列指定每層對應的欄位key
  @Input() treeNodes: string[] = [];
  @Input() LeaveColumnLabel = ''; // 子節點顯示名稱
  @Input() TitleButtonName = ''; // 標題按鈕名稱
  @Input() TitleName = ''; // 標題
  @Input() onlySendLeaf? = true; // 是否只送葉節點資料，預設為 true

  @Output() confirmSelected = new EventEmitter<any[]>(); // 確定送出所選成員

  isAllExpanded = false;  //全部展開
  selectedMembers: any[] = [];  //記錄勾選項目
  treeData: any[] = []; // member資料先轉換成數狀

  ngOnInit() {
    if (this.isNestedInput) {
      this.treeData = this.convertToTreeNode(this.members);
      this.selectedMembers = this.getSelectedNodes(this.treeData);
      console.log('導入', this.treeData);
    }
  }

  private convertToTreeNode(nodes: any[]): TreeNode[] {
    return nodes.map(node => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      return {
        key: node.id,
        label: node.label,
        data: node,
        children: hasChildren ? this.convertToTreeNode(node.children) : undefined,
        leaf: !hasChildren,
        expanded: false,
        selectable: node.IsEnable,
        // selectable: true, //能否勾選
        partialSelected: node.partialSelected ?? false
      };
    });
  }

  // 初始帶入已勾選節點 (葉節點且IsEnable且partialSelected為true或直接IsEnable當作可勾選)
  private getSelectedNodes(nodes: TreeNode[]): TreeNode[] {
    let selected: TreeNode[] = [];
    nodes.forEach(node => {
      if (node.leaf && node.selectable && (node.data.partialSelected || false)) {
        selected.push(node);
      }
      if (node.children) {
        selected = selected.concat(this.getSelectedNodes(node.children));
      }
    });
    return selected;
  }

  // 當勾選改變時觸發
  onSelectionChange(selectedNodes: TreeNode | TreeNode[] | null) {
    if (!selectedNodes) {
      this.selectedMembers = [];
      return;
    }
    if (!Array.isArray(selectedNodes)) {
      // 單一節點轉成陣列
      this.selectedMembers = [selectedNodes];
    } else {
      this.selectedMembers = selectedNodes;
    }

    // 清除 partialSelected
    this.clearPartialSelected(this.treeData);

    // 更新 partialSelected 狀態
    this.updatePartialSelectedRecursive(this.treeData);

    // 同步回原始資料
    this.syncPartialSelectedToOriginal(this.members, this.treeData);
  }

  getNodeStyleClass(node: TreeNode) {
    return node.selectable ? 'selectable-node' : 'unselectable-node';
  }

  get columnsLabel(): string {
    return this.treeNodes.join(' / ');
  }

  // 其他方法不變 ...
  expandAll() {
    this.treeData.forEach(node => this.expandRecursive(node, true));
  }
  collapseAll() {
    this.treeData.forEach(node => this.expandRecursive(node, false));
  }
  expandToLevel(level: number) {
    this.treeData.forEach(node => this.expandToLevelRecursive(node, 0, level - 1));
  }

  // 只能展開到 maxLevel 層，超過就不展開
  private expandToLevelRecursive(node: TreeNode, currentLevel: number, maxLevel: number) {
    const MAX_CHILDREN = 100; // 超過這個數量就不展開

    if (node.children && node.children.length > MAX_CHILDREN) {
      node.expanded = false;
      if (currentLevel < maxLevel) {
        alert(`「${node.label}」下層資料過多（${node.children.length} 筆），無法展開。`);
      }
      return;
    }

    node.expanded = currentLevel < maxLevel;

    if (node.children) {
      node.children.forEach(child =>
        this.expandToLevelRecursive(child, currentLevel + 1, maxLevel)
      );
    }
  }

  //展開控制
  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach(child => this.expandRecursive(child, isExpand));
    }
  }

  // 全選所有節點(包含父節點與leaf節點)
  selectAll() {
    const selected: TreeNode[] = [];
    this.collectAllNodes(this.treeData, selected);
    this.selectedMembers = [...selected];
    console.log('selectedMembers (全選所有節點):', this.selectedMembers);
  }

  // 遞迴收集所有節點 (包括有子節點的父節點)
  private collectAllNodes(nodes: TreeNode[], selected: TreeNode[]) {
    for (const node of nodes) {
      selected.push(node);
      if (node.children) {
        this.collectAllNodes(node.children, selected);
      }
    }
  }

  // 清空選擇
  clearSelection() {
    this.selectedMembers = [];
  }

  // 送出元件
  sendTreeSelect() {
    if (this.onlySendLeaf) {
      const invited = this.selectedMembers.filter(node => node.leaf).map(node => node.data);
      this.confirmSelected.emit(invited);
    } else {
      this.confirmSelected.emit(this.selectedMembers);
    }
  }

  // 清除所有節點 partialSelected
  private clearPartialSelected(nodes?: TreeNode[] | null) {
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(node => {
      node.partialSelected = false;
      if (node.children) {
        this.clearPartialSelected(node.children);
      }
    });
  }

  // 根據 selection 狀態更新 partialSelected
  private updatePartialSelectedRecursive(nodes?: TreeNode[] | null) {
    if (!nodes || nodes.length === 0) return;
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        this.updatePartialSelectedRecursive(node.children);
        const allSelected = node.children.every(child => this.selectedMembers.includes(child));
        const someSelected = node.children.some(child => this.selectedMembers.includes(child) || child.partialSelected);
        node.partialSelected = !allSelected && someSelected;
      }
    });
  }

  // 把 partialSelected 同步回原始資料 members
  private syncPartialSelectedToOriginal(origNodes: any[], treeNodes: TreeNode[]) {
    const map = new Map<string, TreeNode>();
    const buildMap = (nodes: TreeNode[]) => {
      nodes.forEach(n => {
        map.set(n.key as string, n);
        if (n.children) buildMap(n.children);
      });
    };
    buildMap(treeNodes);

    const recursiveSync = (nodes: any[]) => {
      nodes.forEach(n => {
        const treeNode = map.get(n.id);
        if (treeNode) {
          n.partialSelected = treeNode.partialSelected;
        }
        if (n.children) recursiveSync(n.children);
      });
    };
    recursiveSync(origNodes);
  }

  //鍵盤事件
  onKeyDownExpand(event: KeyboardEvent, level: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.expandToLevel(level);
    }
  }
}
