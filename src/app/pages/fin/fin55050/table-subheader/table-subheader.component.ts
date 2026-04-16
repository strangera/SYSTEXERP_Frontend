/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { COMMON_IMPORTS } from '@shared/componentkit/table/import-table';
import { TableUtilityService } from '@shared/componentkit/table/table-utility.service';
import { Column, ColumnGroup } from '@shared/componentkit/table/table.model';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { Table, TableColumnReorderEvent } from 'primeng/table';

@Component({
  selector: 'app-table-subheader',
  standalone: true,
  imports: [CommonModule, ...COMMON_IMPORTS],
  templateUrl: './table-subheader.component.html',
  styleUrl: './table-subheader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSubheaderComponent extends BasicPrintDataComponent implements OnChanges {
  @Input() groupHeaderTemplate?: TemplateRef<any>;
  @ViewChild('dt', { static: false }) dt!: Table;
  @Input() dataKey = 'ID';
  @Input() tableKey: string | undefined = undefined;
  @Input() columns!: Column[];
  originalColumns!: Column[];
  selectedColumns!: Column[];
  @Input() data: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();
  @Input() loading = false;
  @Input() groupRowsBy = '';
  @Input() groupRowsByName = '';
  @Input() showGroupheader = true;
  @Input() totalRecords = 0;
  @Output() detail = new EventEmitter<any>();
  @Output() detailWithColValue = new EventEmitter<{ row: any, col: Column, value: any }>();
  constructor(
    private readonly tableUtilityService: TableUtilityService,
  ) { super(); }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      setTimeout(() => {
        this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.data.length;
      });
    }
    if (changes['columns'] && this.columns.length > 0) {
      this.originalColumns = this.columns;
    }
  }
  // 行追蹤
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };
  // 計算欄位總數(包含序號、勾選、管理)
  get getVisibleHeaderCount(): number {
    const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
    return 1 + + visibleColumnCount;
  }
  // 過濾欄位記錄保存
  onFilterChange(event: MultiSelectChangeEvent) {
    this.columns.forEach(col => {
      col.visible = event.value.some((ev: any) => ev.field === col.field);
    });
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
  // 計算分組欄位跨度
  getColumnSpan(columns: Column[], groupField: string): number {
    return this.tableUtilityService.getColumnSpan(columns, groupField);
  }
  // 取得沒有分組的欄位
  getUngroupedColumns(columns: Column[], columnGroup: ColumnGroup[]): Column[] {
    return this.tableUtilityService.getUngroupedColumns(columns, columnGroup);
  }
  // 判斷是否應該渲染分組標題
  shouldRenderGroupHeader(col: Column, index: number, columns: Column[]): boolean {
    return this.tableUtilityService.shouldRenderGroupHeader(col, index, columns);
  }
  // 分組總計
  getGroupSubtotal(groupValue: any, field: string): number {
    return this.tableUtilityService.getGroupSubtotal(this.data, this.groupRowsBy, groupValue, field);
  }
  // 全表總計
  getTotal(field: string): number {
    return this.tableUtilityService.getTotal(this.data, field);
  }
  // 欄位調整
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
  detailRow(rowData: any, col?: Column, value?: any) {
    if (col && value) {
      this.detailWithColValue.emit({ row: rowData, col, value });
    }
    this.detail.emit(rowData);
  }
}
