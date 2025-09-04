/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { Column } from '../table.model';
import { QueryStateService } from '@shared/service/query-state.service';
import { TableExportComponent } from '../table-export/table-export.component';
import { toggleButtons } from './table-caption.model';
import { TableUtilityService } from '../table-utility.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-table-caption',
  standalone: true,
  animations: [toggleButtons],
  imports: [
    MultiSelectModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    TooltipModule,
    FileUploadModule,
    DropdownModule,
    TableExportComponent
  ],
  templateUrl: './table-caption.component.html',
})
export class TableCaptionComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('fileUpload') fileUpload!: FileUpload; // 檔案上傳 元件
  @Input() dataKey = 'ID';                                                      // table 資料key
  @Input() showExpandCollapse = true;         // 是否顯示 全展開/收合 按鈕
  @Input() expansionDataKey = 'id';            // 收合展開 資料key(expansion必需配置)
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>; // 屬性來接收父層傳來的載入函數
  @Input() expandedRows: Record<string, boolean> = {};// 收合展開 已展開資料
  @Input() data: any[] = [];                        // table 資料 (必填)
  @Input() columns!: Column[];                      // table 欄位配置 (必填)
  @Output() columnsEvent = new EventEmitter<Column[]>();// table 欄位配置 (必填)
  @Input() selectedColumns!: Column[];             // table 預設顯示欄位
  @Output() selectedColumnsEvent = new EventEmitter<Column[]>();// table 欄位配置 (必填)
  isColumnsInitialized = false;                                                 // table 欄位是否初始化
  @Input() rowEditing = false;                      // 是否正在編輯Row
  @Input() selectedItems: any = [];                 // table 已勾選資料
  @Input() tableKey: string | undefined = undefined;// table 唯一標識 (必填)
  @Input() expansionColumns: Column[] = [];  // 收合展開 欄位配置(expansion必需配置)
  @Input() expression = false;                      // 收合展開 狀態 (true:展開、false:收合)
  @Input() apiUrl?: string;                         // table API URL (可選)
  @Input() disabled = false;                        // table 是否禁用
  // Header 相關
  @Input() showCaption = true;                // 是否顯示 Caption
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
  @Output() exportExcel = new EventEmitter<any>(); // 匯出 Excel 事件
  @Input() exportExcelLoading = false;             // 匯出 Excel loading
  @Output() importExcel = new EventEmitter<FileSelectEvent>(); // 匯入 Excel 事件
  @Input() showPage = true;                        // 是否顯示 下拉選單分頁器
  @Input() totalPages = 0;                                   // 共幾頁數
  @Output() pageChange = new EventEmitter<number>();
  @Output() expandEvent = new EventEmitter<any>();
  @Input() pages: { label: string, value: number; }[] = [];   // (右上)下拉選單 頁數選項
  @Input() selectedPage: number | null = 1;                  // (右上)下拉選單 當前選擇的頁數
  @Input() totalRecords = 0;                                 // 記錄總數
  @Input() rows = 10;                                         // 每頁顯示的行數
  @Input() first = 0;                                        // 當前表格的起始索引
  constructor(
    private readonly queryStateService: QueryStateService,
    private readonly tableUtilityService: TableUtilityService
  ) { super(); }

  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalRecords']) {
      setTimeout(() => {
        this.calculateTotalPages(); // 計算總頁數
      }, 300);
    }
    // 僅在 columns 首次被設定時執行初始化邏輯
    // 這樣就不會在每次 data 變動時都重置 filter 狀態
    if (changes['columns'] && this.columns?.length > 0) {
      // 恢復歷史紀錄，如果沒有就使用預設值
      setTimeout(() => {
        if (!this.isColumnsInitialized) {
          const storedFilter = this.queryStateService.getQueryStateValue(this.tableKey + 'Filter');
          if (storedFilter) {
            this.columns = storedFilter;
            const validFilteredColumns = this.columns.filter(col => col.visible !== false);// 只保留可見的欄位
            this.selectedColumns = validFilteredColumns;
            this.selectedColumnsEvent.emit(this.selectedColumns);
            this.columnsEvent.emit(this.columns);
          } else {
            this.columns = this.columns.filter(col => !col.hidden);
            this.selectedColumns = this.columns.filter(col => col.visible !== false);// 沒有儲存的狀態，使用預設值
            this.selectedColumnsEvent.emit(this.selectedColumns);
            this.columnsEvent.emit(this.columns);
          }
          this.isColumnsInitialized = true;
        } else {
          this.columns = this.columns.filter(col => !col.hidden);
          this.selectedColumns = this.columns.filter(col => col.visible !== false);// 沒有儲存的狀態，使用預設值
          this.selectedColumnsEvent.emit(this.selectedColumns);
          this.columnsEvent.emit(this.columns);
        }
      }, 300);
    }
  }
  // 全展開/收合的邏輯
  toggleExpandCollapse() {
    this.expression = !this.expression;
    this.tableUtilityService.toggleExpandCollapseLogic(this.data, this.expression, this.dataKey, this.expansionDataKey, this.expansionLoadFn, this.expandedRows, this);
  }
  // 計算總頁數並生成頁面選項
  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pages = Array.from({ length: this.totalPages }, (_, index) => ({ label: `第 ${index + 1} 頁`, value: index + 1 }));
    this.pages = [...this.pages];
    // 若當前頁數超過最大頁數，則移動到最大頁數，但至少為 1
    if (this.selectedPage && this.selectedPage > this.totalPages && this.totalRecords !== 0) {
      this.pageChange.emit(Math.max(this.totalPages, 1));
    }
    this.cdr.detectChanges();
  }
  // 過濾欄位記錄保存
  onFilterChange(event: MultiSelectChangeEvent) {
    this.columns.forEach(col => {
      col.visible = event.value.some((ev: any) => ev.field === col.field);
    });
    this.selectedColumnsEvent.emit(this.selectedColumns);
    this.queryStateService.setQueryState(this.tableKey + 'Filter', this.columns);
  }
  onExportExcel() { this.exportExcel.emit(); }                      // 匯出Excel範本 事件
  onImportExcel(event: FileSelectEvent) {                           // 匯入Excel
    this.importExcel.emit(event);
    this.fileUpload.clear();
  }
}
