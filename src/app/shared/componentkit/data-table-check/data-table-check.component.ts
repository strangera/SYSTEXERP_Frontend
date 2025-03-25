import { Component, EventEmitter, Input, SimpleChanges, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { Table } from 'primeng/table';
import { DatePipe } from '@angular/common';
//
import { ReportHead } from '../../models/ReportHead';
//
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BasicPrintComponent } from '../../componentextends/basic-print/basic-print.component';

@Component({
  selector: 'app-data-table-check',
  templateUrl: './data-table-check.component.html',
  styleUrl: './data-table-check.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DataTableCheckComponent extends BasicPrintComponent implements OnChanges {
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() reportHead: ReportHead = {
    reporttitle: 'report',
    reportname: 'report',
    exportuser: '',
    outputvisible: true
  };   //初始化報表表頭(預設匯出顯示資料)
  @Output() edit = new EventEmitter<any>();
  @Output() detail = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  loading: boolean = true;
  selectedRows: any[] = []; // 用於保存已勾選的行數據
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

  constructor(private datepipe: DatePipe) {
    super();
  }

  ngOnInit(): void {
    this.selectedColumns = this.getVisibleColumns();
    // ----------------------------------------------------------------
    this.totalRecords = this.data.length; // 確保總記錄數正確
    this.calculateTotalPages(); // 計算總頁數
    // ----------------------------------------------------------------
  }

  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    //if (changes.data) {
      // 資料發生變化時重置頁數
      this.selectedPage = 1;
      this.first = 0; // 更新起始索引
      this.totalRecords = this.data.length; // 更新總記錄數
      this.calculateTotalPages(); // 重新計算頁數
    //}
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
    // Create a new PDF document.
		let doc = new jsPDF('p', 'pt', [1000, 1500]); //'p' 代表緃向頁面，'pt' 為單位, a4:紙張大小

    this.BasicPrinting(doc, this.columns, this.data, this.reportHead, this.datepipe);
  }

  toggleColumnVisibility(event: any) {
    this.columns.forEach(col => {
      col.visible = this.selectedColumns.includes(col);
    });
  }

  getVisibleColumns() {
    return this.columns.filter(col => col.visible);
  }

  //onClear(dt: Table) {
    //dt.clear(); // Clear all filters in the table
    // this.searchValue = ''; // Reset search value
  //}

  onEdit(rowData: any) {
    this.edit.emit(rowData);
  }

  onDetail(rowData: any) {
    this.detail.emit(rowData);
  }

  isDisabled(): boolean {
    const rowsToDelete = this.selectedRows.filter(row => row.isdelete === true);

    return !rowsToDelete || !rowsToDelete.length;
  }

  onDelete() {
    if (this.selectedRows.length > 0) {
      // 過濾 selectedRows 中 isdelete 為 true 的項目
      const rowsToDelete = this.selectedRows.filter(row => row.isdelete === true);

      if (rowsToDelete.length > 0) {
        // 遍歷 rowsToDelete 陣列，根據 id 或其他唯一標識符從 data 中移除相應的項目
        console.log(rowsToDelete);
        // 在這裡加入您的刪除邏輯
        alert('所選項目中可刪除的項目');
      } else {
        alert('所選項目中沒有可刪除的項目');
      }
    } else {
      alert('請選擇要刪除的項目');
    }

    this.delete.emit();
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
