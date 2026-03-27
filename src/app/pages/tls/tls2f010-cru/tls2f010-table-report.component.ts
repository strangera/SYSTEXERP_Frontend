/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { untilDestroyed } from '@ngneat/until-destroy';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { TableCaptionComponent } from '@shared/componentkit/table/table-caption/table-caption.component';
import { TableExpansionComponent } from '@shared/componentkit/table/table-expansion/table-expansion.component';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent } from 'primeng/fileupload';
import { ImageModule } from 'primeng/image';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { Table, TableColumnReorderEvent, TableModule, TableSelectAllChangeEvent } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Observable } from 'rxjs';
import { Tls2f010TableReportUtilityService } from './tls2f010-table-report-utility.service';
import { AddButton, ColumnGroup, expandAnimation, formatAmount2, ReportColumn, TableQueryPayload } from './tls2f010-table-report.model';

@Component({
  selector: 'app-tls2f010-table-report',
  host: { 'table-report-id': 'app-tls2f010-table-report' },
  standalone: true,
  imports: [TableExpansionComponent, SkeletonModule, TableModule, CommonModule, ImageModule, ButtonModule, TooltipModule, MultiSelectModule, FormsModule, TableCaptionComponent],
  templateUrl: './tls2f010-table-report.component.html',
  styleUrls: ['./tls2f010-table-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [expandAnimation]
})
export class TLS2F010TableReportComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt') public dt!: Table;
  @Input() lastQueryBody?: any;
  @Input({ required: true }) totalRecords = 0;
  @Input({ required: true }) data: any[] = [];
  @Input({ required: true }) columns: ReportColumn[] = [];
  @Input() queryFunction?: (body: any) => Observable<any>;
  virtualData: any = [];
  @Input() lazy = true;
  @Input() dataKey: string | undefined;
  selectedColumns: ReportColumn[] = [];
  @Input() tableKey = this.route.snapshot.url[this.route.snapshot.url.length - 1].path;
  @Input() loading = false;
  public _loading = false;
  @Input() showReorder = true;
  @Input() showCheckBox = false;
  @Input() selectedItems: any = [];
  @Output() selectionChange = new EventEmitter<any>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true;
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data) };
  @Input() isAllSelected = false;
  @Output() dataChange = new EventEmitter<any[]>();
  @Input() showCaption = true;
  @Input() showSort = true;
  public get multiSortMeta() { return this.dt?.multiSortMeta || []; }
  @Input() allowMultilineHeader = false;
  @Input() showFilter = true;
  @Input() showReportMode = true;
  @Input() customReport = false;
  @Input() pageOrientation: string | null = 'Landscape';
  @Input() pageSizeSetting: string | null = 'A4';
  @Output() exportEvent = new EventEmitter<string>();
  @Output() delete = new EventEmitter<any>();
  @Input() showDelete = true;
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
  @Input() editDisabled: (rowData: any) => boolean | undefined = () => false;
  @Input() detailDisabled: (rowData: any) => boolean | undefined = () => false;
  @Output() edit = new EventEmitter<any>();
  @Input() addButton: AddButton[] = [];
  @Input() buttonsLoading = false;
  @Input() footerData: any;
  @Input() footerPercentData: any;
  @Input() extraFooterData: any;
  @Input() groupRowsBy?: string;
  groupTotals: Record<string, Record<string, number>> = {};
  @Input() subTotalData: any;
  @Output() selectButton = new EventEmitter<any>();
  @Input() showSummary = true;
  @Input() footerLabel = '總計';
  @Input() autoHeight = false;
  @Input() showFooterTotal = true;
  @Input() allowFooterHtml = false;
  @Input() expansionColumns: ReportColumn[] = [];
  @Input() expansionDataKey = 'details';
  @Input() expansionMultiSortMeta = [{ field: this.expansionDataKey, order: 1 }];
  @Input() expansionLoadFn?: (rowData: any) => Observable<any>;
  expandedRows: Record<string, boolean> = {};
  @Output() linkClick = new EventEmitter<{ rowData: any, field: string }>();
  @Input() apiUrl?: string;
  @Input() DataKeyName?: string;
  @Input() Conditions?: any;
  @Input() PrintRemark = true;
  @Input() emptyMessage = '查無資料';
  constructor(
    public readonly tableUtility: Tls2f010TableReportUtilityService,
    public readonly sanitizer: DomSanitizer,
    private readonly route: ActivatedRoute,
  ) {
    super();
    this.onScroll = this.onScroll.bind(this);
  }
  public hasSearched = false; // 是否已搜尋
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {

      if (this.lastQueryBody) {
        this.hasSearched = true;
      }
      this.isAllSelected = false;
      this.selectedItems = [];
      this.virtualData = [];
      this.groupTotals = {};
      this.updateGroupTotals(this.data);
      if (this.data.length !== 0) {
        if (this.dt) {
          this.dt.virtualScroll = false;
        }
        this.cdr.detectChanges();
        if (this.data.length < (this.lastQueryBody?.pageSize || 30)) {
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        } else {
          if (this.data.length === this.totalRecords) { this.dt.lazy = false; }
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
          this.virtualData = Array.from({ length: this.data.length });
          this.cdr.detectChanges();
          this.virtualData = this.data;
        }
      }
    }
  }
  private rawLabelMap: Record<string, string> = {
    UnPostedAmt_NoTax: '未登錄餘額(免稅)',
    UnPostedAmt_WithTax: '未登錄餘額(含稅)',
  };
  private formatValue(v: any): any {
    if (v === null || v === undefined || v === '') return '';
    const num = Number(v);
    if (!isNaN(num)) return formatAmount2(num);
    return String(v);
  }
  public getExtraFooterArray(): { label: string; value: any }[] {
    const d = this.extraFooterData;
    if (!d) return [];
    if (Array.isArray(d)) {
      return d.map((x: any) => {
        if (x && typeof x === 'object' && ('label' in x || 'value' in x)) {
          const rawLabel = x.label ?? '';
          const mappedLabel = this.rawLabelMap[rawLabel] ?? rawLabel;
          return { label: mappedLabel, value: this.formatValue(x.value ?? '') };
        }
        const rawLabel = String(x?.label ?? '');
        return { label: this.rawLabelMap[rawLabel] ?? rawLabel, value: this.formatValue(x?.value ?? x) };
      });
    }
    if (typeof d === 'object') {
      return Object.keys(d).map(k => ({ label: this.rawLabelMap[k] ?? k, value: this.formatValue(d[k]) }));
    }
    return [{ label: '', value: this.formatValue(d) }];
  }
  loadMoreData() {
    if (this._loading || !this.queryFunction || !this.lastQueryBody) {
      return;
    }
    const pageSize = this.lastQueryBody?.pageSize || this.lastQueryBody?.PageSize || 30;
    const currentSort = this.dt?.multiSortMeta;
    const body = {
      ...this.lastQueryBody,
      pageIndex: Math.floor(this.data.length / pageSize) + 1,
      pageSize,
      SortBy: currentSort && currentSort.length > 0 ? currentSort : (this.lastQueryBody.SortBy || undefined)
    };
    this._loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this._loading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = Array.from({ length: this.data.length + res.Data.length });
        this.updateGroupTotals(res.Data);
        this.cdr.detectChanges();
        this.data = [...this.data, ...res.Data];
        this.dataChange.emit(this.data);
        this.virtualData = this.data;
        this.totalRecords = res.TotalCount || this.data.length;
      }
    });
  }
  onSort(event: any) {
    if (!this.lazy) {
      this.groupTotals = {};
      this.updateGroupTotals(this.data);
      this.cdr.detectChanges();
      return;
    }
    if (this._loading) return;
    if (event.multiSortMeta && event.multiSortMeta.length > 0) {
      const lastSort = event.multiSortMeta[event.multiSortMeta.length - 1];
      this.dt.multiSortMeta = [lastSort];
    }
    const pageSize = this.lastQueryBody?.pageSize || this.lastQueryBody?.PageSize || 30;
    if (!this.queryFunction || !this.lastQueryBody || !this.showSort) {
      return;
    }
    const body = {
      ...this.lastQueryBody,
      pageIndex: 1,
      pageSize,
      SortBy: this.dt.multiSortMeta ?? undefined
    };
    this.loading = true;
    this.queryFunction(body).pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
      if (res && res.Data && res.Data.length > 0) {
        this.virtualData = [];
        this.dt.virtualScroll = false;
        this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        this.groupTotals = {};
        this.updateGroupTotals(res.Data);
        this.data = res.Data;
        this.cdr.detectChanges();
        if (res.Data.length < pageSize) {
          this.data = res.Data;
          this.virtualData = this.data;
          this.dt.virtualScroll = false;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
        } else {
          this.dt.virtualScroll = true;
          this.dt.scrollHeight = this.autoHeight ? undefined as any : '450px';
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
        else
          result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
        if (result !== 0) {
          return sortMeta.order * result;
        }
      }
      return 0;
    });
    this.virtualData = this.data;
    this.groupTotals = {};
    this.updateGroupTotals(this.data);
    this.cdr.markForCheck();
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
      const pageSize = this.lastQueryBody?.pageSize || 30;
      if (this.data.length < this.totalRecords && this.data.length >= pageSize) {
        if (target.scrollHeight - target.scrollTop - target.clientHeight <= 2) {
          this.loadMoreData();
        }
      }
    }
    else {
      if (this.selectedItems && this.selectedItems.length > 0) {
        this.selectedItems = [...this.selectedItems];
        this.cdr.detectChanges();
      }
    }
  }
  onSelectionChange(event: any[]) {
    this.selectedItems = event;
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
    return this.dataKey && item?.[this.dataKey] || index;
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
    if (!this.groupRowsBy || !this.data || rowIndex === this.data.length - 1) {
      return true;
    }
    return this.tableUtility.isGroupLastRow(rowData, rowIndex, this.groupRowsBy, this.data);
  }
  getGroupSubtotal(rowData: any, col: ReportColumn): any {
    if (!this.groupRowsBy || !col.isSubTotal) {
      return '';
    }
    const rawGroupValue = rowData[this.groupRowsBy];
    const groupColumn = this.columns.find(c => c.field === this.groupRowsBy);
    const useFormatterForGroupKey = groupColumn && groupColumn.format;
    let matchKey: string;
    if (useFormatterForGroupKey) {
      matchKey = String(groupColumn!.format!(rawGroupValue) ?? '').trim() || 'UNKNOWN_GROUP';
    } else {
      matchKey = String(rawGroupValue ?? '').trim() || 'UNKNOWN_GROUP';
    }
    if (this.subTotalData && this.subTotalData.length > 0 && this.groupRowsBy) {
      const subtotalRow = this.subTotalData.find((item: any) => {
        const itemRawValue = item[this.groupRowsBy!];
        let itemMatchKey: string;
        if (useFormatterForGroupKey) {
          itemMatchKey = String(groupColumn!.format!(itemRawValue) ?? '').trim() || 'UNKNOWN_GROUP';
        } else {
          itemMatchKey = String(itemRawValue ?? '').trim() || 'UNKNOWN_GROUP';
        }
        return itemMatchKey === matchKey;
      });
      if (subtotalRow) {
        const subtotal = subtotalRow[col.field] ?? 0;
        return col.format ? col.format(subtotal) : subtotal;
      }
    }
    const total = this.groupTotals[matchKey]?.[col.field] ?? 0;
    return col.format ? col.format(total) : total;
  }
  updateGroupTotals(newData: any[]): void {
    if (!this.groupRowsBy || !this.columns.some(col => col.isSubTotal)) {
      return;
    }
    const groupColumn = this.columns.find(col => col.field === this.groupRowsBy);
    const useFormatterForGroupKey = groupColumn && groupColumn.format;
    newData.forEach(row => {
      const rawValue = row[this.groupRowsBy!];
      let groupKey: string;
      if (useFormatterForGroupKey) {
        groupKey = String(groupColumn!.format!(rawValue) ?? '').trim() || 'UNKNOWN_GROUP';
      } else {
        groupKey = String(rawValue ?? '').trim() || 'UNKNOWN_GROUP';
      }
      if (groupKey === 'UNKNOWN_GROUP' && (rawValue === undefined || rawValue === null)) {
        return;
      }
      if (!this.groupTotals[groupKey]) {
        this.groupTotals[groupKey] = {};
      }
      this.columns.forEach(col => {
        if (col.isSubTotal) {
          const field = col.field;
          const value = Number(row[field]) || 0;
          this.groupTotals[groupKey][field] = (this.groupTotals[groupKey][field] || 0) + value;
        }
      });
    });
  }
}
