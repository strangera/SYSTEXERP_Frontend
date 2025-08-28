/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { Table, TableColumnReorderEvent } from 'primeng/table';
import { TableUtilityService } from './table-edit-utility.service';
import { Column, FieldChangeEvent } from './table-edit.model';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-table-edit',
  templateUrl: './table-edit.component.html',
  styleUrl: './table-edit.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    TableModule,
    MultiSelectModule,
    TooltipModule,
    FormsModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    AutoCompleteModule,
  ],
})
export class TableEditComponent implements OnInit {
  @ViewChild('dt', { static: false }) dt!: Table;         // table 元件
  // 基本設置
  @Input() dataKey = 'ID';                                // table 資料key
  @Input() tableKey: string | undefined = undefined;      // table 唯一標識 (必填)
  @Input() title: string | undefined = undefined;         // table 標題
  @Input() columns!: Column[];                            // table 欄位配置 (必填)
  @Input() data: any[] = [];                              // table 資料 (必填)
  @Output() dataChange = new EventEmitter<any[]>();       // table 資料改變 (事件)
  @Input() loading = false;                               // 是否顯示 loading
  @Input() disabled = false;                              // 是否禁用 table
  // select 選擇Row相關
  @Input() selectedItems: any = [];                                             // table 已勾選資料
  @Input() isRowSelectable: (rowData: any) => boolean | undefined = () => true; // 可選擇(條件)
  @Output() selectionChange = new EventEmitter<any>();                          // 資料變更(事件)
  // Header(左) 相關
  @Output() insert = new EventEmitter<any>(); // 新增事件
  @Output() delete = new EventEmitter<any>(); // 刪除事件
  // rowEdit 相關
  @Input() rowEditDisabled: (rowData: any) => boolean | undefined = () => false;// Row禁止編輯條件
  @Input() defaultInsertData: any = {};             // 預設新增資料 (可選，預設為所有資料為null)
  @Input() dataStatusField: string | undefined;     // 資料狀態 (如果有值增加狀態欄位；如果沒有值不增加狀態欄位)
  @Input() dataStatusValue = {                      // 預設 original/new/modified/deleted (可選)
    Original: 'original',
    New: 'new',
    Modified: 'modified',
    Deleted: 'deleted'
  };
  @Output() fieldChange = new EventEmitter<FieldChangeEvent>(); // input 變更事件
  @Output() filterChange = new EventEmitter<{ rowData: any, value: string; }>(); // autoComplete 過濾事件
  constructor(
    private readonly tableUtilityService: TableUtilityService,
    private readonly messageService: NotificationService,
  ) { }
  ngOnInit(): void {
    this.insertRow();
  }
  // 行是否可選
  rowSelectableWrapper = ({ data }: { data: any, index: number; }): boolean | undefined => { return this.isRowSelectable(data) };
  // (欄位是Dropdown使用): 獲取Dropdown的選項，支持function加入或直接給List
  getOptions(rowData: any, col: Column) { return typeof col.options === 'function' ? (col.options(rowData) || undefined) : col.options || undefined; }
  // autoComplete觸發事件
  filterOptions(event: AutoCompleteCompleteEvent) {
    this.filterChange.emit({ rowData: event.originalEvent, value: event.query });
  }
  // Insert 按鈕
  insertRow() {
    const { newRowData, data } = this.tableUtilityService.insertNewRow(this.data, this.columns, this.dataKey, this.defaultInsertData);
    this.data = data;
    if (this.dataStatusField) {
      newRowData[this.dataStatusField] = this.dataStatusValue.New;
    }
    this.dataChange.emit(this.data);
    this.insert.emit();
  }
  // Delete 按鈕
  deleteRow(selectedItems: any) {
    if (this.dataStatusField) {
      selectedItems = selectedItems.map((item: any) => {
        if (this.dataStatusField !== undefined) {
          item[this.dataStatusField] = this.dataStatusValue.Deleted;
        }
        return item;
      });
    }
    this.delete.emit(selectedItems);
    this.data = this.data.filter(item => !selectedItems.includes(item));
    this.dataChange.emit(this.data);
    this.selectedItems = [];
  }
  // 處理 ngModelChange 事件，並發送給父元件
  onValueChange(rowData: any, value: any, col: Column, index: number) {
    // TODO 待處理 要處理現有的值，並且沒有new的
    if (this.dataStatusField) {
      rowData[this.dataStatusField] = this.dataStatusValue.Modified;
    }
    // TODO 待處理 處理是new的並且有變更的話
    if (!this.tableUtilityService.isNewRowUnchanged(rowData, this.columns, this.dataKey, this.defaultInsertData)) {
      return this.insertRow();
    }
    // TODO 待處理 變更過程中若不符合驗證條件的話
    if (!this.tableUtilityService.validateRowData(rowData, this.columns, this.data, this.messageService)) {
      return;// 執行整行驗證
    }
    this.fieldChange.emit({ rowData, field: col.field, value: value, index });
  }
  // 處理 AutoComplete 的過濾事件，並發送給父元件
  onFilterComplete(event: AutoCompleteCompleteEvent) {
    console.log(event);// this.filterChange.emit(event.query, event.originalEvent);
  }
  // !!! 以下為核心
  onColReorder(event: TableColumnReorderEvent) {
    this.columns = event.columns as Column[];// 欄位調整
  }
  trackByRow = (index: number, item: any) => { return item?.[this.dataKey] || index; };// 行追蹤
}
