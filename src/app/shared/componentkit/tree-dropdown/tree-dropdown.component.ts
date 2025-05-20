import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from 'primeng/api';

export interface Column {
  value: string;
  label: string;
}

@Component({
  selector: 'app-tree-dropdown',
  templateUrl: './tree-dropdown.component.html',
  styleUrls: ['./tree-dropdown.component.scss'],
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

  //外部提供顯示名稱
  // Columns = [
  //   { 'value': 'department', 'label': '部門' },
  //   { 'value': 'role', 'label': '角色' },
  //   { 'value': 'member', 'label': '成員' }
  // ];
  @Input() Columns: Column[] = [];

  @Output() confirmSelected = new EventEmitter<any[]>(); // 確定送出所選成員

  isAllExpanded = false;  //全部展開
  selectedMembers: any[] = [];  //記錄勾選項目
  treeData: any[] = []; // member資料先轉換成數狀

  ngOnInit() {
    this.treeData = this.groupByDepartment();
  }

  // 將扁平化資料轉成樹狀
  groupByDepartment(): any[] {
    const grouped: any = {};
    this.members.forEach(member => {
      if (!grouped[member.department]) {
        grouped[member.department] = {};
      }
      if (!grouped[member.department][member.role]) {
        grouped[member.department][member.role] = [];
      }
      grouped[member.department][member.role].push(member);
    });

    let deptIndex = 0;
    const result = Object.keys(grouped).map(deptName => {
      const rolesObj = grouped[deptName];
      let roleIndex = 0;

      const roles = Object.keys(rolesObj).map(roleName => {
        const members = rolesObj[roleName];
        let memberIndex = 0;

        const memberNodes = members.map((member: { name: any; email: any; phone: any; id: any; }) => ({
          key: `d${deptIndex}-r${roleIndex}-m${memberIndex++}`,
          label: member.name,
          data: {
            email: member.email,
            phone: member.phone,
            id: member.id
          },
          icon: 'pi pi-user',
          leaf: true
        }));

        roleIndex++;

        return {
          key: `d${deptIndex}-r${roleIndex}`,
          label: roleName,
          children: memberNodes,
          icon: 'pi pi-users'
        };
      });

      deptIndex++;

      return {
        key: `d${deptIndex}`,
        label: deptName,
        children: roles,
        icon: 'pi pi-folder'
      };
    });

    return result;
  }

  get columnsLabel(): string {
    return this.Columns.map(col => col.label).join(' / ');
  }

  // //展開全部
  // expandAll() {
  //   this.treeData.forEach((node) => {
  //     this.expandRecursive(node, true);
  //   });
  // }

  // //收闔全部
  // collapseAll() {
  //   this.treeData.forEach((node) => {
  //     this.expandRecursive(node, false);
  //   });
  // }

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
  inviteMembers() {
    // 過濾出 leaf 節點 (會員層)
    const invited = this.selectedMembers
      .filter(node => node.leaf)
      .map(node => ({
        id: node.data.id,
        name: node.label,
        email: node.data.email,
        phone: node.data.phone
      }));

    console.log('Invited members:', invited);
    this.confirmSelected.emit(invited); // 向外層傳出結果
  }

  //鍵盤事件
  onKeyDownExpand(event: KeyboardEvent, level: number) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.expandToLevel(level);
    }
  }
}
