/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { TableCaptionComponent } from '../table/table-caption/table-caption.component';
import { TableExpansionComponent } from '../table/table-expansion/table-expansion.component';
import { TableReportUtilityService } from '../table-report/table-report-utility.service';
import { AddButton, expandAnimation, ReportColumn, TableQueryPayload } from '../table-report/table-report.model';

export interface Ass17030DeptHeader {
  key: string;
  name: string;
}

@Component({
  selector: 'app-ass17030-table-report',
  host: { 'table-report-id': 'ass17030-table-report' },
  standalone: true,
  imports: [
    TableExpansionComponent,
    SkeletonModule,
    TableModule,
    CommonModule,
    ImageModule,
    ButtonModule,
    TooltipModule,
    MultiSelectModule,
    FormsModule,
    TableCaptionComponent,
  ],
  templateUrl: './ass17030-table-report.component.html',
  styleUrls: ['./ass17030-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandAnimation],
})
export class Ass17030TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input() lastQueryBody?: any;
  @Input({ required: true }) totalRecords = 0;
  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];
  @Input() queryFunction?: (body: any) => Observable<any>;
  @Input() deptHeaders: Ass17030DeptHeader[] = [];
  @Input() topGroupHeader = '單位領用數量';
  virtualData: any = [];
  @Input() lazy = true;
  @Input() dataKey: string | undefined;
  selectedColumns: ReportColumn[] = [];
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  @Input() loading = false;
  public _loading = false;
  @Input() showReorder = true;
  @Input() showCheckBox = false;
  @Input() tableHeaderCheckboxLabel?: string;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Output() itemClick = new EventEmitter<any>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  rowSelectableWrapper = ({ data }: { data: any; index: number }): boolean | undefined => {
    return this.isRowSelectable(data);
  };
  @Input() isAllSelected = false;
  @Output() dataChange = new EventEmitter<any[]>();
  @Input() customTemplates: Record<string, TemplateRef<any>> = {};
  @Input() showCaption = true;
  @Input() showSort = true;
  public get multiSortMeta() {
    return this.dt?.multiSortMeta || [];
  }
  @Input() allowMultilineHeader = false;
  @Input() showFilter = true;
  @Input() showReportMode = true;
  @Input() customReport = false;
  @Input() pageOrientation: string | null = 'Landscape';
  @Input() pageSizeSetting: string | null = 'A4';
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
  @Input() showManage = true;
  @Input() showDetail = true;
  @Output() detail = new EventEmitter<any>();
  @Input() showEdit = true;
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() detailDisabled: (rowData: any) => boolean | undefined = () => false;
  @Output() edit = new EventEmitter<any>();
  @Input() addButton: AddButton[] = [];
  @Input() buttonsLoading = false;
  @Input() footerData: any;
  @Input() groupRowsBy?: string;
  @Input() subTotalLabel = '小計';
  groupTotals: Record<string, Record<string, number>> = {};
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
  @Output() linkClick = new EventEmitter<{ rowData: any; field: string }>();
  @Input() apiUrl?: string;
  @Input() DataKeyName?: string;
  @Input() Conditions?: any;
  @Input() PrintRemark = true;
  @Input() emptyMessage = '查無資料';

  constructor(
    public readonly tableUtility: TableReportUtilityService,
    public readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }

  get footerRows(): any[] {
    if (this.footerData == null) return [];
    return Array.isArray(this.footerData) ? this.footerData : [this.footerData];
  }

  get leadingColumns(): ReportColumn[] {
    return this.columns.filter(
      col =>
        !col.field.startsWith('dept_') &&
        col.field !== 'TotalQty' &&
        col.field !== 'TotalAmt',
    );
  }

  get trailingColumns(): ReportColumn[] {
    return this.columns.filter(
      col =>
        !col.field.startsWith('dept_') &&
        (col.field === 'TotalQty' || col.field === 'TotalAmt'),
    );
  }

  get hasThreeLevelHeader(): boolean {
    return this.deptHeaders.length > 0;
  }

  getDeptQtyField(key: string): string {
    return `dept_${key}_qty`;
  }

  getDeptAmtField(key: string): string {
    return `dept_${key}_amt`;
  }

  getColByField(field: string): ReportColumn | undefined {
    return this.columns.find(c => c.field === field);
  }

  formatCell(rowData: any, col?: ReportColumn, rowIndex?: number): any {
    if (!col) return '';
    return col.format ? col.format(rowData?.[col.field], rowIndex, rowData) : rowData?.[col.field];
  }

  public hasSearched = false;
  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns']) {
      this.selectedColumns = [...this.columns];
    }
    if (changes['data']) {
      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      this.isAllSelected = false;
      this.selectedItems = [];
      this.virtualData = [];
      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
          setTimeout(() => {
            this.syncTableSortMeta();
          });
        }
        this.cdr.detectChanges();
        if (this.data.length < (this.lastQueryBody?.pageSize || 30)) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? (undefined as any) : '450px';
        } else {
          if (this.data.length === this.totalRecords) {
            this.dt.lazy = false;
          }
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = this.autoHeight ? (undefined as any) : '450px';
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }

  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) return;
    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    const currentSort = this.dt?.multiSortMeta;
    if (currentSort) {
      this.lastQueryBody.SortBy = currentSort;
    }
    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize,
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined),
    };
    this._loading = true;
    this.queryFunction(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this._loading = false)),
      )
      .subscribe(res => {
        if (res && res.Data && res.Data.length > 0) {
          this.virtualData = Array.from({ length: this.data.length + res.Data.length });
          this.cdr.detectChanges();
          this.data = [...this.data, ...res.Data];
          this.syncTableSortMeta();
          this.dataChange.emit(this.data);
          this.virtualData = this.data;
          this.totalRecords = res.TotalCount || this.data.length;
        }
      });
  }

  onSort(event: any) {
    if (!this.lazy) return;
    if (this._loading) return;
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      const lastSort = event.multiSortMeta[event.multiSortMeta.length - 1];
      this.dt.multiSortMeta = [lastSort];
    }
    this.lastQueryBody = this.normalizeQueryBody(this.lastQueryBody);
    const { pageSize } = this.lastQueryBody;
    if (!this.queryFunction || !this.lastQueryBody || !this.showSort) return;
    this.lastQueryBody = {
      ...this.lastQueryBody,
      pageIndex: 1,
      pageSize,
      SortBy: this.dt.multiSortMeta,
    };
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1,
      pageSize,
      SortBy: this.dt.multiSortMeta ?? undefined,
    };
    this.loading = true;
    this.queryFunction(body)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.loading = false)),
      )
      .subscribe(res => {
        this.hasSearched = true;
        if (res && res.Data && res.Data.length > 0) {
          this.virtualData = [];
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? (undefined as any) : '450px';
          this.data = res.Data;
          this.syncTableSortMeta();
          this.cdr.detectChanges();
          if (res.Data.length < pageSize) {
            this.data = res.Data;
            this.virtualData = this.data;
            this.dt.virtualScroll = false;
            this.dt.scrollHeight = this.autoHeight ? (undefined as any) : '450px';
          } else {
            this.dt.virtualScroll = true;
            this.dt.scrollHeight = this.autoHeight ? (undefined as any) : '450px';
            this.virtualData = Array.from({ length: res.Data.length });
            this.data = res.Data;
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
      for (const sortMeta of event.multiSortMeta!) {
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
    if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems = [...this.selectedItems];
    }
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.dt) this.dt.restoreState();
      this.cdr.detectChanges();
    }, 0);
  }

  onLazyLoad() {
    if (this.isAllSelected) {
      this.selectedItems = this.data.filter(rowData => {
        const selectable = this.isRowSelectable(rowData);
        return selectable === undefined ? true : selectable;
      });
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(true);
    } else {
      this.selectedItems = [...this.selectedItems];
      this.selectionChange.emit(this.selectedItems);
      this.selectAllChange.emit(false);
    }
  }

  onScroll(event: any) {
    if (this._loading) return;
    if (this.lazy) {
      const target = event.originalEvent.target;
      const pageSize = this.lastQueryBody?.pageSize ?? this.lastQueryBody?.PageSize ?? 30;
      if (this.data.length < this.totalRecords && this.data.length >= pageSize) {
        if (target.scrollHeight - target.scrollTop - target.clientHeight <= 2) {
          this.loadMoreData();
        }
      }
    } else if (this.selectedItems && this.selectedItems.length > 0) {
      this.selectedItems = [...this.selectedItems];
      this.cdr.detectChanges();
    }
    this.cdr.markForCheck();
  }

  onSelectionChange(event: any[]) {
    this.selectedItems = [...event];
    const selectableRows = this.data.filter(rowData => {
      const selectable = this.isRowSelectable(rowData);
      return selectable === undefined ? true : selectable;
    });
    this.isAllSelected = selectableRows.length > 0 && this.selectedItems.length === selectableRows.length;
    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }

  onSelectAllChange(event: TableSelectAllChangeEvent) {
    const checked = event.checked;
    if (checked) {
      this.selectedItems = this.data.filter(rowData => {
        const selectable = this.isRowSelectable(rowData);
        return selectable === undefined ? true : selectable;
      });
      this.isAllSelected = this.selectedItems.length > 0;
    } else {
      this.selectedItems = [];
      this.isAllSelected = false;
    }
    this.selectionChange.emit(this.selectedItems);
    this.selectAllChange.emit(this.isAllSelected);
  }

  trackByFn(index: number, item: any) {
    return (this.dataKey && item?.[this.dataKey]) || index;
  }

  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as ReportColumn[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }

  private syncTableSortMeta() {
    if (!this.dt || !this.lastQueryBody?.SortBy) return;
    const sortBy = this.lastQueryBody.SortBy;
    const meta = Array.isArray(sortBy) ? [...sortBy] : [sortBy];
    this.dt.multiSortMeta = meta.map(m => ({
      field: m.field || m.Field,
      order: m.order || m.Order,
    }));
    setTimeout(() => {
      this.dt.tableService.onSort(this.dt.multiSortMeta || []);
      this.cdr.detectChanges();
    }, 0);
  }

  private normalizeQueryBody(body: any) {
    if (!body) return body;
    const pageSize = body.pageSize ?? body.PageSize ?? 30;
    const pageIndex = body.pageIndex ?? body.PageIndex ?? 1;
    const { PageSize, PageIndex, ...rest } = body;
    return { ...rest, pageSize, pageIndex };
  }

  getBtnLabel(btn: any, rowData: any): string {
    if (typeof btn.label === 'function') return btn.label(rowData);
    return btn.label;
  }
}
