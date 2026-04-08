import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TabViewModule } from 'primeng/tabview';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { TreeNode } from '../../../shared/models/sys/role.model';
import { Sys0300Service } from './sys0300.service';

// 定義固定的模組順序
const MODULE_ORDER: Record<string, number> = {
  'FIN00000': 1,
  'ASS00000': 2,
  'TLS00000': 3,
  'SYS0000': 4,
  'CPM0000': 5
};

@Component({
  selector: 'app-sys0300-tree',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TranslateModule, AccordionModule, BadgeModule,
    ButtonModule, CheckboxModule, IconFieldModule, InputIconModule,
    InputTextModule, TabViewModule, TriStateCheckboxModule, ProgressSpinnerModule
  ],
  templateUrl: './sys0300.component.html',
  styleUrls: ['./sys0300.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sys0300Component {
  private _moduleDataList: TreeNode[] = [];

  @Input()
  set moduleDataList(value: TreeNode[]) {
    if (value) {
      // *** 這裡執行強制排序 ***
      this._moduleDataList = [...value].sort((a, b) => {
        const orderA = MODULE_ORDER[a.id] || 99;
        const orderB = MODULE_ORDER[b.id] || 99;
        return orderA - orderB;
      });
    } else {
      this._moduleDataList = [];
    }
  }

  get moduleDataList(): TreeNode[] {
    return this._moduleDataList;
  }

  @Input() loading = false;
  @Output() nodeChanged = new EventEmitter<TreeNode>();

  activeIndex = 0;
  filterText = '';

  constructor(private sys0300Service: Sys0300Service) { }

  get totalEnabled(): number {
    return this.sys0300Service.getStatistics(this.moduleDataList).enabled;
  }

  get totalAll(): number {
    return this.sys0300Service.getStatistics(this.moduleDataList).total;
  }

  onSearch(value: string) {
    this.filterText = value.toLowerCase();
    let firstVisibleTabIndex = -1;
    this.moduleDataList.forEach((m, idx) => {
      const isVisible = this.sys0300Service.filterNode(m, this.filterText);
      if (isVisible && firstVisibleTabIndex === -1) firstVisibleTabIndex = idx;
    });
    if (this.filterText && firstVisibleTabIndex !== -1) this.activeIndex = firstVisibleTabIndex;
  }

  onCheckboxChange(node: TreeNode, newValue: boolean) {
    node.IsEnable = newValue === false ? null : newValue;
    this.sys0300Service.cascadeDown(node, node.IsEnable);
    this.sys0300Service.cascadeUp(node);
    this.nodeChanged.emit(node);
  }

  getIconClass(moduleId: string): string {
    const icons: Record<string, string> = {
      'FIN00000': 'pi pi-users',        // 人資財會
      'ASS00000': 'pi pi-briefcase',    // 物業管理
      'TLS00000': 'pi pi-shopping-bag', // 商場管理
      'SYS0000': 'pi pi-user',          // 權限基本
      'CPM0000': 'pi pi-chart-pie'      // 行銷管理
    };
    return icons[moduleId] || 'pi pi-circle';
  }

  trackByFn(index: number, item: TreeNode): string {
    return item.id;
  }
}
