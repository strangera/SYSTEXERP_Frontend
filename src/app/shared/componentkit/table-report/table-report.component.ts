/* eslint-disable @typescript-eslint/no-explicit-any */
import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table, TableColumnReorderEvent, TableModule } from 'primeng/table';
import { finalize, Observable } from 'rxjs';
import { AddButton, Column, ColumnGroup } from './table-report.model';
import { TableReportUtilityService } from './table-report-utility.service';
import { ImageModule } from 'primeng/image';
import { DomSanitizer } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableCaptionComponent } from '../table/table-caption/table-caption.component';
import { FileSelectEvent } from 'primeng/fileupload';
import { ActivatedRoute } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-table-report',
  standalone: true,
  imports: [SkeletonModule, TableModule, NgFor, NgIf, NgClass, NgStyle, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss']
})
export class TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') private dt!: Table;
  @Input() lastQueryBody?: any;                            // 用來儲存上一次的查詢條件
  @Input() totalRecords = 0;                               // 用來儲存總筆數
  @Input() data: any[] = [];                               // 用來儲存查詢結果
  @Input() dataKey = 'ID';                                 // 用來儲存查詢結果
  @Input() columns: Column[] = [];                              // 用來儲存查詢結果
  selectedColumns: Column[] = [];                  // 用來儲存查詢結果
  @Input() queryFunction?: (body: any) => Observable<any>; // 用來儲存查詢函數
  // tableKey預設給路由名稱
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  //
  @Input() apiUrl: string | undefined = undefined;
  @Input() showCheckBox = false;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Input() rowSelectableWrapper: (row: any) => boolean = () => true;
  // Header 相關
  @Input() showCaption = true;                                                  // 是否顯示 Caption
  // Header(左) 相關
  @Input() showHeader = true;                 // 是否顯示 Header
  @Input() showFilter = true;                 // 是否顯示 Filter
  @Input() showReportMode = true;             // 是否顯示 匯出按鈕
  @Input() customReport = false;               // 是否自訂報表
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  @Input() showInsert = false;                // 是否顯示 Insert新增按鈕
  @Output() insert = new EventEmitter<any>(); // 新增事件
  @Input() insertDisabled = false;            // 新增按鈕是否禁用
  @Input() deleteData = false;                // 預先刪除資料 (關聯：需要加入dataKey, dataChange)
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showDelete = true;                    // 是否顯示刪除按鈕
  @Input() deleteIcon = 'pi pi-trash';          // 刪除按鈕圖示
  @Input() deletepTooltip = '刪除';              // 刪除按鈕提示
  // Header(右) 相關
  @Input() showExcel = false;                      // 是否顯示 匯出Excel
  @Input() showExcelExport = true;                 // 是否顯示 匯出Excel按鈕
  @Input() showExcelImport = true;                 // 是否顯示 匯入Excel按鈕
  @Input() showCustomExcelImport = false;         // 是否顯示 自訂匯入Excel按鈕
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;             // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  // 欄位群組
  @Input() columnGroup?: ColumnGroup[];                                         // table 群組欄位
  // 管理 欄位
  @Input() showManage = true;                // 是否顯示 管理欄位
  @Input() showDetail = true;                // 是否顯示 管理欄位(明細按鈕)
  @Output() detail = new EventEmitter<any>();// 明細事件
  @Input() showEdit = true;                  // 是否顯示 管理欄位(編輯按鈕)
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Output() edit = new EventEmitter<any>();  // 編輯事件
  @Input() addButton: AddButton[] = [];      // 自定義 管理按鈕
  @Input() buttonsLoading = false;           // 按鈕們 loading

  @Output() selectButton = new EventEmitter<any>();             // 選擇 按鈕事件
  @Input() disabled = false;
  //
  private = true;            // 用來判斷是否為第一次載入
  virtualData: any = [];
  isLoading = false;
  constructor(
    public readonly tableUtility: TableReportUtilityService,
    public readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  ngOnChanges(changes: SimpleChanges) {
    // 第一次獲取data
    if (changes['data'] && this.data.length > 0) {
      if (this.data.length >= 30) {
        this.virtualData = Array(this.data.length).fill(null); // ! 清空虛擬資料
        setTimeout(() => {
          this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
        })
      } else {
        this.virtualData = [...this.data];
      }
    }
    if (changes['lastQueryBody'] && this.lastQueryBody) {
      this.dt.multiSortMeta = this.lastQueryBody?.SortBy;
    }
  }

  trackByFn(index: number, item: any) {
    return item?.[this.dataKey];
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
  onScroll(event: any) {
    if (this.isLoading || this.data.length >= this.totalRecords || this.data.length < 30) {
      return;
    }
    if (event && event.originalEvent && event.originalEvent.target) {
      const target = event.originalEvent.target as HTMLElement;
      const scrollTop = target.scrollTop;
      const scrollHeight = target.scrollHeight;
      const clientHeight = target.clientHeight;
      const threshold = 2; // 容錯值可自行調整，通常 1-2 像素就足夠
      if (scrollHeight - scrollTop - clientHeight <= threshold) {
        this.loadMoreData();
      }
    }
  }
  loadMoreData() {
    if (!this.queryFunction || !this.lastQueryBody) {
      return;
    }
    this.isLoading = true;
    const pageSize = 30; // 或從某處取得 pageSize
    const pageIndex = Math.floor(this.data.length / pageSize) + 1;
    const body = { ...this.lastQueryBody, pageIndex: pageIndex, pageSize: pageSize };
    this.queryFunction(body).pipe(finalize(() => this.isLoading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.data = [...this.data, ...res.Data];
        this.totalRecords = res.TotalCount; // 確保總筆數同步更新
        this.virtualData = Array(this.data.length).fill(null);
        setTimeout(() => {
          this.virtualData.splice(0, this.data.length, ...this.data); // ! 將快取的資料放入虛擬資料
          this.dt.scrollHeight = '700px';
        })
      }
    });
  }
  // 新增 onSort 方法
  onSort(event: any) {
    // 檢查是否有 queryFunction
    if (!this.queryFunction || !this.lastQueryBody || this.data.length < 30) {
      return;
    }
    // 3. 準備查詢參數
    const body = {
      ...this.lastQueryBody,
      pageSize: 30,
      pageIndex: 1, // 重新排序時，總是從第一頁開始
      SortBy: event.multisortmeta, // 使用內部狀態
    };

    // 4. 呼叫 API 重新取得資料
    this.queryFunction(body).pipe(finalize(() => this.isLoading = false)).subscribe(res => {
      if (res && res.Data) {
        // 5. API 成功後，更新資料和狀態
        this.data = res.Data;
        this.totalRecords = res.TotalCount;
        this.lastQueryBody = body; // 更新最後一次的查詢條件

        // 重新處理虛擬滾動資料
        if (this.data.length > 0) {
          if (this.data.length >= 30) {
            this.virtualData = Array(this.data.length).fill(null);
            setTimeout(() => {
              this.virtualData.splice(0, this.data.length, ...this.data);
            });
          } else {
            this.virtualData = [...this.data];
          }
        }
      }
    });
  }
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
}
