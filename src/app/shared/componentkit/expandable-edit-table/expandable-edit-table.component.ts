import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';

interface DataItem {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  details?: DetailItem[];
  expanded?: boolean;
}

interface DetailItem {
  id: number;
  description: string;
  manufacturer: string;
  quantity: number;
  price: number;
  discount: number;
}

interface ColumnDef {
  field: string;
  header: string;
  type?: string;
  editable?: boolean;
  hidden?: boolean;
  style?: string;
}

@Component({
  selector: 'app-expandable-edit-table',
  templateUrl: './expandable-edit-table.component.html',
  styleUrls: ['./expandable-edit-table.component.scss']
})
export class ExpandableEditTableComponent {
  @ViewChild('dt') dt!: Table;
  @Input() title: string = '';
  @Input() mainColumns: ColumnDef[] = [];
  @Input() detailColumns: ColumnDef[] = [];
  @Input() data: any[] = [];
  @Input() detailKey: string = 'details';
  @Input() dataKey: string = 'id';
  @Input() showCheckBox: boolean = true;
  @Input() showPaginator: boolean = true;
  @Input() selectionMode: 'multiple' | 'single' | null = 'multiple';
  @Input() loading: boolean = false;
  @Input() emptyMessage: string = '查無資料';
  @Input() readonly: boolean = false;

  @Output() edit = new EventEmitter<any>();
  @Output() save = new EventEmitter<{ oldData: any, newData: any }>();
  @Output() cancel = new EventEmitter<any>();
  @Output() detailEdit = new EventEmitter<any>();
  @Output() detailSave = new EventEmitter<{ oldDetail: any, newDetail: any, parentData: any }>();
  @Output() detailCancel = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();

  expandedRows: { [key: string]: boolean } = {};
  selectedItems: any[] = [];
  clonedItems: { [s: string]: any } = {};
  clonedDetails: { [s: string]: any } = {};
  editingRow: number | null = null;
  editingDetail: { rowIndex: number, detailIndex: number } | null = null;
  totalRecords: number = 0;
  first: number = 0;
  rows: number = 10;
  isAllExpanded: boolean = false;

  // 添加日期選擇器相關屬性
  datePickerVisible: boolean = false;
  currentDateField: { data: any, field: string, isDetail: boolean, rowIndex?: number, detailIndex?: number } | null = null;
  temporaryDate: Date | null = null;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.totalRecords = this.data.length;
  }

  ngOnChanges() {
    if (this.data) {
      this.totalRecords = this.data.length;
    }
  }

  // 行追踨
  trackByFn(index: number, item: any) {
    return item[this.dataKey] || index;
  }

  // 展開/收合所有行
  toggleExpandAll() {
    if (this.isAllExpanded) {
      this.expandedRows = {};
    } else {
      this.data.forEach(item => {
        if (item[this.detailKey]?.length > 0) {
          this.expandedRows[item[this.dataKey]] = true;
        }
      });
    }
    this.isAllExpanded = !this.isAllExpanded;
  }

  // 展開/收合單行
  toggleRow(rowData: any) {
    if (this.expandedRows[rowData[this.dataKey]]) {
      delete this.expandedRows[rowData[this.dataKey]];
    } else {
      this.expandedRows[rowData[this.dataKey]] = true;
    }
  }

  // 主表格編輯相關
  onRowEditInit(rowData: any, rowIndex: number) {
    this.editingRow = rowIndex;
    this.clonedItems[rowData[this.dataKey]] = { ...rowData };
    this.edit.emit(rowData);
  }

  onRowEditSave(rowData: any) {
    const oldData = this.clonedItems[rowData[this.dataKey]];
    delete this.clonedItems[rowData[this.dataKey]];
    this.editingRow = null;
    this.save.emit({ oldData, newData: rowData });
  }

  onRowEditCancel(rowData: any, rowIndex: number) {
    this.data[rowIndex] = this.clonedItems[rowData[this.dataKey]];
    delete this.clonedItems[rowData[this.dataKey]];
    this.editingRow = null;
    this.cancel.emit(rowData);
  }

  // 詳細資料編輯相關
  onDetailEditInit(detailData: any, rowData: any, rowIndex: number, detailIndex: number) {
    this.editingDetail = { rowIndex, detailIndex };
    this.clonedDetails[detailData.id] = { ...detailData };
    this.detailEdit.emit(detailData);
  }

  onDetailEditSave(detailData: any, rowData: any) {
    const oldDetail = this.clonedDetails[detailData.id];
    delete this.clonedDetails[detailData.id];
    this.editingDetail = null;
    this.detailSave.emit({ oldDetail, newDetail: detailData, parentData: rowData });
  }

  onDetailEditCancel(detailData: any, rowData: any, rowIndex: number, detailIndex: number) {
    rowData[this.detailKey][detailIndex] = this.clonedDetails[detailData.id];
    delete this.clonedDetails[detailData.id];
    this.editingDetail = null;
    this.detailCancel.emit(detailData);
  }

  // 行選擇
  onSelectionChange(event: any) {
    this.selectedItems = event;
  }

  onRowSelect(event: any) {
    this.rowSelect.emit(event.data);
  }

  onRowUnselect(event: any) {
    this.rowUnselect.emit(event.data);
  }

  // 詳細資料編輯狀態檢查
  isDetailEditing(rowIndex: number, detailIndex: number): boolean {
    return this.editingDetail !== null &&
      this.editingDetail.rowIndex === rowIndex &&
      this.editingDetail.detailIndex === detailIndex;
  }

  isRowEditing(rowIndex: number): boolean {
    return this.editingRow === rowIndex;
  }

  // 獲取可見列數量（用於colspan）
  get visibleColumnsCount(): number {
    return this.mainColumns.filter(col => !col.hidden).length +
      (this.showCheckBox ? 1 : 0) +
      (this.detailKey ? 1 : 0) +
      1; // 序號列
  }

  // 分頁處理
  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }

  // 開啟日期選擇器對話框 - 主表格
  openDatePicker(data: any, field: string, isDetail: boolean = false, rowIndex?: number, detailIndex?: number) {
    this.currentDateField = { data, field, isDetail, rowIndex, detailIndex };
    this.temporaryDate = data[field] ? new Date(data[field]) : new Date();
    this.datePickerVisible = true;
  }

  // 確認日期選擇
  confirmDateSelection() {
    if (this.currentDateField && this.temporaryDate) {
      this.currentDateField.data[this.currentDateField.field] = this.temporaryDate;

      // 如果是編輯詳細資料的日期，還需要觸發變更檢測
      if (this.currentDateField.isDetail) {
        this.cdr.detectChanges();
      }
    }
    this.datePickerVisible = false;
    this.currentDateField = null;
    this.temporaryDate = null;
  }

  // 取消日期選擇
  cancelDateSelection() {
    this.datePickerVisible = false;
    this.currentDateField = null;
    this.temporaryDate = null;
  }

  // 格式化日期顯示
  formatDate(date: any): string {
    if (!date) return '';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';

      return dateObj.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return '';
    }
  }

  handleDetailDateClick(event: Event, detailData: any, field: string, rowIndex: number, detailIndex: number) {
    // 防止事件冒泡，避免觸發行展開/收合
    event.stopPropagation();

    this.openDatePicker(detailData, field, true, rowIndex, detailIndex);
  }
}
