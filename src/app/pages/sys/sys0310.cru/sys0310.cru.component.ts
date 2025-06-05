import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup, } from '@angular/forms';
import { Role, TreeNode } from '../../../shared/models/sys/role.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sys0210Service } from '../../../service/API/sys/sys0210.service';
import { Column } from '../../../shared/componentkit/table/table.model';

export interface PrivilegeChildItem {
  id: string;
  label: string;
  IsEnable: boolean;
  partialSelected: boolean;
  children?: PrivilegeChildItem[]; // 如果還有更深層，則保留
  parent?: string; // 新增的 parent 屬性
}
// 4.2.3.1 角色系統權限設定 CRU
@Component({
  selector: 'app-sys0310.cru',
  templateUrl: './sys0310.cru.component.html',
})
// 角色系統權限設定 CRU
export class SYS0310CRUComponent extends BasicCruPageComponent<Role> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    roleCode: [''], // 角色代碼
    roleName: [''], // 角色名稱
    Description: [''], // 查詢條件
  });
  privilegeBehaviorList: TreeNode[] = [];
  selectedItems: TreeNode[] = [];
  allIndexes: number[] = [];
  columns: Column[] = [
    { field: 'label', header: '作業名稱' },
    { field: 'children', header: '作業行為', type: 'checkbox' },
  ];

  constructor(
    private sys0210Service: Sys0210Service,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYS0310', this.dataForm);
    this.sys0210Service.queryRolePrivileges({ Role_No: `${this.rowdata?.Role_No}` }).subscribe({
      next: (response) => {
        this.privilegeBehaviorList = this.addSelectChildrenToNodes(response.Data);
      },
      error: (err) => { // 最好也接收錯誤物件以便調試
        console.error('查詢角色權限失敗：', err);
        this.loading = false;
      },
    });
  }
  private addSelectChildrenToNodes(nodes: TreeNode[]): TreeNode[] {
    return nodes.map(node => {
      const newNode: TreeNode = { ...node };
      newNode.selectChildren = [];
      if (node.children && node.children.length > 0) {
        newNode.children = this.addSelectChildrenToNodes(node.children);
      }
      return newNode;
    });
  }
  trackByRow = (index: number, item: any) => { return item?.['id'] || index; }

  onSelectAll(event: any, items: TreeNode) {
    event.stopPropagation();
    const newIsEnableState = items.IsEnable ?? false;

    // 創建一個新的輔助方法，同時處理 IsEnable 和 selectChildren
    this.updateTreeSelection(items.children, newIsEnableState);

    this.cdr.detectChanges(); // 強制 Angular 重新檢測變化
    console.log(items);
  }

  // 新增或修改這個遞迴方法
  private updateTreeSelection(nodes: TreeNode[] | undefined, enableState: boolean) {
    if (!nodes) { return; }

    nodes.forEach(node => {
      node.IsEnable = enableState; // 設定當前節點的 IsEnable

      // 如果當前節點有孫子節點 (即 p-table 的 value)，則更新其 selectChildren
      if (node.children && node.children.length > 0) {
        // 遞迴呼叫自身來處理更深層的 IsEnable 狀態
        this.updateTreeSelection(node.children, enableState);

        // 在遞迴完成後，為當前 node 的 selectChildren 賦值
        // 這裡篩選的是 node.children 中 IsEnable 為 true 的，
        // 也就是表格（由 node.children 填充）中應被選中的那些行
        node.selectChildren = node.children.filter(grandChild => grandChild.IsEnable === true);
      } else {
        // 如果是最底層的節點（沒有 children），其 selectChildren 通常是空的
        node.selectChildren = [];
      }
    });
  }
  onSubmit(frm: FormGroup) {
  }

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
}
