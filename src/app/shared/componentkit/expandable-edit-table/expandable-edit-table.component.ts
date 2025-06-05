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

  // 新增這些設定
  @Input() showAddButton: boolean = true;                    // 控制外層新增按鈕顯示
  @Input() showDetailAddButton: boolean = true;              // 控制內層新增按鈕顯示
  @Input() defaultNewItem: any = {};                         // 預設新項目模板
  @Input() defaultNewDetailItem: any = {};                   // 預設新明細項目模板
  // 添加詳細資料選項卡相關屬性
  @Input() showDetailTabs: boolean = false; // 是否在詳細資料中顯示選項卡
  @Input() detailTabOptions: { id: string, label: string }[] = []; // 詳細資料選項卡選項
  @Input() defaultDetailTab: string = ''; // 預設選中的詳細資料選項卡
  @Input() detailColumnsMap: { [tabId: string]: ColumnDef[] } = {};  // 如果需要支持不同列定義，還需要添加:
  // 用於儲存每行的選中選項卡
  detailSelectedTabs: { [key: string]: string } = {};


  @Output() edit = new EventEmitter<any>();
  @Output() save = new EventEmitter<{ oldData: any, newData: any }>();
  @Output() cancel = new EventEmitter<any>();
  @Output() detailEdit = new EventEmitter<any>();
  @Output() detailSave = new EventEmitter<{ oldDetail: any, newDetail: any, parentData: any }>();
  @Output() detailCancel = new EventEmitter<any>();
  @Output() rowSelect = new EventEmitter<any>();
  @Output() rowUnselect = new EventEmitter<any>();
  @Output() detailTabChange = new EventEmitter<{ rowData: any, tabId: string }>();  // 添加事件發射器


  // 新增這些事件
  @Output() addMainItem = new EventEmitter<void>();          // 外層新增按鈕事件
  @Output() addDetailItem = new EventEmitter<any>();         // 內層新增按鈕事件，傳遞外層項目資料

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
    this.initializeDetailArrays();
  }

  ngOnChanges() {
    if (this.data) {
      this.totalRecords = this.data.length;
      this.initializeDetailArrays();

      // 添加這段以確保行的展開狀態
      if (this.showDetailTabs) {
        this.data.forEach(item => {
          // 初始化選項卡狀態
          const rowKey = item[this.dataKey];
          if (!this.detailSelectedTabs[rowKey]) {
            this.detailSelectedTabs[rowKey] = this.defaultDetailTab;
          }
        });
      }
    }
  }

  // 外層新增項目處理
  onAddMainItem() {
    // 先檢查是否正在編輯中，如是則先儲存
    if (this.editingRow !== null || this.editingDetail !== null) {
      // 可以選擇自動保存或返回錯誤提示
      console.warn('請先完成當前編輯操作');
      return;
    }

    // 觸發外部事件，讓父組件處理新增邏輯
    this.addMainItem.emit();

    // 如果需要內部自己處理新增，可以使用以下程式碼
    // const newItem = { ...this.defaultNewItem };
    // // 若需要自動生成ID
    // if (this.dataKey === 'id' && !newItem.id) {
    //   newItem.id = this.generateNewId();
    // }
    // // 預設空的明細陣列
    // if (this.detailKey && !newItem[this.detailKey]) {
    //   newItem[this.detailKey] = [];
    // }

    // // 加入到資料中
    // this.data.unshift(newItem);
    // // 立即進入編輯模式
    // setTimeout(() => {
    //   this.onRowEditInit(newItem, 0);
    // }, 0);
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
    // 設置編輯行索引
    this.editingRow = rowIndex;
    // 複製原始數據以便取消時還原
    this.clonedItems[rowData[this.dataKey]] = { ...rowData };

    // 觸發編輯事件
    this.edit.emit(rowData);

    // 重要：確保明細陣列已初始化
    if (!rowData[this.detailKey]) {
      rowData[this.detailKey] = [];
    }

    // 如果使用日期欄位，確保輸入值被正確初始化
    this.mainColumns.forEach(col => {
      if (col.type === 'date' && rowData[col.field]) {
        rowData[col.field + '_input'] = this.getFormattedDateValue(rowData[col.field]);
      }
    });

    // 觸發變更檢測
    this.cdr.detectChanges();
  }

  onRowEditSave(rowData: any) {
    try {
      // 保存編輯前的資料
      const oldData = this.clonedItems[rowData[this.dataKey]];

      // 清理臨時存儲
      delete this.clonedItems[rowData[this.dataKey]];

      // 重置編輯行索引
      this.editingRow = null;

      // 觸發保存事件
      this.save.emit({ oldData, newData: rowData });

      // 觸發變更檢測
      this.cdr.detectChanges();
    } catch (error) {
      console.error('保存行時出錯：', error);
    }
  }

  onRowEditCancel(rowData: any, rowIndex: number) {
    try {
      // 還原原始數據
      this.data[rowIndex] = this.clonedItems[rowData[this.dataKey]];

      // 清理臨時存儲
      delete this.clonedItems[rowData[this.dataKey]];

      // 重置編輯行索引
      this.editingRow = null;

      // 觸發取消事件
      this.cancel.emit(rowData);

      // 觸發變更檢測
      this.cdr.detectChanges();
    } catch (error) {
      console.error('取消編輯行時出錯：', error);
    }
  }

  // 新增初始化方法，確保編輯狀態處理正確
  initializeDetailArrays() {
    if (this.data && this.data.length > 0) {
      this.data.forEach(rowData => {
        // 確保每筆資料都有明細陣列
        if (!rowData[this.detailKey]) {
          rowData[this.detailKey] = [];
        }
      });
    }
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

  // 內層新增明細項目處理
  onAddDetailItem(parentData: any, rowIndex: number) {
    // 先檢查是否正在編輯中
    if (this.editingRow !== null || this.editingDetail !== null) {
      console.warn('請先完成當前編輯操作');
      return;
    }

    // 觸發外部事件，讓父組件處理
    this.addDetailItem.emit(parentData);

    // 如果需要內部自己處理新增，可以使用以下程式碼
    // // 建立新明細項目
    // const newDetailItem = { ...this.defaultNewDetailItem };
    // // 若需要自動生成ID
    // if (!newDetailItem.id) {
    //   newDetailItem.id = this.generateNewDetailId(parentData);
    // }

    // // 如果明細陣列不存在則建立
    // if (!parentData[this.detailKey]) {
    //   parentData[this.detailKey] = [];
    // }

    // // 加入到明細陣列
    // parentData[this.detailKey].unshift(newDetailItem);

    // // 確保該行已展開
    // this.expandedRows[parentData[this.dataKey]] = true;

    // // 立即進入編輯模式
    // setTimeout(() => {
    //   this.onDetailEditInit(newDetailItem, parentData, rowIndex, 0);
    // }, 0);
  }
  // 詳細資料選項卡切換方法
  onDetailTabChange(rowData: any, tabId: string) {
    const rowKey = rowData[this.dataKey];
    this.detailSelectedTabs[rowKey] = tabId;
    this.detailTabChange.emit({ rowData, tabId });
  }

  // 獲取行的選中選項卡
  getDetailSelectedTab(rowData: any): string {
    const rowKey = rowData[this.dataKey];
    if (!this.detailSelectedTabs[rowKey]) {
      this.detailSelectedTabs[rowKey] = this.defaultDetailTab;
    }
    return this.detailSelectedTabs[rowKey];
  }

  // 獲取當前選中選項卡對應的詳細資料列
  getDetailColumnsForTab(rowData: any): ColumnDef[] {
    const selectedTab = this.getDetailSelectedTab(rowData);
    if (this.detailColumnsMap && this.detailColumnsMap[selectedTab]) {
      return this.detailColumnsMap[selectedTab];
    }
    return this.detailColumns; // 預設使用原有的 detailColumns
  }
}
