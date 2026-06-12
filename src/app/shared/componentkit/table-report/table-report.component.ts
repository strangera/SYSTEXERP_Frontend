/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { ExportContext } from '../../exports/report-export.service';
import { QueryStateService } from '../../service/query-state.service';
import { TableReportCaptionComponent } from './components/table-report-caption/table-report-caption.component';
import { TableExpansionComponent } from './components/table-report-expansion/table-report-expansion.component';
import { TableReportDragDropService } from './services/table-report-drag-drop.service';
import { TableReportPermissionService } from './services/table-report-permission.service'; // 新增
import { TableReportSelectionService } from './services/table-report-selection.service';
import { TableReportSubtotalService } from './services/table-report-subtotal.service';
import { TableReportUtilityService } from './services/table-report-utility.service';
import { TableReportWidthService } from './services/table-report-width.service';
import { AddButton, ColumnGroup, ReportColumn, TableQueryPayload } from './table-report.model';

@UntilDestroy()
@Component({
  selector: 'app-table-report',
  host: { 'table-report-id': '複製時請自行取唯一名' },
  standalone: true,
  imports: [TableExpansionComponent, SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableReportCaptionComponent],
  templateUrl: './table-report.component.html',
  styleUrls: ['./table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    TableReportWidthService,
    TableReportSelectionService,
    TableReportDragDropService,
    TableReportSubtotalService,
    TableReportPermissionService // 注入權限分類服務
  ]
})
export class TableReportComponent implements OnChanges {
  @ViewChild('dt') public readonly dt!: Table;

  // 專業服務注入鏈
  public readonly tableUtility = inject(TableReportUtilityService);
  public readonly widthService = inject(TableReportWidthService);
  public readonly selectionService = inject(TableReportSelectionService);
  public readonly dragDropService = inject(TableReportDragDropService);
  public readonly subtotalService = inject(TableReportSubtotalService);
  public readonly permissionService = inject(TableReportPermissionService); // 新增
  public readonly sanitizer = inject(DomSanitizer);

  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly queryState = inject(QueryStateService);

  // Inputs & Outputs 宣告
  @Input() exportContext?: ExportContext;
  @Input() pageOrientation: string | null = 'Landscape';
  @Input() pageSizeSetting: string | null = 'A4';
  @Input() lastQueryBody?: any;
  @Input({ required: true }) totalRecords = 0;
  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];
  @Input() queryFunction?: (body: any) => Observable<any>;

  virtualData: any = [];
  @Input() ItemSize = 46;
  @Input() lazy = true;
  @Input() dataKey: string | undefined;
  selectedColumns: ReportColumn[] = [];

  @Input() tableKey = this.route.snapshot.url.at(-1)!.path;
  @Input() loading = false;
  public _loading = false;
  @Input() showReorder = true;
  @Input() showCheckBox = false;
  @Input() tableHeaderCheckboxLabel?: string;
  @Input() set selectedItems(val: any[]) {
    // 如果內部服務的已選取筆數跟外部傳入的一模一樣，代表是自己人觸發的更新，直接擋掉，不重複往下算！
    if (this.selectionService.selectedItems && val && this.selectionService.selectedItems.length === val.length) {
      return;
    }
    this.selectionService.syncSelectedItems(val || [], this.data, this.isRowSelectable);
  }
  get selectedItems(): any[] { return this.selectionService.selectedItems; }
  @Output() get selectionChange() { return this.selectionService.selectionChange; }
  @Output() get selectAllChange() { return this.selectionService.selectAllChange; }
  @Output() itemClick = new EventEmitter<any>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;

  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => this.isRowSelectable(data);

  @Input() set isAllSelected(val: boolean) { this.selectionService.isAllSelected = val; }
  get isAllSelected(): boolean { return this.selectionService.isAllSelected; }

  @Output() dataChange = new EventEmitter<any[]>();
  @Input() customTemplates: Record<string, TemplateRef<any>> = {};
  @Input() showCaption = true;
  @Input() showSort = true;

  public get multiSortMeta() { return this.dt?.multiSortMeta || []; }
  private isSyncingSort = false;
  @Input() allowMultilineHeader = false;
  @Input() showFilter = true;
  @Input() showReportMode = true;
  @Input() customReport = false;
  @Output() exportEvent = new EventEmitter<string>();
  @Output() delete = new EventEmitter<any>();
  @Input() showDelete = true;
  @Input() deleteDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() showExcel = false;
  @Input() showExcelExport = true;
  @Input() showExcelImport = true;
  @Input() showCustomExcelImport = false;
  @Output() exportExcel = new EventEmitter<any>();
  @Input() exportExcelLoading = false;
  @Output() importExcel = new EventEmitter<FileSelectEvent>();
  @Input() columnGroup?: ColumnGroup[];
  @Input() showManage = true;
  @Input() showDetail = true;
  @Output() detail = new EventEmitter<any>();
  @Input() showEdit = true;
  @Input() editTooltip: string | ((rowData: any) => string) = '編輯';
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() detailDisabled: (rowData: any) => boolean | undefined = () => false;
  @Output() edit = new EventEmitter<any>();
  @Input() addButton: AddButton[] = [];
  @Input() buttonsLoading = false;
  @Input() footerData: any;
  @Input() footerPercentData: any;
  @Input() extraFooterData: any;
  @Input() groupRowsBy?: string;
  @Input() subTotalLabel = '小計';
  @Input() showSubTotalGroupValue = true;

  // 代理小計快取
  get groupTotals() { return this.subtotalService.groupTotals; }
  set groupTotals(val) { this.subtotalService.groupTotals = val; }

  @Input() subTotalData: any;
  @Output() selectButton = new EventEmitter<any>();
  @Input() showSummary = true;
  @Input() footerLabel = '總計';
  @Input() footerLabelField?: string;
  @Input() autoHeight = false;
  @Input() showFooterTotal = true;
  @Input() allowFooterHtml = false;
  @Input() expansionColumns: ReportColumn[] = [];
  @Input() expansionDataKey = 'details';
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
  @Input() expansionShowSort = true;
  @Input() expansionShowReorder = true;
  expandedRows: Record<string, boolean> = {};
  private isNextPagePreloaded = false;
  @Output() linkClick = new EventEmitter<{ rowData: any, field: string }>();
  @Input() emptyMessage = '查無資料';

  public hasSearched = false;

  constructor() {
    this.permissionService.initPermission(this.tableKey, (newKey) => {
      this.tableKey = newKey;
    });
    this.onScroll = this.onScroll.bind(this);
  }

  // 權限傳聲筒
  hasPermission(action: string): boolean {
    return this.permissionService.hasPermission(action);
  }

  get footerRows(): any[] {
    if (this.footerData == null) return [];
    return Array.isArray(this.footerData) ? this.footerData : [this.footerData];
  }

  public get serialColumnWidth(): string {
    return this.widthService.serialColumnWidth;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['totalRecords']) {
      this.handleDataChange(changes);
    }
  }

  /**
   * 核心視圖資料配給大腦
   */
  private handleDataChange(changes: SimpleChanges) {
    if (this.lastQueryBody) {
      this.hasSearched = true;
    }

    if (changes['data']) {
      this.selectionService.reset();
      this.virtualData = [];
      this.subtotalService.clearGroupTotals();
      this.subtotalService.updateGroupTotals(this.data, this.columns, this.groupRowsBy);
      this.isNextPagePreloaded = false;
    }

    if (this.data && this.data.length > 0 && this.columns && this.columns.length > 0) {
      this.columns = this.widthService.calculateAndFixColumnWidths(
        this.columns, this.data, this.totalRecords, this.showReorder
      );
    }

    // 封裝後的 PrimeNG 視圖狀態與虛擬滾動分配邏輯
    if (this.data && this.data.length !== 0) {
      if (this.dt) {
        this.dt.virtualScroll = false;
        setTimeout(() => this.syncTableSortMeta());
      }
      this.cdr.detectChanges();

      const pageSize = this.lastQueryBody?.pageSize || 30;
      this.dt.scrollHeight = this.autoHeight ? (undefined as any) : '700px';

      if (this.data.length < pageSize) {
        this.virtualData = this.data;
        this.dt.virtualScroll = false;
      } else {
        this.dt.virtualScroll = true;
        this.virtualData = Array.from({ length: this.data.length });
        this.cdr.detectChanges();
        this.virtualData = this.data;
      }
    }
  }
  // --- 轉發各分類服務事件門 ---

  getGroupSubtotal(rowData: any, col: ReportColumn): any {
    return this.subtotalService.getGroupSubtotal(rowData, col, this.columns, this.groupRowsBy, this.subTotalData);
  }

  updateGroupTotals(newData: any[]): void {
    this.subtotalService.updateGroupTotals(newData, this.columns, this.groupRowsBy);
  }

  onSelectionChange(event: any[]) {
    this.selectionService.handleSelectionChange(event, this.data, this.isRowSelectable);
  }

  onSelectAllChange(event: TableSelectAllChangeEvent) {
    this.selectionService.handleSelectAllChange(event, this.data, this.isRowSelectable);
  }

  onLazyLoad() {
    this.selectionService.handleLazyLoadSelection(this.data, this.isRowSelectable);
  }

  public onCustomDragStart(event: DragEvent, col: ReportColumn, index: number) {
    this.dragDropService.handleDragStart(event, col, index);
  }

  public onCustomDragOver(event: DragEvent, targetCol: ReportColumn) {
    this.dragDropService.handleDragOver(event, targetCol);
  }

  public onCustomDrop(event: DragEvent, targetCol: ReportColumn, targetIndex: number) {
    this.columns = this.dragDropService.handleDrop(
      event, targetCol, targetIndex, this.columns, this.tableKey, this.queryState
    );
    this.cdr.detectChanges();
  }

  // --- 後端 API 分頁、排序加載核心邏輯 ---

  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) return;
    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    const currentSort = this.dt?.multiSortMeta;
    if (currentSort) this.lastQueryBody.SortBy = currentSort;

    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize,
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };
    this._loading = true;
    this.queryFunction(body)
      .pipe(untilDestroyed(this), finalize(() => (this._loading = false)))
      .subscribe(res => {
        if (res?.Data && res.Data.length > 0) {
          this.virtualData = Array.from({ length: this.data.length + res.Data.length });
          this.subtotalService.updateGroupTotals(res.Data, this.columns, this.groupRowsBy);
          this.cdr.detectChanges();
          this.data = [...this.data, ...res.Data];
          this.syncTableSortMeta();
          this.dataChange.emit(this.data);
          this.virtualData = this.data;
          this.totalRecords = res.TotalCount || this.data.length;
        }
        this.isNextPagePreloaded = false;
      });
  }

  onSort(event: any) {
    if (!this.lazy) {
      this.subtotalService.clearGroupTotals();
      this.subtotalService.updateGroupTotals(this.data, this.columns, this.groupRowsBy);
      this.cdr.detectChanges();
      return;
    }
    if (this.isSyncingSort || this._loading) return;
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      this.dt.multiSortMeta = [event.multiSortMeta[event.multiSortMeta.length - 1]];
    }
    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    if (!this.queryFunction || !this.lastQueryBody || !this.showSort) return;

    this.lastQueryBody = { ...this.lastQueryBody, pageIndex: 1, pageSize, SortBy: this.dt.multiSortMeta };
    const body = { ...this.lastQueryBody, pageIndex: 1, pageSize, SortBy: this.dt.multiSortMeta ?? undefined };
    this.loading = true;

    this.queryFunction(body)
      .pipe(untilDestroyed(this), finalize(() => (this.loading = false)))
      .subscribe(res => {
        this.hasSearched = true;
        if (res?.Data && res.Data.length > 0) {
          this.virtualData = [];
          this.dt.virtualScroll = false;
          this.subtotalService.clearGroupTotals();
          this.subtotalService.updateGroupTotals(res.Data, this.columns, this.groupRowsBy);
          this.data = res.Data;
          this.isNextPagePreloaded = false;
          this.syncTableSortMeta();
          this.cdr.detectChanges();

          if (res.Data.length < pageSize) {
            this.virtualData = this.data;
            this.dt.virtualScroll = false;
          } else {
            this.dt.virtualScroll = true;
            this.virtualData = Array.from({ length: res.Data.length });
            this.cdr.detectChanges();
            this.virtualData = this.data;
          }
          this.selectedItems = [];
          this.dataChange.emit(this.data);
        }
      });
  }

  customSort(event: TableQueryPayload) {
    if (!event.multiSortMeta) return;
    this.data.sort((data1, data2) => {
      for (const sortMeta of event.multiSortMeta) {
        const value1 = data1[sortMeta.field];
        const value2 = data2[sortMeta.field];
        let result = 0;
        if (value1 == null && value2 != null) result = -1;
        else if (value1 != null && value2 == null) result = 1;
        else if (value1 == null && value2 == null) result = 0;
        else if (typeof value1 === 'string' && typeof value2 === 'string')
          result = value1.localeCompare(value2, undefined, { numeric: true, sensitivity: 'base' });
        else result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
        if (result !== 0) return sortMeta.order * result;
      }
      return 0;
    });
    if (this.selectedItems && this.selectedItems.length > 0) this.selectedItems = [...this.selectedItems];
    this.subtotalService.clearGroupTotals();
    this.subtotalService.updateGroupTotals(this.data, this.columns, this.groupRowsBy);
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.dt) this.dt.restoreState();
      this.cdr.detectChanges();
    }, 0);
  }

  onScroll(event: any) {
    if (this._loading || !this.lazy) return;
    const target = event.originalEvent?.target;
    if (!target) return;
    const pageSize = this.lastQueryBody?.pageSize ?? this.lastQueryBody?.PageSize ?? 30;
    if (this.data.length >= pageSize && this.data.length < this.totalRecords) {
      if (!this.isNextPagePreloaded && target.scrollTop > 50) {
        this.isNextPagePreloaded = true;
        this.loadMoreData();
      }
    } else if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems = [...this.selectedItems];
      this.cdr.detectChanges();
    }
    this.cdr.markForCheck();
  }

  trackByFn(index: number, item: any) {
    return (this.dataKey && item?.[this.dataKey]) || index;
  }

  getGroupHeader(groupField: string): string {
    return this.columnGroup?.find(g => g.field === groupField)?.header ?? groupField;
  }

  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as ReportColumn[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  hasSubtotalColumns(): boolean {
    return this.columns.some(col => col.isSubTotal && this.groupRowsBy);
  }

  isGroupLastRow(rowData: any, rowIndex: number): boolean {
    if (!this.groupRowsBy || !this.data || rowIndex === this.data.length - 1) return true;
    return this.tableUtility.isGroupLastRow(rowData, rowIndex, this.groupRowsBy, this.data);
  }

  private syncTableSortMeta() {
    if (!this.dt || !this.lastQueryBody?.SortBy) return;
    this.isSyncingSort = true;
    const sortBy = this.lastQueryBody.SortBy;
    const meta = Array.isArray(sortBy) ? [...sortBy] : [sortBy];
    this.dt.multiSortMeta = meta.map(m => ({ field: m.field || m.Field, order: m.order || m.Order }));
    setTimeout(() => {
      this.dt.tableService.onSort(this.dt.multiSortMeta || []);
      this.cdr.detectChanges();
      this.isSyncingSort = false;
    }, 0);
  }

  private normalizeQueryBody(body: any) {
    if (!body) return body;
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const { PageSize, PageIndex, ...rest } = body;
    return { ...rest, pageSize, pageIndex, PageSize, PageIndex };
  }

  getBtnLabel(btn: any, rowData: any): string {
    return typeof btn.label === 'function' ? btn.label(rowData) : btn.label;
  }

  getEditTooltip(rowData: any): string {
    return typeof this.editTooltip === 'function' ? this.editTooltip(rowData) : this.editTooltip;
  }
}
