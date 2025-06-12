import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { Sysb400Service } from '../../../service/api/sys/sysb400.service';
import { Sysb400m } from '../../../shared/models/sys/sysb000.module';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';


@Component({
  selector: 'app-sysb400.os',
  templateUrl: './sysb400.os.component.html',
  styleUrl: './sysb400.os.component.scss'
})

// 組織架構列表
export class Sysb400OsComponent extends BasicCruPageComponent<Sysb400m> implements OnInit {
  nodes: TreeNode[] = [];
  override formTitle = '組織架構列表';
  // tree dropDown==================================
  // orgData sample removed to avoid duplicate declaration; orgData will be defined as Sysb400m[] below.
  orgData: Sysb400m[] = [];
  orgColumn = [
    { value: 'org10Label', label: '全公司' },
    { value: 'org20Label', label: '部' },
    { value: 'org30Label', label: 'Team' },
    { value: 'org40Label', label: '組' },
  ];
  LeaveLabel = 'org_name'; // 子節點顯示名稱
  listTitle = '組織架構列表'; // 節層圖名稱

  onLevelSelected(selected: any[]) {
    console.log('從子元件選到的:', selected);
  }

  // dropdownTable==================================
  //----------------
  constructor(
    private sysb400Service: Sysb400Service,
  ) {
    super();
  }

  ngOnInit(): void {
    this.initializePage('SYSB400');
    // ----------------------------------------------------------------
    this.loadOptions();
  }

  loadOptions() {
    // 樹狀下拉(測試)
    this.sysb400Service.querySYS3100_tree_DropDownList({}).subscribe({
      next: (response) => {
        // console.log('引入:', response);
        if (response.Status === '0000') {
          this.orgData = response.Data;
          console.log('orgData', this.orgData);
          // 原始資料進行過濾 去除中間節點
          this.orgData = this.filterByDeepestUnique(this.orgData);
          console.log('原始資料進行過濾', this.orgData);
        } else {
          console.error('API error:', response.Status, response.Message);
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
      },
    });
  }

  // 原始資料進行過濾 去除中間節點
  filterByDeepestUnique(data: any[]): any[] {
    return data.filter(item => {
      const orgKey = `${item.org_id}${item.org_name}`.trim();

      const parentLabels = [
        item.org10Label,
        item.org20Label,
        item.org30Label
      ];

      // 若任一上層的 label 和自己 orgKey 相同，表示重複，過濾掉
      const isDuplicate = parentLabels.some(label => label && orgKey.includes(label.trim()));

      return !isDuplicate;
    });
  }

  onBack() {
    this.router.navigate(['/SYS/SYSB400']);
  }
}
