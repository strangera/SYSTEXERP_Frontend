import { Component, OnInit, ViewChild } from '@angular/core';
import { PrimeTreeNode, Role, TreeNode } from '../../../shared/models/sys/role.model';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { Sys0210Service } from '../../../service/API/sys/sys0210.service';
import { Column } from '../../../shared/componentkit/table/table.model';
import { TreeTable } from 'primeng/treetable';

// 4.2.3.1 角色系統權限設定 CRU
@Component({
  selector: 'app-sys0310.cru',
  templateUrl: './sys0310.cru.component.html',
})
// 角色系統權限設定 CRU
export class SYS0310CRUComponent extends BasicCruPageComponent<Role> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    Role_No: [{ value: '', disabled: true }], // 角色代碼
    Role_Name: [{ value: '', disabled: true }], // 角色名稱
    Description: [{ value: '', disabled: true }], // 角色描述
  });
  privilegeBehaviorList: PrimeTreeNode[] = [];
  selectionKeys = {};
  columns: Column[] = [
    { field: 'label', header: '程式名稱' }, // 可以改為更通用的名稱，如 '名稱' 或 '項目'
  ];
  constructor(
    private sys0210Service: Sys0210Service,
  ) {
    super();
  }
  ngOnInit(): void {
    this.initializePage('SYS0310', this.dataForm);
    this.sys0210Service.queryRolePrivileges({ Role_No: `${this.rowdata?.Role_No}` }).subscribe({
      next: (response) => {
        // 在賦值之前進行格式轉換
        this.privilegeBehaviorList = this.transformToTreeTableNodes(response.Data);
        // 如果有預選的權限，您可能需要在這裡處理 selectionKeys
        // 例如：this.selectionKeys = this.getInitialSelectionKeys(this.privilegeBehaviorList);
      },
      error: (err) => {
        console.error('查詢角色權限失敗：', err);
        this.loading = false;
      },
    });
  }
  private transformToTreeTableNodes(nodes: TreeNode[]): PrimeTreeNode[] {
    if (!nodes) {
      return [];
    }

    return nodes.map(node => {
      const transformedNode: PrimeTreeNode = {
        key: node.id, // 使用 id 作為 key，這是 PrimeNG 推薦的做法
        data: {
          label: node.label,
          IsEnable: node.IsEnable,
          partialSelected: node.partialSelected,
          // 如果還有其他需要直接顯示在欄位中的屬性，可以放在這裡
        },
        // 如果有子節點，則遞迴轉換
        children: node.children && node.children.length > 0
          ? this.transformToTreeTableNodes(node.children)
          : undefined, // 沒有子節點則為 undefined
        // 您也可以在這裡添加其他 PrimeNG 相關的屬性，例如 leaf: !node.children?.length
      };
      return transformedNode;
    });
  }
  onSubmit() {
    console.log(this.selectionKeys);
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
  @ViewChild('tt') tt!: TreeTable; // 新增這行，用於獲取 p-treeTable 的實例
  onFilterInput(event: Event, field: string, matchMode: string) {
    const value = (event.target as HTMLInputElement)?.value;
    if (this.tt) { // 確保 tt 已經被 ViewChild 初始化
      this.tt.filter(value, field, matchMode);
    }
  }
}
