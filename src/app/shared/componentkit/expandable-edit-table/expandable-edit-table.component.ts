import { Component, Input, Output, EventEmitter, ViewChild, ChangeDetectorRef, TemplateRef } from '@angular/core';
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

export interface ColumnDef {
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
  @Input() expandedContentTemplate: TemplateRef<any> | null = null;

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


  // 在組件初始化或數據載入時初始化輸入字段
  initializeInputFields() {
    if (this.data && this.data.length > 0) {
      // 為主表格數據初始化
      this.data.forEach(rowData => {
        this.mainColumns.forEach(col => {
          if (col.type === 'date' && rowData[col.field]) {
            rowData[col.field + '_input'] = this.getFormattedDateValue(rowData[col.field]);
          }
        });

        // 為詳細數據初始化
        if (rowData[this.detailKey] && rowData[this.detailKey].length > 0) {
          rowData[this.detailKey].forEach((detailData: any) => {
            this.detailColumns.forEach(col => {
              if (col.type === 'date' && detailData[col.field]) {
                detailData[col.field + '_input'] = this.getFormattedDateValue(detailData[col.field]);
              }
            });
          });
        }
      });
    }
  }

  ngOnInit() {
    this.totalRecords = this.data.length;
    this.initializeInputFields();
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
    console.log('Detail edit:', event);
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

  // 修改日期選擇器確認方法
  confirmDateSelection() {
    if (this.currentDateField && this.temporaryDate) {
      // 保存日期對象
      this.currentDateField.data[this.currentDateField.field] = this.temporaryDate;

      // 更新輸入字段以顯示格式化的日期
      const formattedValue = this.getFormattedDateValue(this.temporaryDate);
      this.currentDateField.data[this.currentDateField.field + '_input'] = formattedValue;

      // 如果是編輯詳細資料的日期，還需要觸發變更檢測
      if (this.currentDateField.isDetail) {
        this.cdr.detectChanges();
      }
    }
    this.datePickerVisible = false;
    this.currentDateField = null;
    this.temporaryDate = null;
  }

  // 新方法：處理日期輸入完成（失去焦點或按回車時）
  onDateInputComplete(data: any, field: string, isDetail: boolean = false, rowIndex?: number, detailIndex?: number) {
    const inputValue = data[field + '_input'];

    // 如果輸入為空，清空日期值
    if (!inputValue) {
      data[field] = null;
      return;
    }

    // 解析日期
    const parsedDate = this.parseDate(inputValue);

    if (parsedDate) {
      // 如果成功解析為日期
      data[field] = parsedDate;
      // 更新輸入框顯示為標準格式
      data[field + '_input'] = this.getFormattedDateValue(parsedDate);
    } else {
      // 如果無法解析，保留原始輸入但不更新實際日期值
      console.warn('無效日期格式:', inputValue);
      // 可選：清空日期值
      // data[field] = null;
    }

    // 觸發變更檢測
    if (isDetail) {
      this.cdr.detectChanges();
    }
  }

  // 日期解析方法
  parseDate(inputValue: string): Date | null {
    if (!inputValue) return null;

    try {
      // 各種日期格式解析

      // 1. 標準格式 YYYY/MM/DD 或 YYYY-MM-DD
      const standardFormatMatch = inputValue.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
      if (standardFormatMatch) {
        const year = parseInt(standardFormatMatch[1], 10);
        const month = parseInt(standardFormatMatch[2], 10) - 1;
        const day = parseInt(standardFormatMatch[3], 10);

        if (this.isValidDate(year, month, day)) {
          return new Date(year, month, day);
        }
      }

      // 2. 反向格式 DD/MM/YYYY
      const reversedFormatMatch = inputValue.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
      if (reversedFormatMatch) {
        const day = parseInt(reversedFormatMatch[1], 10);
        const month = parseInt(reversedFormatMatch[2], 10) - 1;
        const year = parseInt(reversedFormatMatch[3], 10);

        if (this.isValidDate(year, month, day)) {
          return new Date(year, month, day);
        }
      }

      // 3. 純數字格式 YYYYMMDD
      if (/^\d{8}$/.test(inputValue)) {
        const year = parseInt(inputValue.substring(0, 4), 10);
        const month = parseInt(inputValue.substring(4, 6), 10) - 1;
        const day = parseInt(inputValue.substring(6, 8), 10);

        if (this.isValidDate(year, month, day)) {
          return new Date(year, month, day);
        }
      }

      // 4. 嘗試一般解析
      const dateObj = new Date(inputValue);
      if (!isNaN(dateObj.getTime())) {
        return dateObj;
      }

      // 無法解析為有效日期
      return null;
    } catch (e) {
      console.error('日期解析錯誤:', e);
      return null;
    }
  }

  // 日期有效性檢查
  isValidDate(year: number, month: number, day: number): boolean {
    // 基本範圍檢查
    if (year < 1900 || year > 2100) return false;
    if (month < 0 || month > 11) return false;
    if (day < 1 || day > 31) return false;

    // 檢查月份的具體天數
    const date = new Date(year, month, day);
    return date.getFullYear() === year &&
      date.getMonth() === month &&
      date.getDate() === day;
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


  // 處理手動輸入日期（更穩健的版本）
  onDateInputChange(data: any, field: string, isDetail: boolean = false, rowIndex?: number, detailIndex?: number) {
    // 獲取輸入文本
    const inputValue = data[field];

    // 如果是空值，直接清空
    if (!inputValue) {
      data[field] = null;
      return;
    }

    // 如果已經是Date對象，轉換為格式化的字符串
    if (inputValue instanceof Date) {
      const formattedValue = this.getFormattedDateValue(inputValue);
      data[field] = inputValue;
      return;
    }

    try {
      // 只處理字符串類型的輸入
      if (typeof inputValue !== 'string') {
        return;
      }

      // 首先檢查是否是格式化的日期字符串 YYYY/MM/DD
      if (/^\d{4}\/\d{2}\/\d{2}$/.test(inputValue)) {
        const [year, month, day] = inputValue.split('/').map(p => parseInt(p, 10));

        // 驗證日期合法性
        if (this.isValidDate(year, month - 1, day)) {
          const dateObj = new Date(year, month - 1, day);
          data[field] = dateObj;
          return;
        }
      }

      // 檢查其他各種日期格式
      // 1. YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(inputValue)) {
        const [year, month, day] = inputValue.split('-').map(p => parseInt(p, 10));
        if (this.isValidDate(year, month - 1, day)) {
          const dateObj = new Date(year, month - 1, day);
          data[field] = dateObj;
          return;
        }
      }

      // 2. DD/MM/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(inputValue)) {
        const parts = inputValue.split('/').map(p => parseInt(p, 10));
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];

        if (this.isValidDate(year, month - 1, day)) {
          const dateObj = new Date(year, month - 1, day);
          data[field] = dateObj;

          // 更新為標準格式顯示
          setTimeout(() => {
            const formattedValue = this.getFormattedDateValue(dateObj);
            data[field] = dateObj; // 確保仍然是Date對象
            this.cdr.detectChanges();
          }, 0);

          return;
        }
      }

      // 3. 嘗試通用解析（如果用戶輸入了其他可能的格式）
      const possibleDate = new Date(inputValue);
      if (!isNaN(possibleDate.getTime())) {
        data[field] = possibleDate;

        // 更新為標準格式顯示
        setTimeout(() => {
          const formattedValue = this.getFormattedDateValue(possibleDate);
          if (formattedValue !== inputValue) {
            data[field] = possibleDate; // 確保仍然是Date對象
            this.cdr.detectChanges();
          }
        }, 0);

        return;
      }

      // 4. 處理特殊情況：用戶輸入的只是數字（例如20230101）
      if (/^\d{8}$/.test(inputValue)) {
        const year = parseInt(inputValue.substring(0, 4), 10);
        const month = parseInt(inputValue.substring(4, 6), 10) - 1;
        const day = parseInt(inputValue.substring(6, 8), 10);

        if (this.isValidDate(year, month, day)) {
          const dateObj = new Date(year, month, day);
          data[field] = dateObj;

          // 更新為標準格式顯示
          setTimeout(() => {
            const formattedValue = this.getFormattedDateValue(dateObj);
            this.cdr.detectChanges();
          }, 0);

          return;
        }
      }

      // 5. 處理短格式：用戶輸入的簡短日期（例如2023/1/1）
      const shortFormatMatch = inputValue.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
      if (shortFormatMatch) {
        const year = parseInt(shortFormatMatch[1], 10);
        const month = parseInt(shortFormatMatch[2], 10) - 1;
        const day = parseInt(shortFormatMatch[3], 10);

        if (this.isValidDate(year, month, day)) {
          const dateObj = new Date(year, month, day);
          data[field] = dateObj;

          // 更新為標準格式顯示
          setTimeout(() => {
            const formattedValue = this.getFormattedDateValue(dateObj);
            this.cdr.detectChanges();
          }, 0);

          return;
        }
      }

      // 如果都不匹配，保留原始輸入但在控制台輸出警告
      console.warn('無法解析日期格式:', inputValue);
      // 這裡關鍵是不要修改data[field]，保留用戶的原始輸入
      // 讓用戶可以繼續修改，而不是自動轉換為無效日期

    } catch (e) {
      console.error('日期解析錯誤:', e);
      // 發生錯誤時，不修改原始輸入
    }
  }

  // 修改getFormattedDateValue方法，使其更穩健
  getFormattedDateValue(date: any): string {
    if (!date) return '';

    // 如果已經是格式化的字符串，直接返回
    if (typeof date === 'string' && /^\d{4}\/\d{2}\/\d{2}$/.test(date)) {
      return date;
    }

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';

      // 格式化為 YYYY/MM/DD
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');

      return `${year}/${month}/${day}`;
    } catch (e) {
      console.error('日期格式化錯誤:', e);
      return '';
    }
  }
}
