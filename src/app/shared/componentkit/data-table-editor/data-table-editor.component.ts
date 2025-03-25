import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-data-table-editor',
  templateUrl: './data-table-editor.component.html',
  styleUrl: './data-table-editor.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DataTableEditorComponent {
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Output() edit = new EventEmitter<any>();
  @Output() detail = new EventEmitter<any>();
  loading: boolean = true;
  selectedColumns: any[] = [];
  IsPaginator: boolean = true; // 是否顯示分頁器
  IsScrollable: boolean = false; // 是否捲軸
  IsScrollHeight: string = 'flex'; // 是否捲軸
  tableSize: string = 'p-datatable-sm p-datatable-gridlines p-datatable-striped';
  // Scroll
  // ----------------------------------------------------------------
  rows: number = 10; // 每頁顯示的行數
  first: number = 0; // 當前表格的起始索引
  selectedPage: number = 1; // 當前選擇的頁數
  pages: any[] = []; // 下拉選單頁數選項
  totalRecords: number = 0; // 記錄總數
  totalPages: number = 0; // 共幾頁數

  constructor() { }

  ngOnInit(): void {
    this.selectedColumns = this.getVisibleColumns();
    // ----------------------------------------------------------------
    this.totalRecords = this.data.length; // 確保總記錄數正確
    this.calculateTotalPages(); // 計算總頁數
  }

  togglePaginator() {
    this.IsPaginator = !this.IsPaginator;
    this.IsScrollable = !this.IsScrollable;

    if(this.IsPaginator) {
      this.IsScrollHeight = 'flex';
      this.tableSize = 'p-datatable-sm p-datatable-gridlines p-datatable-striped';
    } else {
      this.IsScrollHeight = '700px';
      this.tableSize = 'p-datatable-sm p-datatable-striped';
    }
  }

  togglePrint() {
  }

  toggleColumnVisibility(event: any) {
    this.columns.forEach(col => {
      col.visible = this.selectedColumns.includes(col);
    });
  }

  getVisibleColumns() {
    return this.columns.filter(col => col.visible);
  }

  onClear(dt: Table) {
    dt.clear(); // Clear all filters in the table
    // this.searchValue = ''; // Reset search value
  }

  onEdit(rowData: any) {
    this.edit.emit(rowData);
  }

  onDetail(rowData: any) {
    this.detail.emit(rowData);
  }
  // ----------------------------------------------------------------
  // 計算總頁數並生成頁面選項
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pages = Array(this.totalPages).fill(0).map((x, i) => ({
      label: `第 ${i + 1} 頁`,
      value: i + 1 // 頁數
    }));

    // 預設選擇第一頁
    if (this.pages.length > 0) {
      this.selectedPage = this.pages[0].value;
    }
  }

  // 當用戶選擇頁面時
  goToPage(pageNumber: number) {
    // 驗證資料與頁碼範圍
    if (this.data.length === 0 || pageNumber < 1 || pageNumber > Math.ceil(this.totalRecords / this.rows)) {
      console.warn('無法跳轉到指定頁面，資料為空或頁碼超出範圍');
      return;
    }

    // 設置起始索引來顯示對應的頁面
    this.first = (pageNumber - 1) * this.rows; // 計算起始索引
    this.selectedPage = pageNumber; // 更新選擇的頁數
  }

  // 當頁面透過表格內建分頁器變動時
  onPageChange(event: any) {
    this.first = event.first; // 更新當前起始索引
    this.rows = event.rows; // 更新每頁行數

    this.calculateTotalPages(); // 計算總頁數

    this.selectedPage = Math.ceil((event.first / event.rows) + 1); // 更新下拉選單中的頁碼
  }
}
