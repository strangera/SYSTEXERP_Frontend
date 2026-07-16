import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'; // 引入 ChangeDetectorRef
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { PrimeTemplate } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { TableReportComponent } from 'src/app/shared/components/table-report/table-report.component';
import { ReportColumn } from 'src/app/shared/components/table-report/table-report.model';
import { Sys0210Service } from '../../../service/api/sys/sys0210.service';
import { Sys0230Service } from '../../../service/api/sys/sys0230.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { BasicCruPageComponent } from '../../../shared/componentextends/basic-crupage/basic-cru-page.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputTextComponent } from '../../../shared/components/input-text/input-text.component';
import { Column } from '../../../others/component/table/table.model';
import { TreeNode } from '../../../shared/models/sys/role.model'; // 引入 TreeNode
import { apiOption, tblRole } from '../../../shared/models/sys/sysb000.model';
import { InputGroupComponent } from './input-group/input-group.component';

// 配對角色
export interface UserOption {
  ID: string; // ID
  User_No: string; // 角色代號
  User_Name: string; // 角色名稱
  Match: boolean; // 是否配對
}

// 4-2-2-3角色複製 CRU
@Component({
  selector: 'app-sys0240.cru',
  templateUrl: './sys0240.cru.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    MenubarComponent,
    ButtonComponent,
    PanelModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    InputGroupComponent,
    CheckboxModule,
    NgIf,
    TableReportComponent,
    DividerModule,
    TabViewModule,
    PrimeTemplate,
    NgClass,
    NgFor,
    AccordionModule,
    TranslateModule,
    DividerModule
  ],
})
export class SYS0240CRUComponent extends BasicCruPageComponent<tblRole> implements OnInit {
  // ----------------------------------------------------------------
  dataForm = this.formBuilder.nonNullable.group({
    id: [], // ID
    Role_No: ['', [Validators.required, Validators.maxLength(10)]], // 來源角色代號
    Role_Name: ['', [Validators.required, Validators.maxLength(30)]], // 來源角色名稱
    Target_No: ['', [Validators.required, Validators.maxLength(10)]], // 目標角色代號
    Target_Name: ['', [Validators.maxLength(30)]], // 目標角色名稱
    IsAllCopy: [false],
  });
  targetOptions: apiOption[] = []; //目標options
  roleColumns: ReportColumn[] = [
    { field: 'Role_No', header: '角色代號', visible: true },
    { field: 'Role_Name', header: '角色名稱', visible: true }
  ];
  roleUserData: UserOption[] = []; //目標權限
  roleUserColumns: Column[] = [
    { field: 'User_No', header: '使用者代號', visible: true },
    { field: 'User_Name', header: '使用者名稱', visible: true },
  ]

  // 新增模組權限數據的屬性
  FIN00000Data: TreeNode | undefined; // 人資財會模組
  ASS00000Data: TreeNode | undefined; // 物業管理模組
  TLS00000Data: TreeNode | undefined; // 商場管理模組
  SYS0000Data: TreeNode | undefined; // 權限及基本資料
  CPM0000Data: TreeNode | undefined; // 行銷管理模組

  constructor(
    private sys0210Service: Sys0210Service,
    private sys0230Service: Sys0230Service,
    private cdr: ChangeDetectorRef, // 注入 ChangeDetectorRef
  ) {
    super(); // 呼叫父類建構子
  }

  ngOnInit(): void {
    this.initializePage('SYS0240', this.dataForm);
    this.sys0210Service.queryAllRole().pipe(untilDestroyed(this)).subscribe((response) => {
      this.targetOptions = response.Data.map((item: any) => ({
        ...item,
        label: item.Role_No + ' - ' + item.Role_Name
      }));
    });

    // 查詢來源角色使用者權限 (只顯示 match 為 true 的)
    this.sys0230Service.queryRoleUsers({ Role_No: this.rowdata?.Role_No }).pipe(untilDestroyed(this)).subscribe((response) => {
      this.roleUserData = response.Data.filter((item: UserOption) => item.Match === true);
      this.cdr.markForCheck(); // 觸發變更檢測
    });

    // 查詢來源角色系統權限
    this.sys0210Service.queryRolePrivileges({ Role_No: this.rowdata?.Role_No }).pipe(untilDestroyed(this)).subscribe({
      next: (response) => {
        if (response.Status === '0000' && response.Data && Array.isArray(response.Data)) {
          response.Data.forEach((node: any) => {
            const transformedNode = this.setParentReferences(node);

            switch (transformedNode.id) {
              case 'ASS00000':
                this.ASS00000Data = transformedNode;
                break;
              case 'CPM0000':
                this.CPM0000Data = transformedNode;
                break;
              case 'FIN00000':
                this.FIN00000Data = transformedNode;
                break;
              case 'SYS0000':
                this.SYS0000Data = transformedNode;
                break;
              case 'TLS00000':
                this.TLS00000Data = transformedNode;
                break;
              default:
                break;
            }
          });
          // 初始載入時，更新所有父節點的 partialSelected 狀態
          this.updateAllParentNodeStatuses();
          // 設定初始展開狀態 (只展開有已選權限的層級)
          this.setInitialOpenStateForSecondLevelNodes();
          this.cdr.markForCheck(); // 觸發變更檢測
        }
      },
      error: (err: string) => {
        console.error('API error:', err);
      },
    });
  }

  // 從 SYS0310 複製過來的輔助方法
  private setParentReferences(node: TreeNode, parent: TreeNode | null = null): TreeNode {
    const newNode: TreeNode = { ...node, parent: parent || undefined };

    // 初始化 partialSelected 和 isOpen
    if (newNode.partialSelected === undefined) {
      newNode.partialSelected = false;
    }
    // 為第二層節點（模組下的直接子節點）初始化 isOpen
    if (parent && (parent.id && (parent.id.endsWith('00000') || parent.id.endsWith('0000')))) {
      if (newNode.isOpen === undefined) {
        newNode.isOpen = false;
      }
    }

    if (newNode.children && newNode.children.length > 0) {
      newNode.children = newNode.children.map(child =>
        this.setParentReferences(child, newNode)
      );
    }

    if (newNode.actions && newNode.actions.length > 0) {
      newNode.actions = newNode.actions.map(action =>
        this.setParentReferences(action, newNode)
      );
    }

    return newNode;
  }

  private updateAllParentNodeStatuses() {
    const modules = [this.FIN00000Data, this.ASS00000Data, this.TLS00000Data, this.SYS0000Data, this.CPM0000Data];
    modules.forEach(moduleData => {
      if (moduleData) {
        this.traverseAndCalculateStatus(moduleData);
      }
    });
  }

  // 修改 traverseAndCalculateStatus，只保留 IsEnable 為 true 的路徑
  private traverseAndCalculateStatus(node: TreeNode) {
    if (node.children) {
      // 遞迴處理子節點
      node.children.forEach(child => this.traverseAndCalculateStatus(child));
      // 過濾掉所有 IsEnable 為 false 的子節點
      node.children = node.children.filter(child => child.IsEnable || child.partialSelected);
    }
    if (node.actions) {
      // 遞迴處理 actions
      node.actions.forEach(action => this.traverseAndCalculateStatus(action));
      // 過濾掉所有 IsEnable 為 false 的 actions
      node.actions = node.actions.filter(action => action.IsEnable);
    }

    // 計算當前節點 (node) 的 IsEnable 和 partialSelected 狀態
    if ((node.children && node.children.length > 0) || (node.actions && node.actions.length > 0)) {
      let totalSelectedItems = 0; // 統計已勾選的子項
      let hasPartialSelectedChild = false; // 檢查是否有部分選中的子項

      if (node.children) {
        node.children.forEach(child => {
          if (child.IsEnable) {
            totalSelectedItems++;
          }
          if (child.partialSelected) {
            hasPartialSelectedChild = true;
          }
        });
      }

      if (node.actions) {
        node.actions.forEach(action => {
          if (action.IsEnable) {
            totalSelectedItems++;
          }
        });
      }

      // 根據子項的狀態更新當前節點
      if (totalSelectedItems > 0 && totalSelectedItems === (node.children?.length || 0) + (node.actions?.length || 0)) {
        node.IsEnable = true; // 所有子項都已選中，父節點完全勾選
        node.partialSelected = false;
      } else if (totalSelectedItems > 0 || hasPartialSelectedChild) {
        node.IsEnable = false; // 有部分子項選中或有部分選中的子節點，父節點部分勾選
        node.partialSelected = true;
      } else {
        // 沒有任何項目選中，父節點未勾選 (這在過濾後可能不會發生，除非原始數據就沒有)
        node.IsEnable = false;
        node.partialSelected = false;
      }
    } else {
      // 如果節點本身沒有子節點或 actions，但它自己 IsEnable 是 true，則保留
      // 否則，將其 IsEnable 設為 false，這樣在父級過濾時會被移除 (如果它不是最終層級)
      if (!node.IsEnable) {
        node.IsEnable = false;
        node.partialSelected = false;
      }
    }
  }


  // 設定初始展開狀態：如果第二層節點有任何子節點或行為被勾選或部分勾選，則展開
  private setInitialOpenStateForSecondLevelNodes() {
    const modules = [this.FIN00000Data, this.ASS00000Data, this.TLS00000Data, this.SYS0000Data, this.CPM0000Data];
    modules.forEach(moduleData => {
      if (moduleData && moduleData.children) {
        moduleData.children.forEach(item => {
          let shouldOpen = false;
          // 檢查子節點或 actions 中是否有任何 IsEnable 或 partialSelected 為 true 的
          if (item.children && item.children.some(child => child.IsEnable || child.partialSelected)) {
            shouldOpen = true;
          }
          if (item.actions && item.actions.some(action => action.IsEnable || action.partialSelected)) {
            shouldOpen = true;
          }
          // 如果 item 本身是 IsEnable 或 partialSelected，也應該打開
          if (item.IsEnable || item.partialSelected) {
            shouldOpen = true;
          }
          item.isOpen = shouldOpen;
        });
      }
    });
  }

  onSubmit(frm: FormGroup) {
    this.handleSubmit(frm, () => {
      const requestBody = {
        Source_No: this.dataForm.get('Role_No')?.value ?? '',
        Target_No: frm.value.Target_No,
        IsAllCopy: frm.value.IsAllCopy
      };

      console.log('更新的請求內容', requestBody);
      this.sys0210Service.copyRoleSettings(requestBody).pipe(untilDestroyed(this)).subscribe(() => {
        this.messageService.successBubble('複製成功');
        this.onCancel(); // 更新成功後返回查詢頁面
      });
    });
  }

  // 從 SYS0310 複製過來的 getIconClass
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

  // 從 SYS0310 複製過來的 trackByFn
  trackByFn(index: number, item: any): string {
    return item.id; // 假設每個 TreeNode 都有唯一的 'id'
  }
}
