/* eslint-disable @typescript-eslint/no-explicit-any */
import { animate, state, style, transition, trigger } from "@angular/animations";
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QueryStateService } from '@shared/service/query-state.service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { MultiSelectChangeEvent, MultiSelectModule } from 'primeng/multiselect';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { Observable } from 'rxjs';
import { CurrentPageService } from "src/app/core/layout/app.menulist/current-page.service";
import { SystemDataService } from "src/app/service/system/system-data.service";
import { ExportComponent } from 'src/app/shared/exports/export.component';
import { ExportContext, ReportExportService } from 'src/app/shared/exports/report-export.service';
import { FunsrightInfo } from "src/app/shared/models/system/funsrightInfo";
import { ReportColumn } from '../table-report.model';

export const toggleButtons = trigger('toggleButtons', [
  state('hidden', style({ transform: 'translateX(-10px)', width: '0px', opacity: 0 })),
  state('visible', style({ transform: 'translateX(0px)', width: 'auto', opacity: 1 })),
  transition('hidden <=> visible', [animate('300ms ease-in-out')])
]);

@Component({
  selector: 'app-table-report-caption',
  standalone: true,
  animations: [toggleButtons],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MultiSelectModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    TooltipModule,
    FileUploadModule,
    DropdownModule,
    ExportComponent,
    ProgressBarModule
  ],
  template: `
  <div class="grid align-items-center justify-content-between mx-0" *ngIf="showCaption && !rowEditing">
    <div class="caption-left button-group flex gap-2 py-2">
      <p-multiSelect *ngIf="showFilter" [options]="columns" [(ngModel)]="selectedColumns" optionLabel="header"
        dropdownIcon="pi pi-cog" pTooltip="過濾欄位" tooltipPosition="top" (onChange)="onFilterChange($event)" />
      <p-button [icon]="IsPrint ? 'pi pi-file' : 'pi pi-times'" [rounded]="true" *ngIf="showReportMode && data.length > 0"
        (click)="toggleVisibility()" [pTooltip]="IsPrint ? '報表模式' : '關閉報表模式'" tooltipPosition="top" [outlined]="!IsPrint"
        [disabled]="!hasPermission('50')" />
      <div [@toggleButtons]="!IsPrint ? 'visible' : 'hidden'" [ngClass]="IsPrint ? 'hidden' : 'flex'" class="gap-2">
        <p-button *ngIf="showReportPDF" pButton tooltipPosition="top" pTooltip="列印PDF"
          class="p-button-rounded p-button-text p-button-info" icon="fa-regular fa-file-pdf"
          (click)="customReport ? exportEvent.emit('PDF') : export('PDF')" [disabled]="!hasPermission('60')" />
        <p-button *ngIf="showReportExcel" pButton tooltipPosition="top" pTooltip="匯出Excel"
          class="p-button-rounded p-button-text p-button-info" icon="fa-regular fa-file-lines"
          (click)="customReport ? exportEvent.emit('Excel') : export('Excel')" [disabled]="!hasPermission('70')" />
      </div>
      <p-button *ngIf="IsPrint && showInsert && !rowEditing && !disabled" (click)="insert.emit()" pTooltip="新增"
        tooltipPosition="top" pButton icon="pi pi-plus" severity="success" class="p-button-rounded p-button-text"
        [disabled]="insertDisabled || !hasPermission('20')" />
      <p-button *ngIf="IsPrint && showDelete && !rowEditing && !disabled" (click)="delete.emit(selectedItems)"
        [pTooltip]="deletepTooltip" tooltipPosition="top" pButton [icon]="deleteIcon" severity="danger"
        class="p-button-text" [rounded]="true"
        [disabled]="selectedItems?.length <= 0 || !hasPermission('40') || checkBatchDeleteDisabled()">
      </p-button>
    </div>
    <div class="flex-grow-1 p-2">
      <ng-content select="header"></ng-content>
    </div>
    <div class="flex gap-2 py-2">
      <div *ngIf="expansionColumns.length > 0 && IsPrint" class="flex align-items-center">
        <p-button styleClass="p-2" label="全部收合" icon="pi pi-angle-up" text (click)="toggleExpandCollapse()"></p-button>
      </div>
      <div *ngIf="showExcel" class="flex gap-2 align-items-center">
        <p-button *ngIf="showExcelExport" label="匯出excel範本" severity="success" [icon]="
            exportExcelLoading ? 'pi pi-spin pi-spinner' : 'pi pi-file-export'
          " (click)="onExportExcel()" [disabled]="!hasPermission('320')" styleClass="p-2" />
        <p-fileUpload *ngIf="showExcelImport" #fileUpload styleClass="p-button-info" mode="basic" [chooseIcon]="
            exportExcelLoading ? 'pi pi-spin pi-spinner' : 'pi pi-file-import'
          " styleClass="p-2" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" severity="info"
          (onSelect)="onImportExcel($event)" [auto]="true" chooseLabel="Excel匯入" [disabled]="!hasPermission('130')" />
        <p-button *ngIf="showCustomExcelImport" severity="info" label="Excel匯入" [icon]="'pi pi-file-import'"
          (click)="onImportExcel()" [disabled]="!hasPermission('130')" styleClass="p-2" />
      </div>
      <p-dropdown *ngIf="showPage && IsPrint && data && data.length" [options]="pages" [ngModel]="selectedPage"
        optionValue="value" (onChange)="pageChange.emit($event.value)" appendTo="body" [virtualScroll]="true"
        [virtualScrollItemSize]="40" [filter]="true" />
    </div>
  </div>
  <ng-container *ngIf="exportLoading">
    <p-progressBar mode="indeterminate" [style]="{ height: '6px' }" />
  </ng-container>

  <app-export
      [visible]="exportDialog"
      header="列印選項"
      (visibleChange)="exportDialog = $event"
      [pageOrientation]="pageOrientation"
      [pageSizeSetting]="pageSizeSetting"
      [exportStatus]="exportStatus"
      (save)="exportStatus === 'PDF'
        ? exportPDFDownload($event, selectedColumns, undefined, footerData, expansionColumns)
        : exportExcelDownload($event, selectedColumns, undefined, footerData, expansionColumns)"
    ></app-export>
  `,
})
export class TableReportCaptionComponent implements OnChanges {
  @ViewChild('fileUpload') fileUpload!: FileUpload; // 檔案上傳 元件
  private readonly exportService = inject(ReportExportService, { optional: true });
  private readonly queryStateService = inject(QueryStateService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly currentPage = inject(CurrentPageService);
  private readonly systemDataService = inject(SystemDataService);
  IsPrint = true;
  exportLoading = false;
  toggleVisibility() {
    this.IsPrint = !this.IsPrint;
    this.cdr.detectChanges();
  }
  export(status: 'PDF' | 'Excel'): void {
    if (status === 'PDF') {
      this.exportStatus = 'PDF';
      this.exportDialog = true;
    } else if (status === 'Excel') {
      this.exportStatus = 'Excel';
      this.exportDialog = true;
    }
  }
  exportStatus: 'PDF' | 'Excel' = 'PDF';
  exportDialog = false;
  public funInfo?: FunsrightInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
  hasPermission(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(behavior => behavior.function_code === action) || false;
  }
  @Input() exportContext?: ExportContext;
  @Input() dataKey: string | undefined = 'ID';                  // table 資料key
  @Input() expansionDataKey = 'id';                             // 收合展開 資料key(expansion必需配置)
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>; // 屬性來接收父層傳來的載入函數
  @Input() expandedRows: Record<string, boolean> = {};          // 收合展開 已展開資料
  @Input() data: any[] = [];                                    // table 資料 (必填)
  @Input() columns!: ReportColumn[];                            // table 欄位配置 (必填)
  @Output() columnsEvent = new EventEmitter<ReportColumn[]>();  // table 欄位配置 (必填)
  @Input() selectedColumns!: ReportColumn[];                    // table 預設顯示欄位
  @Output() selectedColumnsEvent = new EventEmitter<ReportColumn[]>();// table 欄位配置 (必填)
  isColumnsInitialized = false;                                 // table 欄位是否初始化
  @Input() rowEditing = false;                                  // 是否正在編輯Row
  @Input() selectedItems: any = [];                             // table 已勾選資料
  @Input() tableKey: string | undefined = undefined;            // table 唯一標識 (必填)
  @Input() expansionColumns: ReportColumn[] = [];               // 收合展開 欄位配置(expansion必需配置)
  @Input() disabled = false;                                    // table 是否禁用
  // Header 相關
  @Input() showCaption = true;                // 是否顯示 Caption
  // Header(左) 相關
  @Input() showHeader = true;                 // 是否顯示 Header
  @Input() showFilter = true;                 // 是否顯示 Filter
  @Input() showReportMode = true;             // 是否顯示 匯出按鈕
  @Input() showReportPDF = true;             // 是否顯示 匯出PDF按鈕
  @Input() showReportExcel = true;             // 是否顯示 匯出Excel按鈕
  @Input() customReport = false;               // 是否自訂報表
  @Input() pageOrientation: string | null = 'Landscape';  // PDF橫式
  @Input() pageSizeSetting: string | null = 'A4';  // PDF A4
  @Output() exportEvent = new EventEmitter<string>(); // 自訂報表 事件
  @Input() showInsert = false;                // 是否顯示 Insert新增按鈕
  @Output() insert = new EventEmitter<any>(); // 新增事件
  @Input() insertDisabled = false;            // 新增按鈕是否禁用
  @Input() deleteData = false;                // 預先刪除資料 (關聯：需要加入dataKey, dataChange)
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  @Input() showDelete = true;                    // 是否顯示刪除按鈕
  @Input() deleteDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止刪除條件
  checkBatchDeleteDisabled(): boolean {
    if (!this.selectedItems || this.selectedItems.length === 0) return true;
    if (!this.deleteDisabled) return false;
    // 只要選中的資料中，有任何一筆符合「禁止刪除條件」，就禁用整批刪除按鈕
    return this.selectedItems.some((item: any) => this.deleteDisabled(item));
  }
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
  @Input() showPage = true;                        // 是否顯示 下拉選單分頁器
  @Input() totalPages = 0;                                   // 共幾頁數
  @Output() pageChange = new EventEmitter<number>();
  @Output() expandEvent = new EventEmitter<any>();
  @Input() pages: { label: string, value: number; }[] = [];   // (右上)下拉選單 頁數選項
  @Input() selectedPage: number | null = 1;                  // (右上)下拉選單 當前選擇的頁數
  @Input() totalRecords = 0;                                 // 記錄總數
  @Input() rows = 10;                                         // 每頁顯示的行數
  @Input() first = 0;                                        // 當前表格的起始索引
  @Input() footerData: any;     // (總計)頁尾資料
  constructor() {
    this.getProgNo();
  }
  getProgNo() {
    this.currentPage.currentPageProgNo$.subscribe(progNo => {
      if (progNo) {
        this.funInfo = this.systemDataService.getUserPermissions(progNo);
        this.tableKey = this.tableKey ? this.tableKey : progNo + 'TableQueryState';
      } else {
        this.funInfo = { PrivilegeBehavior: [] } as unknown as FunsrightInfo;
      }
    });
  }
  // 當 data 發生變化時，重置分頁與頁碼
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalRecords']) {
      setTimeout(() => {
        this.calculateTotalPages(); // 計算總頁數
      }, 300);
    }
    // 僅在 columns 首次被設定時執行初始化邏輯
    // 這樣就不會在每次 data 變動時都重置 filter 狀態
    if (changes['columns'] && this.columns && this.columns.length) {
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
            this.selectedColumns = this.columns.filter(col => col.visible !== false);// 沒有儲存的狀態，使用預設值
            this.selectedColumnsEvent.emit(this.selectedColumns);
            this.columnsEvent.emit(this.columns);
          }
          this.isColumnsInitialized = true;
        } else {
          this.selectedColumns = this.columns.filter(col => col.visible !== false);// 沒有儲存的狀態，使用預設值
          this.selectedColumnsEvent.emit(this.selectedColumns);
          this.columnsEvent.emit(this.columns);
        }
      }, 300);
    }
  }
  // 全收合的邏輯
  toggleExpandCollapse() {
    Object.keys(this.expandedRows).forEach(key => delete this.expandedRows[key]);
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
  onImportExcel(event?: FileSelectEvent) {                           // 匯入Excel
    this.importExcel.emit(event);
    if (event) {
      this.fileUpload.clear();
    }
  }

  exportPDFDownload(
    event: any,
    selectedColumns: any,
    printColumn?: any,
    footerData?: any,
    expansionColumns?: any
  ): void {
    if (this.exportService) {
      this.exportService.executePdfExport({
        event,
        columns: printColumn || selectedColumns, // 如果有特殊的 PrintColumn 則優先使用
        context: this.exportContext || {},
        footerData: footerData,
        expansionColumns: expansionColumns,
      }, (loading) => {
        this.exportLoading = loading;
        this.cdr.detectChanges();
      });
    }
  }

  exportExcelDownload(
    event: any,
    selectedColumns: any,
    printColumn?: any,
    footerData?: any,
    expansionColumns?: any
  ): void {
    if (this.exportService) {
      this.exportService.executeExcelExport({
        event,
        columns: printColumn || selectedColumns,
        context: this.exportContext || {},
        footerData: footerData,
        expansionColumns: expansionColumns,
      }, (loading) => {
        this.exportLoading = loading;
        this.cdr.detectChanges();
      });
    }
  }
}
