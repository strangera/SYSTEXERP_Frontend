import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Column } from '../table.model';

@Component({
  selector: 'app-table-footer',
  standalone: true,
  imports: [
    NgFor,
    NgIf
  ],
  templateUrl: './table-footer.component.html'
})
export class TableFooterComponent {
  @Input() IsPrint!: boolean;
  @Input() showCheckBox = false;                                                // 是否顯示 checkbox
  @Input() rowEditing = false;                                                  // 是否正在編輯Row
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'multiple';// table 勾選 Mode (預設多選)
  @Input() expansionDataKey = '';            // 收合展開 資料key(expansion必需配置)
  @Input() columns!: Column[];                                                  // table 欄位配置 (必填)
  @Input() data: any[] = [];                                                    // table 資料 (必填)
  @Input() alwaysEdit = false;                                                  // 是否總是編輯
  @Input() showManage = true;                // 是否顯示 管理欄位

  // 全表總計
  getTotal(field: string): number {
    return this.data.reduce((sum, row) => sum + (row[field] || 0), 0);
  }
}
