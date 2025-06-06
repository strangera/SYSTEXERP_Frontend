import { Component, OnInit } from '@angular/core';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { PrimeTreeNode, TreeNode, UserData } from '../../../shared/models/sys/user.model';
import { Column } from '../../../shared/componentkit/table/table.model';
import { Sys0110Service } from '../../../service/API/sys/sys0110.service';

// 4.2.3.2 使用者系統權限設定 CRU
@Component({
  selector: 'app-sys0320.cru',
  templateUrl: './sys0320.cru.component.html',
})
// 使用者系統權限設定 CRU
export class SYS0320CRUComponent extends BasicCruPageComponent<UserData> implements OnInit {
  dataForm = this.formBuilder.nonNullable.group({
    user_No: [{ value: '', disabled: true }], // 角色代碼
    user_Name: [{ value: '', disabled: true }], // 角色名稱
  });
  privilegeBehaviorList: PrimeTreeNode[] = [];
  selectionKeys = {};
  columns: Column[] = [
    { field: 'label', header: '程式名稱' },
    { field: 'actions', header: '操作' },
  ];

  constructor(
    private sys0110Service: Sys0110Service
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYS0320', this.dataForm);
    this.sys0110Service.queryUserPrivileges({ user_no: `${this.rowdata?.user_No}` }).subscribe({
      next: (response) => {
        this.privilegeBehaviorList = this.transformToTreeTableNodes(response.Data);
        console.log(this.privilegeBehaviorList);
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
          actions: node.actions && node.actions.length > 0 ? node.actions : undefined,
        },
        // 如果有子節點，則遞迴轉換
        children: node.children && node.children.length > 0
          ? this.transformToTreeTableNodes(node.children)
          : undefined,
        actions: node.actions && node.actions.length > 0 ? node.actions : undefined,
      };
      return transformedNode;
    });
  }
  // === 新增此方法來偵測 checkbox 變動 ===
  onActionCheckboxChange(action: any, parentNode: PrimeTreeNode) {
    console.log('--- Checkbox Change Detected ---');
    console.log('行為物件 (Action):', action);
    console.log('行為名稱 (Label):', action.label);
    console.log('新的啟用狀態 (IsEnable):', action.IsEnable);
    console.log('所屬程式節點 (Parent Node):', parentNode);
    console.log('所屬程式名稱 (Parent Node Label):', parentNode.data?.label);
    console.log('----------------------------');

    // 在這裡，您將來可以添加邏輯來：
    // 1. 根據 action.IsEnable 更新 parentNode 的 partialSelected 和 IsEnable 狀態
    // 2. 遞迴更新所有祖先節點的 partialSelected 和 IsEnable 狀態
    // 3. 更新 this.selectionKeys 以反映這些變化
  }
  onSubmit() {
    console.log(this.selectionKeys);
    console.log(this.privilegeBehaviorList);

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
