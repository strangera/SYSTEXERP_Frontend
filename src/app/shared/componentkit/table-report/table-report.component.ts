/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableColumnReorderEvent, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { finalize, Observable } from 'rxjs';
import { AddButton, Column, ColumnGroup } from './table-report.model';
import { QueryStateService } from '@shared/service/query-state.service';
import { TableReportUtilityService } from './table-report-utility.service';
import { ImageModule } from 'primeng/image';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [TableModule, NgFor, NgIf, NgClass, NgStyle, ImageModule, ButtonModule, TooltipModule],
  templateUrl: './table-report.component.html'
})
export class TableReportComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;
  @Input() lastQueryBody?: any;                            // 用來儲存上一次的查詢條件
  @Input() totalRecords = 0;                               // 用來儲存總筆數
  @Input() data: any[] = [];                               // 用來儲存查詢結果
  @Input() dataKey = 'ID';                                 // 用來儲存查詢結果
  @Input() columns: Column[] = [];                              // 用來儲存查詢結果
  @Input() queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  @Input() tableKey: string | undefined = undefined;
  //
  @Input() apiUrl: string | undefined = undefined;
  @Input() showCheckBox = false;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Input() rowSelectableWrapper: (row: any) => boolean = () => true;
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位
  // 管理 欄位
  @Input() showManage = true;                // 是否顯示 管理欄位
  @Input() showDetail = true;                // 是否顯示 管理欄位(明細按鈕)
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;                  // 是否顯示 管理欄位(編輯按鈕)
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Output() edit = new EventEmitter<any>();  // 編輯事件
  @Output() delete = new EventEmitter<any>();  // 刪除事件
  @Input() addButton: AddButton[] = [];      // 自定義 管理按鈕
  @Input() buttonsLoading = false;           // 按鈕們 loading

  @Output() selectButton = new EventEmitter<any>();             // 選擇 按鈕事件
  @Input() disabled = false;
  //
  private isFirstLoadAfterSubmit = true;            // 用來判斷是否為第一次載入
  private pendingRequests = new Map<number, any>(); // 用來儲存未完成的請求
  virtualData: any = [];

  constructor(
    private readonly queryState: QueryStateService,
    private readonly tableReportUtilityService: TableReportUtilityService,
    private readonly sanitizer: DomSanitizer,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    // 第一次獲取data
    if (changes['data'] && this.data.length > 0) {
      this.virtualData = Array(this.data.length + 30).fill(null); // ! 清空虛擬資料
      setTimeout(() => {
        this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
      })
      this.isFirstLoadAfterSubmit = false; // ! 設定為非第一次載入
    }
  }

  trackByFn(index: number, item: any) {
    return item[this.dataKey] || index;
  }

  onSelectionChange(event: any) {
    this.selectedItems = event.filter((item: any) => this.rowSelectableWrapper(item));
    this.selectionChange.emit(this.selectedItems);
  }

  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
    return this.tableReportUtilityService.shouldRenderGroupHeader(col, index, columns);
  }
  // 計算分組欄位跨度
  getColumnSpan(columns: Column[], groupField: string): number {
    return this.tableReportUtilityService.getColumnSpan(columns, groupField);
  }
  // 分組欄位對齊
  getGroupAlignClass(groupField: string): string {
    const align = this.columnGroup?.find(g => g.field === groupField)?.align;
    return align ? 'text-' + align : 'text-center';
  }
  // 分組標題
  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }
  // 獲取後端圖片
  getImage(url: string): string | SafeUrl | undefined {
    return this.tableReportUtilityService.getImage(url);
  }
  // Edit 按鈕 事件
  editRow(rowData: any) { this.edit.emit(rowData); }
  // Detail 或 雙擊行 事件
  detailRow(rowData: any) { this.detail.emit(rowData); }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    this.delete.emit(selectedItems);
  }
  loadDataLazy(event: TableLazyLoadEvent) {
    if (!this.lastQueryBody || this.totalRecords === 0) {
      return; // ! 如果沒有上一次的查詢條件 或 是沒有總筆數，就不用載入
    }
    if (this.isFirstLoadAfterSubmit) {// ! 如果是第一次載入，就不用載入
      this.isFirstLoadAfterSubmit = false;
      return;
    }
    const pageSize = (event.rows ?? 30);
    const start = (event.last === this.totalRecords) ? this.totalRecords - (this.totalRecords % (event.rows ?? 30)) : (event.first ?? 0);
    const end = start + pageSize;
    const cachedDataSlice = this.data.slice(start, Math.min(end, this.data.length)); // ! 取得快取的資料
    // ! 如果快取的資料長度大於 0 且都不為 null 或 undefined
    if (cachedDataSlice.length > 0 && cachedDataSlice.every(item => item !== null && item !== undefined)) {
      const newVirtualData = [...this.virtualData];
      newVirtualData.splice(start, cachedDataSlice.length, ...cachedDataSlice);
      this.virtualData = newVirtualData;
      return;
    }
    // 檢查這個區段的請求是否已在進行中
    if (this.pendingRequests.has(start)) {
      return; // 已經有請求了，不重複發送
    }
    // 檢查 queryFunction 是否存在
    if (!this.queryFunction) {
      console.error('queryFunction is not provided!');
      return;
    }
    const pageIndex = Math.ceil(start / pageSize + 1);
    const body = {
      ...this.lastQueryBody,
      pageIndex: pageIndex,
      pageSize: pageSize,
    };
    const request$ = this.queryFunction(body).pipe(finalize(() => { this.pendingRequests.delete(start); }));
    this.pendingRequests.set(start, request$);
    request$.subscribe(res => {
      if (this.pendingRequests.has(start)) {
        if (this.totalRecords !== res.TotalCount) {
          this.totalRecords = res.TotalCount;
          this.data = [];
          this.virtualData = Array(this.totalRecords).fill(null);
        }
        this.data.splice(start, res.Data.length, ...res.Data);
        if (res.TotalCount !== this.data.length) {
          if (this.virtualData.length + 30 < this.totalRecords) {
            this.virtualData = Array(this.data.length + 30).fill(null);
            setTimeout(() => {
              this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
            })
          } else {
            this.virtualData = Array(this.totalRecords).fill(null);
            setTimeout(() => {
              this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
            })
          }
        } else {
          this.virtualData = Array(this.totalRecords).fill(null);
          setTimeout(() => {
            this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
          })
        }
      }
    });
  }
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
  // 欄位Button 選擇 事件
  onSelectButton(rowData: any) { this.selectButton.emit(rowData); }
  // 防止XSS
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
