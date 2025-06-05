import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from 'primeng/api';
import { BasicQpageComponent } from '../../../shared/componentextends/basic-qpage/basic-qpage.component';
import { AuthService } from '../../../service/system/auth.service';

@Component({
  selector: 'app-sysb400.os',
  templateUrl: './sysb400.os.component.html',
  styleUrl: './sysb400.os.component.scss'
})
// 組織架構列表
export class Sysb400OsComponent extends BasicQpageComponent implements OnInit {
  nodes: TreeNode[] = [
        {
          label: '[100000] 全公司',
          key: '100000',
          data: '0',
          expandedIcon: 'pi pi-building',
          collapsedIcon: 'pi pi-building',
          styleClass: 'custom-icon-color',
          children: [
            {
              label: '[101000] 經營企劃部(停用)',
              key: '101000',
              data: '1',
              expandedIcon: 'pi pi-cog',
              collapsedIcon: 'pi pi-cog',
              children: [
                {
                  label: '[101100] 行政Team(停用)',
                  key: '101100',
                  data: '2',
                  expandedIcon: 'pi pi-briefcase',
                  collapsedIcon: 'pi pi-briefcase',


                },
                {
                  label: '[101200] 公關Team(停用)',
                  key: '101200',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',


                },
                {
                  label: '[101300] 營企Team(停用)',
                  key: '101300',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[101400] 電子商務team(停用)',
                  key: '101400',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[101500] 外商Team(停用)',
                  key: '101500',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[101700] 品牌代理小組(停用)',
                  key: '101700',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                }
              ]
            },
            {
              label: '[102000] 營運部',
              key: '102000',
              data: '1',
              expandedIcon: 'fa-regular fa-folder-open',
              collapsedIcon: 'fa fa-folder',
              children: [
                {
                  label: '[102100] 時尚Team',
                  key: '102100',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[102110] 1F',
                      key: '102110',
                      data: '3',
                      expandedIcon: 'pi pi-user',
                      collapsedIcon: 'pi pi-user',
                    },
                    {
                      label: '[102130] 化妝品',
                      key: '102130',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    }
                  ]
                },
                {
                  label: '[102200] 休閒Team',
                  key: '102200',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[102210] 3F',
                      key: '102210',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    },
                    {
                      label: '[102220] 居家生活組(停用)',
                      key: '102220',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    },
                    {
                      label: '[102230] 親子娛樂組(停用)',
                      key: '102230',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    }
                  ]
                },
                {
                  label: '[102300] 餐飲Team',
                  key: '102300',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[102310] 餐廳/輕食組',
                      key: '102310',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    },
                    {
                      label: '[102320] 美食街/食品料組',
                      key: '102320',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    },
                    {
                      label: '[102330] 品牌經營組',
                      key: '102330',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    }
                  ]
                },
                {
                  label: '[102400] 流行Team',
                  key: '102400',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[102120] 2F',
                      key: '102120',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    }
                  ]
                },
                {
                  label: '[102500] 特販Team',
                  key: '102500',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                },
                {
                  label: '[102600] 生活Team',
                  key: '102600',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[102610] 居家生活組',
                      key: '102610',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    },
                    {
                      label: '[102620] 親子娛樂組',
                      key: '102620',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',
                    }
                  ]
                },
                {
                  label: '[102700] 營運支援Team',
                  key: '102700',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                }

              ]
            },
            {
              label: '[103000] 行銷部',
              key: '103000',
              data: '1',
              expandedIcon: 'fa-regular fa-folder-open',
              collapsedIcon: 'fa fa-folder',
              children: [
                {
                  label: '[103100] 會員Team',
                  key: '103100',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[103110] 檔期企劃組(停用)',
                      key: '103110',
                      data: '2',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    },
                    {
                      label: '[103120] 會員經營組(停用)',
                      key: '103120',
                      data: '2',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    }
                  ]
                },
                {
                  label: '[103200] 顧客關係Team(停用)',
                  key: '103200',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[103210] 廣宣陳列組(停用)',
                      key: '103210',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    },
                    {
                      label: '[103220] 活動企劃組(停用)',
                      key: '103220',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    }
                  ]
                },
                {
                  label: '[103300] 活動Team',
                  key: '103300',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[103400] 廣宣Team',
                  key: '103400',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[103500] 企劃Team',
                  key: '103500',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                }
              ]
            },
            {
              label: '[104000] 財務部',
              key: '104000',
              data: '1',
              expandedIcon: 'fa-regular fa-folder-open',
              collapsedIcon: 'fa fa-folder',
              children: [
                {
                  label: '[104100] 會計Team',
                  key: '104100',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[104110] 總帳/稅務組(停用)',
                      key: '104110',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    },
                    {
                      label: '[104120] 專櫃/自營組(停用)',
                      key: '104120',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    },
                    {
                      label: '[104130] 成本結轉/匯整分析組(停用)',
                      key: '104130',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    }
                  ]
                },
                {
                  label: '[104200] 財務Team',
                  key: '104200',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                  children: [
                    {
                      label: '[104210] 授信/資金組(停用)',
                      key: '104210',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    },
                    {
                      label: '[104220] 有價券/營收組(停用)',
                      key: '104220',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    },
                    {
                      label: '[104230] 出納/銀行組(停用)',
                      key: '104230',
                      data: '3',
                      expandedIcon: 'fa-regular fa-folder-open',
                      collapsedIcon: 'fa fa-folder',

                    }
                  ]
                }
              ]
            },
            {
              label: '[105000] 技術服務部',
              key: '105000',
              data: '1',
              expandedIcon: 'fa-regular fa-folder-open',
              collapsedIcon: 'fa fa-folder',
              children: [
                {
                  label: '[105100] 物管Team(停用)',
                  key: '105100',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[105200] 總務Team(停用)',
                  key: '105200',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[105300] 資訊整合Team',
                  key: '105300',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[105400] 機電Team',
                  key: '105400',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[105500] 裝修管理Team',
                  key: '105500',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                }
              ]
            },
            {
              label: '[106000] 總經理室',
              key: '106000',
              data: '1',
              expandedIcon: 'fa-regular fa-folder-open',
              collapsedIcon: 'fa fa-folder',
              children: [
                {
                  label: '[101600] 個資小組',
                  key: '101600',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                },
                {
                  label: '[106100] 電子商務事業組(停用)',
                  key: '106100',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',
                },
                {
                  label: '[106200] 品牌經營事業組(停用)',
                  key: '106200',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[106300] 公關組',
                  key: '106300',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[106400] 秘書室(停用)',
                  key: '106400',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                },
                {
                  label: '[106500] 採購組(停用)',
                  key: '106500',
                  data: '2',
                  expandedIcon: 'fa-regular fa-folder-open',
                  collapsedIcon: 'fa fa-folder',

                }
              ]
            }
          ]
        },

  ];
  formTitle: string = '組織架構列表';

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.ProgNo = '410004';
    // ----------------------------------------------------------------
    this.funInfo = this.authService.getUserPermissions(this.ProgNo);
    // ----------------------------------------------------------------
    /* this.upperLevelOrganizationService.getSystemTypes().subscribe(data => {
      this.upperLevelOrgOptions = data;
    }); */
  }

  expandAll() {
    this.expandRecursive(this.nodes, true);
  }

  collapseAll() {
    this.expandRecursive(this.nodes, false);
  }

  expandRecursive(nodes: TreeNode[], isExpand: boolean) {
    nodes.forEach(node => {
      node.expanded = isExpand;
      if (node.children) {
        this.expandRecursive(node.children, isExpand);
      }
    });
  }

  expandSpecificNodes1() {
    this.expandRecursive(this.nodes, false);
    // 這裡傳入的條件可以根據需要更改，例如根據 label 或其他屬性來展開節點
    this.expandNodesWithCondition(this.nodes, node => node.data === '0');
  }

  expandSpecificNodes2() {
    this.expandRecursive(this.nodes, false);
    // 這裡傳入的條件可以根據需要更改，例如根據 label 或其他屬性來展開節點
    this.expandNodesWithCondition(this.nodes, node => node.data === '0' || node.data === '1');
  }

  expandSpecificNodes3() {
    this.expandRecursive(this.nodes, false);
    // 這裡傳入的條件可以根據需要更改，例如根據 label 或其他屬性來展開節點
    this.expandNodesWithCondition(this.nodes, node => node.data === '0' || node.data === '1' || node.data === '2');
  }

  expandNodesWithCondition(nodes: TreeNode[], condition: (node: TreeNode) => boolean) {
    nodes.forEach(node => {
      // 根據條件展開節點
      if (condition(node)) {
        node.expanded = true;
      }
      if (node.children) {
        this.expandNodesWithCondition(node.children, condition);
      }
    });
  }

  onBack() {
    this.router.navigate(['/SYSB000/SYSB400']);
  }
}
