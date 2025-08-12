import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Column } from '../table.model';
import { TableModule } from 'primeng/table';
import { PrimeTemplate } from 'primeng/api';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { expandAnimation } from './table-expansion.model';

@Component({
  selector: 'app-table-expansion',
  templateUrl: './table-expansion.component.html',
  animations: [expandAnimation],
  standalone: true,
  imports: [TableModule, PrimeTemplate, NgFor, NgIf, CommonModule]
})
export class TableExpansionComponent implements OnInit {
  @Input() expansionDataKey = '';
  @Input() expansionColumns: Column[] = [];
  @Input() rowData: any;
  @Input() expansionSortField = 'ID';
  @Input() expansionSortOrder = 1;

  // 新增分頁相關參數
  @Input() showPaginator = false;          // 是否顯示分頁器
  @Input() rows = 10;                     // 每頁顯示行數
  @Input() rowsPerPageOptions = [10, 30, 50]; // 分頁選項
  @Input() scrollHeight = '300px';        // 表格高度

  localRowData: any[] = [];
  isExpanded = false;

  // 分頁相關屬性
  totalRecords = 0;                       // 總記錄數
  first = 0;                              // 當前起始索引

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.localRowData = this.rowData[this.expansionDataKey] || [];
      this.totalRecords = this.localRowData.length;
      this.isExpanded = true;

      // 強制觸發變更偵測
      this.cdr.detectChanges();
    });
  }

  getFilterColumns(columns: Column[]): Column[] {
    return columns.filter(col => !col.hidden);
  }

  // 分頁變更事件
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }
}
