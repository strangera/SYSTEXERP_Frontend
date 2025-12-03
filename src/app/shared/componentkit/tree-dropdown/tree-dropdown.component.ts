import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Button } from 'primeng/button';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TreeModule } from 'primeng/tree';

type Column = { value: string; label: string; };

@Component({
  selector: 'app-tree-dropdown',
  templateUrl: './tree-dropdown.component.html',
  styleUrls: ['./tree-dropdown.component.scss'],
  standalone: true,
  imports: [
    Button,
    NgFor,
    NgIf,
    OverlayPanelModule,
    TreeModule,
  ],
})
export class TreeDropdownComponent implements OnInit {
  // 扁平化導入的資料
  // members = [
  //   // department > role > member (其他細項)
  //   { id: '1', department: 'Department A', role: 'Owner', name: 'Amy Elsner', email: 'amy@email.com', phone: '0911111111' },
  //   { id: '2', department: 'Department A', role: 'Owner', name: 'Anna Fali', email: 'anna@email.com', phone: '0922222222' },
  //   { id: '3', department: 'Department A', role: 'Viewer', name: 'Asiya Javayant', email: 'asiya@email.com', phone: '0933333333' },
  //   { id: '4', department: 'Department B', role: 'Examiner', name: 'Bernardo Dominic', email: 'bernardo@email.com', phone: '0944444444' },
  //   { id: '5', department: 'Department B', role: 'Reviewer', name: 'Elwin Sharvill', email: 'elwin@email.com', phone: '0955555555' },
  // ];
  @Input() members: any[] = []; // 允許外部傳入成員資料

  @Input() card = true; // 是否顯示卡片樣式
  @Input() loading = false; // 是否顯示載入中
  @Input() disabled = false; // 按鍵是否禁用

  //外部提供顯示名稱
  // Columns = [
  //   { 'value': 'department', 'label': '部門' },
  //   { 'value': 'role', 'label': '角色' },
  //   { 'value': 'member', 'label': '成員' }
  // ];
  @Input() Columns: Column[] = []; //Columns前兩欄是父節點，最後一個是末端葉節點
  @Input() LeaveColumnLabel = ''; // 子節點顯示名稱
  @Input() onlySendLeaf? = true; // 是否只送葉節點資料，預設為 true
  @Input() SelectbleCheckBox = true; // 能否選擇checkbox
  // @Input() buttonTitle = '查看階層圖'; // 按鍵名稱
  @Input() listTitle = '階層圖'; // 階層圖名稱

  @Output() confirmSelected = new EventEmitter<any[]>(); // 確定送出所選成員

  isAllExpanded = false;  //全部展開
  selectedMembers: any[] = [];  //記錄勾選項目
  treeData: any[] = []; // member資料先轉換成數狀

  ngOnInit() {
    // this.treeData = this.groupByDepartment();
    this.treeData = this.buildTreeFromFlatData();
  }

  // 將扁平化資料轉成樹狀(3層)
  groupByDepartment(): any[] {
    if (this.Columns.length < 3) {
      console.error('Columns 至少需要三個欄位（兩層父節點 + 一層葉節點）');
      return [];
    }

    const [firstKey, secondKey] = this.Columns.slice(0, 2).map(c => c.value);
    const leafKeys = this.Columns.slice(2).map(c => c.value);

    const grouped: any = {};

    this.members.forEach(member => {
      const firstVal = member[firstKey];
      const secondVal = member[secondKey];

      if (!grouped[firstVal]) {
        grouped[firstVal] = {};
      }
      if (!grouped[firstVal][secondVal]) {
        grouped[firstVal][secondVal] = [];
      }
      grouped[firstVal][secondVal].push(member);
    });

    let deptIndex = 0;
    const result = Object.entries(grouped).map(([firstVal, rolesObj]) => {
      let roleIndex = 0;

      const roleNodes = Object.entries(rolesObj as any).map(([secondVal, members]) => {
        let memberIndex = 0;

        const memberNodes = (members as any[]).map((member) => {
          const labelFromLeaveColumn = member[this.LeaveColumnLabel];
          const leafLabel = labelFromLeaveColumn !== undefined && labelFromLeaveColumn !== null
            ? labelFromLeaveColumn
            : leafKeys.map(k => member[k]).join(' / ');

          return {
            key: `d${deptIndex}-r${roleIndex}-m${memberIndex++}`,
            label: leafLabel,
            data: member,
            icon: 'pi pi-user',
            leaf: true
          };
        });

        return {
          key: `d${deptIndex}-r${roleIndex++}`,
          label: secondVal,
          children: memberNodes,
          icon: 'pi pi-users'
        };
      });

      return {
        key: `d${deptIndex++}`,
        label: firstVal,
        children: roleNodes,
        icon: 'pi pi-folder'
      };
    });

    return result;
  }
  // 將扁平化資料轉成樹狀(4層或以上)
  buildTreeFromFlatData(): TreeNode[] {
    const buildRecursive = (data: any[], depth: number): TreeNode[] => {
      const currentKey = this.Columns[depth]?.value;
      if (!currentKey) return [];

      // 顯式定義 grouped 的型別，避免 group 推斷為 unknown
      const grouped: Record<string, any[]> = data.reduce((acc, item) => {
        const key = item[currentKey];
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      return Object.entries(grouped).map(([key, group], index) => {
        const node: TreeNode = {
          key: `${depth}-${index}-${key}`,
          label: key,
          children: []
        };

        if (depth === this.Columns.length - 1) {
          // 已達最後一層，視為葉節點
          const dataItem = group[0]; // 預設用第一筆資料當作代表，可自訂合併邏輯
          const label = dataItem?.[this.LeaveColumnLabel] || key;

          node.label = label;
          node.data = dataItem;
          node.icon = 'pi pi-user';
          node.leaf = true;
          delete node.children; // 移除 children 屬性避免干擾 PrimeNG 樹結構

          // 是否可選，依 SelectbleCheckBox 決定
          node.selectable = this.SelectbleCheckBox;
        } else {
          node.selectable = false; // 這是關鍵
          node.children = buildRecursive(group, depth + 1);
          node.icon = 'pi pi-folder';
        }

        return node;
      });
    };

    return buildRecursive(this.members, 0);
  }


  get columnsLabel(): string {
    return this.Columns.map(col => col.label).join(' / ');
  }

  //展開全部
  expandAll() {
    this.treeData.forEach((node) => {
      this.expandRecursive(node, true);
    });
  }

  //收闔全部
  collapseAll() {
    this.treeData.forEach((node) => {
      this.expandRecursive(node, false);
    });
  }

  // 展開樹狀至目標層級（層級從0開始）
  expandToLevel(level: number) {
    // console.log('level', level);
    this.treeData.forEach(node => {
      this.expandToLevelRecursive(node, 0, level - 1);
    });
  }

  // 只能展開到 maxLevel 層，超過就不展開
  private expandToLevelRecursive(node: TreeNode, currentLevel: number, maxLevel: number) {
    node.expanded = currentLevel < maxLevel; // 當前層小於目標層數才展開
    if (node.children) {
      node.children.forEach(child => {
        this.expandToLevelRecursive(child, currentLevel + 1, maxLevel);
      });
    }
  }

  //展開控制
  private expandRecursive(node: TreeNode, isExpand: boolean) {
    node.expanded = isExpand;
    if (node.children) {
      node.children.forEach((childNode) => {
        this.expandRecursive(childNode, isExpand);
      });
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
      selected.push(node);  // 先加入父節點
      if (node.children) {
        this.collectAllNodes(node.children, selected);  // 遞迴加入子節點
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
      const invited = this.selectedMembers
        .filter(node => node.leaf)
        .map(node => node.data); // 直接取原始 member 資料

      // console.log('sendTreeSelect:', invited);
      this.confirmSelected.emit(invited);
    } else {
      //回傳所有節點內容(等待 調整)
      this.confirmSelected.emit(this.selectedMembers);
    }
  }

  //鍵盤事件
  onKeyDownExpand(event: KeyboardEvent, level: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.expandToLevel(level);
    }
  }
}
