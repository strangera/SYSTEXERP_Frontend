/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BasicPrintDataComponent } from '@shared/componentextends/basic-print/basic-print-data.component';
import { COMMON_IMPORTS } from '@others/component/table/import-table';
import { TableUtilityService } from '@others/component/table/table-utility.service';
import { Column, formatAmount } from '@others/component/table/table.model';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-table-subheader',
  standalone: true,
  imports: [CommonModule, ...COMMON_IMPORTS],
  templateUrl: './table-subheader.component.html',
  styleUrl: './table-subheader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableSubheaderComponent extends BasicPrintDataComponent implements OnChanges {
  @ViewChild('dt', { static: false }) dt!: Table;
  @Input() dataKey = 'AccNo4';
  @Input() tableKey = 'FIN55060';
  @Input() totalRecords = 0;
  columns: Column[] = [
    { field: 'AccNo', header: '科目代號' },
    { field: 'AccCName', header: '科目名稱' },
    { field: 'DetailNo', header: '廠商編號/名稱' },
    { field: 'ORG_ID', header: '部門代號' },
    { field: 'Org_Name', header: '部門名稱' },
    { field: 'ProjectNo', header: '活動代號' },
    { field: 'Debit_Amt', header: '借方金額', format: formatAmount, style: 'text-right' },
    { field: 'Credit_Amt', header: '貸方金額', format: formatAmount, style: 'text-right' },
    { field: 'Balance', header: '餘額', format: formatAmount, style: 'text-right' },
  ];
  originalColumns = this.columns;
  selectedColumns!: Column[];
  @Input() data: any[] = [];
  @Output() dataChange = new EventEmitter<any[]>();
  @Input() loading = false;
  groupRowsBy = 'AccNo4';
  groupRowsByName = 'AccNo4Name';
  groupedDataCache = new Map();
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
  }
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };
  get getVisibleHeaderCount(): number {
    const visibleColumnCount = this.tableUtilityService.getVisibleColumnCount(this.selectedColumns);
    return 1 + visibleColumnCount;
  }
  onFilterChange(event: MultiSelectChangeEvent) {
    this.columns.forEach(col => {
      col.visible = event.value.some((ev: any) => ev.field === col.field);
    });
    this.queryState.setQueryState(this.tableKey + 'Filter', this.columns);
  }
  detailRow(rowData: any, col?: Column, value?: any) {
    if (col && value) {
      this.detailWithColValue.emit({ row: rowData, col, value });
    }
    this.detail.emit(rowData);
  }
}
