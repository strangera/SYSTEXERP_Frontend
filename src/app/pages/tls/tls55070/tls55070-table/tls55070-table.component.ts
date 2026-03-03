/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

import {
  Table,
  TableModule,
} from 'primeng/table';

import {
  Column,
  LazyLoadEvent
} from './tls55070-table.model';

import {
  FileSelectEvent,
  FileUpload,
  FileUploadModule,
} from 'primeng/fileupload';
import { Subject, takeUntil } from 'rxjs';

import { DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BasicPrintData2Component } from '@shared/componentextends/basic-print/basic-print-data2.component';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { TLS55070TableExportComponent } from './tls55070-table-export/tls55070-table-export.component';

export interface RowButton {
  icon: string;
  label: string;
  severity?: string;
  text?: boolean;
}

@Component({
  selector: 'app-tls55070-table',
  templateUrl: './tls55070-table.component.html',
  styleUrls: ['./tls55070-table.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    NgFor,
    DividerModule,
    TableModule,
    MultiSelectModule,
    TooltipModule,
    ButtonModule,
    FileUploadModule,
    DropdownModule,
    RippleModule,
    InputTextModule,
    InputNumberModule,
    CalendarModule,
    CheckboxModule,
    SkeletonModule,
    BlockUIModule,
    FormsModule,
    TLS55070TableExportComponent,
    DecimalPipe
  ],
})
export class TLS55070TableComponent extends BasicPrintData2Component implements OnInit, OnChanges, OnDestroy {
  /** ===== Utilities ===== */
  trackByCol = (_: number, col: any) => col.key ?? col.__uid ?? col.field;
  trackByRow = (_: number, item: any) => (item as any)?.[this.dataKey] ?? _;
  @ViewChild('dt', { static: false }) dt?: Table;
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  private ngUnsubscribe = new Subject<void>();
  public funInfo: FunsrightInfo | undefined;
  constructor() {
    super();
    this.onScroll = this.onScroll.bind(this);
  }
  /* ======================= Inputs / Outputs ======================= */
  /** 基本 */
  @Input() dataKey = 'ID';
  @Input() tableKey?: string;
  @Input() apiUrl?: string;
  @Input() title?: string;
  /** 一次後端回傳的筆數（pageSize），預設 30 */
  @Input() pageSize = 30;
  /** 欄位 / 資料 */
  private _columns: Column[] = [];
  @Input() set columns(v: Column[]) {
    this._columns = Array.isArray(v) ? v : [];
    this.originalColumns = this._columns;
    // 一進來就把可見欄位塞進 selectedColumns，header 才有東西
    this.selectedColumns = this._columns.filter(c => c.visible !== false && c.hidden !== true);
  }
  get columns(): Column[] {
    return this._columns;
  }
  originalColumns!: Column[];
  selectedColumns: Column[] = [];
  private _data: any[] = [];
  @Input() set data(v: any[]) {
    this._data = Array.isArray(v) ? v : [];
    this.rebuildGroupMeta();
  }
  get data(): any[] { return this._data; }
  @Input() loading = false;
  @Input() disabled = false;
  /** 總筆數（第一次查詢後，從父層塞進來） */
  @Input() totalRecords = 0;
  /** 群組（僅序號 + rowspan） */
  @Input() groupKey = 'TXN_SaleNoteNo';           // 父層可以改成 '_grp' 或任何欄位
  @Input() groupRowsBy: string | string[] = '';           // 排序優先的群組欄位（可不使用）
  /** 需要直向合併的欄位 */
  @Input() mergedColumns: string[] = [];
  get hasRowSpan(): boolean {
    return Array.isArray(this.mergedColumns) && this.mergedColumns.length > 0;
  }
  // Header 顯示
  @Input() showCaption = true;
  @Input() showHeader = true;
  @Input() showReportMode = true;
  // Excel / 匯出（範本、匯入）
  @Input() showExcel = false;
  @Input() showExcelExport = true;
  @Input() showExcelImport = true;
  @Input() showCustomExcelImport = false;
  @Output() exportExcel = new EventEmitter<any>();
  @Input() exportExcelLoading = false;
  @Output() importExcel = new EventEmitter<FileSelectEvent>();
  // 🔹 外層「匯出銷售明細」兩顆主按鈕
  @Input() showMainExportButtons = false;
  @Input() mainExcelLoading = false;
  @Input() mainPdfLoading = false;
  @Output() mainExcelExport = new EventEmitter<void>();
  @Output() mainPdfExport = new EventEmitter<void>();
  // Footer / 其他
  @Input() showTotal = false;
  /** 後端回來的總計：{ 欄位名稱: 數值 } */
  @Input() totals: Record<string, number> = {};
  /** Lazy 取數：改成「往下捲時」丟給父層（父層自行打 API + append） */
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();
  /** 兼容父層原本的綁定，不實際使用 */
  @Input() lazy = false;
  /** 取得 footer 總計：優先吃 this.totals[col.field]；沒有就用前端加總（排除 __isTotal / __isSubRow） */
  getFooterTotal(field: string): number {
    if (this.totals && Object.prototype.hasOwnProperty.call(this.totals, field)) {
      const v = this.totals[field];
      return typeof v === 'number' ? v : Number(v || 0);
    }
    return (this.data || [])
      .filter(r => !r?.__isTotal && !r?.__isSubRow)
      .reduce((sum, r) => sum + Number(r?.[field] || 0), 0);
  }

  /* ===== 內部旗標：群組 meta ===== */

  /**
   * groupMeta:
   *  key: 群組鍵（依 groupKey）
   *  value: { start: 第一次出現的 index, size: 筆數, index: 第幾組（1-based） }
   */
  private groupMeta: Record<string, { start: number; size: number; index: number }> = {};

  /* ======================= LifeCycle ======================= */

  ngOnInit(): void {
    // 權限（原本 BasicPrintData2 有 currentPage / systemDataService）
    this.currentPage.currentPageProgNo$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(progNo => {
      this.funInfo = progNo ? this.systemDataService.getUserPermissions(progNo) : undefined;
    });
    this.rebuildGroupMeta();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.rebuildGroupMeta();
      this.cdr.detectChanges?.();
      if (this.data.length > 0 && this.dt) {
        if (this.data.length > 30) {
          this.dt.scrollHeight = '500px';
          this.dt.virtualScroll = true;
        } else {
          this.dt.scrollHeight = 'flex';
          this.dt.virtualScroll = false;
        }
      } else {
        this.dt!.scrollHeight = 'flex';
        this.dt!.virtualScroll = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /* ======================= 群組 / RowSpan ======================= */

  /** 統一的群組鍵生成（含空值處理） */
  private buildGroupKey(raw: any, rowIndex: number): string {
    return (raw !== undefined && raw !== null && String(raw) !== '')
      ? String(raw)
      : `__row_${rowIndex}`;
  }

  private getGlobalIndex(localIndex: number): number {
    const first = (this.dt?.first as number) ?? 0;
    return first + localIndex;
  }
  /** 重新依「全部資料」建立群組 meta（沒有分頁概念） */
  private rebuildGroupMeta(): void {
    const rows = this.data || [];
    const meta: Record<string, { start: number; size: number; index: number }> = {};

    let lastKey: string | null = null;
    let groupIndex = 0;

    rows.forEach((row, i) => {
      // 小計列直接略過，不參與群組序號與 rowspan 計算
      if (row && row.__isSubRow) {
        return;
      }

      const key = this.buildGroupKey(row?.[this.groupKey], i);
      if (key === lastKey) {
        meta[key].size++;
      } else {
        groupIndex++;
        meta[key] = { start: i, size: 1, index: groupIndex };
        lastKey = key;
      }
    });

    this.groupMeta = meta;
  }


  /** 樣板用：取得群組鍵（用 index 當 fallback） */
  /** 樣板用：取得群組鍵（用「全表 index」當 fallback key） */
  getGroupKeyValue(rowData: any, rowIndex: number): string {
    const globalIndex = this.getGlobalIndex(rowIndex);
    return this.buildGroupKey(rowData?.[this.groupKey], globalIndex);
  }

  /** 判斷是不是該群組的首列（用「全表 index」跟 meta 比） */
  isFirstInGroup(rowIndex: number, key: string): boolean {
    if (!this.hasRowSpan && this.groupKey === '') return false;

    const globalIndex = this.getGlobalIndex(rowIndex);
    const m = this.groupMeta[key];
    return !!m && m.start === globalIndex;
  }

  /** rowSpan 只跟群組 size 有關，不用 rowIndex */
  getPageRowSpan(_rowIndex: number, key: string): number {
    const m = this.groupMeta[key];
    return m ? m.size : 1;
  }

  /** 顯示用的群組序號（16、17、18…） */
  getGroupDisplayIndex(rowIndex: number, rowData: any): number {
    const key = this.getGroupKeyValue(rowData, rowIndex);
    const m = this.groupMeta[key];
    const globalIndex = this.getGlobalIndex(rowIndex);
    return m ? m.index : (globalIndex + 1);
  }
  /* ======================= 匯出 ======================= */
  onExportExcel() {
    this.exportExcel.emit();
  }
  onImportExcel(event?: FileSelectEvent) {
    this.importExcel.emit(event);
    if (event) this.fileUpload?.clear();
  }
  export(type: 'PDF' | 'Excel'): void {
    this.exportStatus = type;
    this.exportDialog = true;
  }
  hasPermission(action: string): boolean {
    return this.funInfo?.PrivilegeBehavior?.some(b => b.function_code === action) || false;
  }
  /* ======================= Infinite Scroll：往下捲打 API ======================= */
  onScroll(event: any) {
    if (!event || !event.originalEvent || !event.originalEvent.target) return;
    if (this.loading) return;
    if (!this.totalRecords || this.data.length >= this.totalRecords) return;

    if (this.data.length < this.pageSize) return;

    const target = event.originalEvent.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    const threshold = 2; // 容錯 2px

    if (scrollHeight - scrollTop - clientHeight <= threshold) {
      this.loadMoreData();
    }
  }

  private loadMoreData() {
    const pageSize = this.pageSize || 20;
    const currentLength = this.data.length;
    if (!pageSize || currentLength >= this.totalRecords) return;
    const nextPageIndex = Math.floor(currentLength / pageSize) + 1;
    const sort = [{ field: this.dataKey, order: 1 }];
    const payload: LazyLoadEvent = {
      pageIndex: nextPageIndex,
      pageSize,
      SortBy: sort,
    };
    this.lazyLoadData.emit(payload);
  }

  /* ======================= 樣板輔助 ======================= */

  /** 依欄名長度估算最小寬度，避免標題擠在一起 */
  getColMinWidth(col: any): string {
    const text = (col?.header ?? '').toString();
    const len = [...text].length;
    const ch = Math.max(6, Math.min(40, len + 2));
    return `calc(${ch}ch + 1.25rem)`;
  }

  /** 現在可視欄位（selectedColumns > columns），排除 hidden/visible=false */
  private get visibleCols() {
    const cols = this.selectedColumns?.length ? this.selectedColumns : this.columns || [];
    return cols.filter(c => c.visible !== false && c.hidden !== true);
  }

  /** 左側固定欄（如果有 frozen） */
  get leftFixedHeaderColumns() {
    return this.visibleCols.filter(c => c.frozen === true);
  }

  /** 非 frozen 欄位 */
  get headerRow1Columns() {
    return this.visibleCols.filter(c => c.frozen !== true);
  }

  getSortField(col: any): string {
    return (col?.sortField || col?.field || '').toString();
  }

  /** 小計列顯示用：直接掃 this.data，把同一組的 TXN_SaleAmt 加總 */
  /** 小計列顯示用：直接用該列自己的 TXN_SaleAmt */
  formatSubtotal(rowData: any): string {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
      .format(Number(rowData?.SumTXN_SaleAmt ?? 0));
  }

  /** 小計列 debug：log 一路看值變成什麼 */
  debugSubtotal(rowData: any): number {
    // 你想用哪個當小計，先挑一個回來
    let v = rowData?.SumTXN_SaleAmt ?? rowData?.TXN_SaleAmt ?? 0;
    // 如果可能有 "1,350" 這種字串，可以加這段再轉一次
    if (typeof v === 'string') {
      const pure = v.replace(/,/g, '');
      const n = Number(pure);
      console.log('string value -> pure =', pure, 'number =', n);
      v = isNaN(n) ? 0 : n;
    }
    return Number(v ?? 0);
  }
  /** 小計顯示：同一張銷售單號的 TXN_SaleAmt 加總 */
  getSubtotalValue(rowData: any): number {
    if (!rowData) return 0;

    // 如果這是小計列，優先使用後端傳來的 SumTXN_SaleAmt（已經是該組的小計）
    if (rowData.__isSubRow && (rowData.SumTXN_SaleAmt !== undefined && rowData.SumTXN_SaleAmt !== null)) {
      const raw = rowData.SumTXN_SaleAmt;
      let n: number;

      if (typeof raw === 'string') {
        const cleaned = raw.replace(/,/g, '');
        n = Number(cleaned);
      } else {
        n = Number(raw ?? 0);
      }

      return isFinite(n) ? n : 0;
    }

    // 這一列代表哪一張銷售單：
    // 小計列本身 TXN_SaleNoteNo 是空字串，我們在 unpack 時有塞 _grpBase = 原本的群組 key
    const saleNo = rowData.TXN_SaleNoteNo || rowData._grpBase;
    if (saleNo) {
      const sum = (this.data || [])
        .filter(r =>
          !r?.__isSubRow &&                           // 排除小計列
          (r?.TXN_SaleNoteNo === saleNo || r?._grpBase === saleNo)
        )
        .reduce((acc, r) => acc + Number(r?.TXN_SaleAmt ?? 0), 0);

      return Number.isFinite(sum) ? sum : 0;
    }

    // 沒有 saleNo（理論上不會發生），退回舊邏輯
    const raw = rowData.SumTXN_SaleAmt ?? rowData.TXN_SaleAmt ?? 0;
    let n: number;

    if (typeof raw === 'string') {
      const cleaned = raw.replace(/,/g, '');
      n = Number(cleaned);
    } else {
      n = Number(raw ?? 0);
    }

    if (!isFinite(n)) n = 0;
    return n;
  }


}
