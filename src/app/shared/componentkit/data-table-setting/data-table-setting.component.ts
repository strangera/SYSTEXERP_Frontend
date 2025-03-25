import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

@Component({
  selector: 'app-data-table-setting',
  templateUrl: './data-table-setting.component.html',
  styleUrl: './data-table-setting.component.scss'
})
export class DataTableSettingComponent {
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  loading: boolean = true;
  selectedRows: any[] = []; // 用於保存已勾選的行數據
  selectedColumns: any[] = [];
  IsPaginator: boolean = true; // 是否顯示分頁器
  IsScrollable: boolean = true; // 是否捲軸
  IsScrollHeight: string = '500px'; // 是否捲軸
  tableSize: string = 'p-datatable-sm p-datatable-gridlines p-datatable-striped';
  // Scroll
  // ----------------------------------------------------------------
  // rows: number = 10; // 每頁顯示的行數
  pages: any[] = []; // 下拉選單頁數選項
  totalRecords: number = 0; // 記錄總數

  constructor() {
  }

  ngOnInit(): void {
    this.selectedColumns = this.getVisibleColumns();
    // ----------------------------------------------------------------
    this.totalRecords = this.data.length; // 確保總記錄數正確
    // ----------------------------------------------------------------
  }
  toggleColumnVisibility(event: any) {
    this.columns.forEach(col => {
      col.visible = this.selectedColumns.includes(col);
    });
  }

  getVisibleColumns() {
    return this.columns.filter(col => col.visible);
  }
}
