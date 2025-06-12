import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { AuthService } from '../../../service/system/auth.service';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { Sysb400m } from '../../../shared/models/sys/sysb000.module';

@Component({
  selector: 'app-sysb400.os',
  templateUrl: './sysb400.os.component.html',
  styleUrl: './sysb400.os.component.scss'
})

interface OrgTreeNode {
  label: string;
  key: string;
  data: string; // 可以存放 level_id
  children?: OrgTreeNode[];
}

// 組織架構列表
export class Sysb400OsComponent extends BasicQpageComponent implements OnInit {
  nodes: TreeNode[] = [];
  formTitle = '組織架構列表';
  //---treeSample---
  // tree dropDown Sample==================================
  flatTreeData = [
    // { org_id: '1', org10id: string, org20id: string, org30id: string, org40id: string, org_name: string },
    { id: '1', department: 'Department A', role: 'Owner', name: 'Amy Elsner', email: 'amy@email.com', phone: '0911111111' },
    { id: '2', department: 'Department A', role: 'Owner', name: 'Anna Fali', email: 'anna@email.com', phone: '0922222222' },
    { id: '3', department: 'Department A', role: 'Viewer', name: 'Asiya Javayant', email: 'asiya@email.com', phone: '0933333333' },
    { id: '4', department: 'Department B', role: 'Examiner', name: 'Bernardo Dominic', email: 'bernardo@email.com', phone: '0944444444' },
    { id: '5', department: 'Department B', role: 'Reviewer', name: 'Elwin Sharvill', email: 'elwin@email.com', phone: '0955555555' }
  ]; // 從 API 或資料庫取得
  treeNodes = [
    { value: 'department', label: '部門' },
    { value: 'role', label: '角色' },
    { value: 'member', label: '成員' }
  ];
  LeaveColumnLabel = 'name'; // 子節點顯示名稱

  onMembersSelected(selected: any[]) {
    console.log('從子元件選到的:', selected);
  }

  // dropdown Table Sample==================================

  // tree dropDown==================================
  // orgData sample removed to avoid duplicate declaration; orgData will be defined as Sysb400m[] below.
  orgData: Sysb400m[] = [];
  orgFlatTreeData: any = []; //扁平化後的資料
  orgColumn = [
    { value: 'org10', label: '部門' },
    { value: 'org20', label: '角色' },
    { value: 'org30', label: '成員' }
  ];
  LeaveLabel = 'org_name'; // 子節點顯示名稱

  onLevelSelected(selected: any[]) {
    console.log('從子元件選到的:', selected);
  }

  // dropdownTable==================================
  //----------------
  constructor(
    private router: Router,
    private authService: AuthService,
    private sysb400Service: Sysb400Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410004';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    this.loadOptions();
  }

  loadOptions() {
    //階層圖
    const query = {
      "level_id": "",
      "org_id": "",
      "org_name": "",
      "stop_flag": "",

      //分頁查詢
      pageSize: 1000,
      pageIndex: 0,
      SortBy: [{ field: 'org_id', order: 1 }],
    }
    this.sysb400Service.querySYSB400(query).subscribe({
      next: (response) => {
        // console.log('引入:', response);
        if (response.Status === '0000') {
          this.orgData = response.Data;
          this.orgFlatTreeData = this.loadFlatTreeData(this.orgData);
          console.log('orgFlatTreeData', this.orgFlatTreeData);
        } else {
          console.error('API error:', response.Status, response.Message);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
      },
    });
  }

  //扁平化資料
  loadFlatTreeData(flatData: Sysb400m[]) {
    const rootId = '100000'; // 全公司為根節點
    const levelMap = { '10': 'org10id', '20': 'org20id', '30': 'org30id', '40': 'org40id' };

    const buildTree = (
      level: number,
      parentId: string
    ): OrgTreeNode[] => {
      const currentLevelId = 10 + (level - 1) * 10; // level 1 → 10, level 2 → 20...
      const currentLevelKey = levelMap[currentLevelId.toString() as keyof typeof levelMap];

      return flatData
        .filter(item => {
          const itemLevelId = parseInt(item.level_id);
          const itemOrgId = item.org_id;
          const itemParentOrgId = item.p_org_id;

          return (
            itemLevelId === currentLevelId &&
            itemParentOrgId === parentId
          );
        })
        .map(item => ({
          label: `[${item.org_id}] ${item.org_name}`,
          key: item.org_id,
          data: item.level_id,
          children: buildTree(level + 1, item.org_id)
        }));
    };

    this.nodes = [
      {
        label: '[100000] 全公司',
        key: rootId,
        data: '0',
        expandedIcon: 'pi pi-building',
        collapsedIcon: 'pi pi-building',
        styleClass: 'custom-icon-color',
        children: buildTree(1, rootId)
      }
    ];
  }

  onBack() {
    this.router.navigate(['/SYS/SYSB400']);
  }
}
