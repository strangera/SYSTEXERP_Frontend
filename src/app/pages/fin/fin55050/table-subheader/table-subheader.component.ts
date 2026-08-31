/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { COMMON_IMPORTS } from '@others/component/table/import-table';
import { TableUtilityService } from '@others/component/table/table-utility.service';
import { Column, ColumnGroup, formatAmount } from '@others/component/table/table.model';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { Table, TableColumnReorderEvent } from 'primeng/table';
import { BasicPrintDataComponent } from 'src/app/others/componentextends/basic-print/basic-print-data.component';

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
  dataKey = 'ID';
  tableKey = 'FIN55050';
  columns: Column[] = [
    { field: 'VouNo', header: '傳票號碼', type: 'detail', style: 'text-left' },
    { field: 'Ven_Name', header: '廠商編號/簡稱', style: 'text-left' },
    { field: 'VouStatus', header: '狀態', style: 'text-left' },
    { field: 'ORG_ID', header: '部門', style: 'text-left' },
    { field: 'Org_Name', header: '部門名稱', style: 'text-left' },
    { field: 'ProjectNo', header: '活動', style: 'text-left' },
    { field: 'PTA', header: '立沖代號', style: 'text-left' },
    { field: 'NoteDesc', header: '摘要', style: 'text-left' },
    { field: 'AccAmt_D', header: '借方金額', format: formatAmount, style: 'text-right' },
    { field: 'AccAmt_C', header: '貸方金額', format: formatAmount, style: 'text-right' },
    { field: 'OpeningBal', header: '餘額', format: formatAmount, style: 'text-right' },
  ];
  originalColumns!: Column[];
  selectedColumns!: Column[];

  @Input() data: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();
  @Input() loading = false;
  groupRowsBy = 'AccNo';
  groupRowsByName = 'AccCName';
  @Input() totalRecords = 0;
  @Output() detail = new EventEmitter<any>();
  @Output() detailWithColValue = new EventEmitter<{ row: any, col: Column, value: any }>();

  // 拆分後的資料狀態
  displayData: any[] = [];
  openingBalMap: { [accNo: string]: any } = {};
  groupTotalMap: { [accNo: string]: any } = {};

  constructor(
    private readonly tableUtilityService: TableUtilityService,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.processData();
      setTimeout(() => {
        this.dt.totalRecords = this.totalRecords !== 0 ? this.totalRecords : this.displayData.length;
      });
    }
    this.originalColumns = this.columns;
  }

  /**
   * 將傳入的 data 拆解：過濾出純明細列，並抽出「期初餘額」與「總計」作為對照表
   */
  private processData(): void {
    if (!this.data || this.data.length === 0) {
      this.displayData = [];
      this.openingBalMap = {};
      this.groupTotalMap = {};
      return;
    }

    this.openingBalMap = {};
    this.groupTotalMap = {};
    const pureRows: any[] = [];

    for (const row of this.data) {
      const groupKey = row[this.groupRowsBy];

      if (row.VouNo === '【期初餘額】') {
        this.openingBalMap[groupKey] = row;
      } else if (row.Org_Name === '【總計】' || row.VouNo === '【總計】') {
        this.groupTotalMap[groupKey] = row;
      } else {
        pureRows.push(row);
      }
    }

    this.displayData = pureRows;
  }

  // 行追蹤
  trackByRow = (index: number, item: any) => {
    return item?.[this.dataKey] || index;
  };

  // 計算欄位總數
  get getVisibleHeaderCount(): number {
    const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
    return 1 + visibleColumnCount;
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