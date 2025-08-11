import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { TableRowSelectEvent } from 'primeng/table';
import { Column, LazyLoadEvent } from '../table/table.model';
import { NgFor, NgIf } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { InputTextModule } from 'primeng/inputtext';
import { TableComponent } from '../table/table.component';

export interface DisplayFieldConfig {
  fieldName: string;
  displayLabel: string;
  formatValue?: (value: any) => string | number | null;
  isPrimaryField?: boolean;
}

@Component({
  selector: 'app-selector-panel',
  templateUrl: './selector-panel.component.html',
  styleUrl: './selector-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgFor, NgIf, AutoCompleteModule, FormsModule, ReactiveFormsModule, ControlMessagesComponent, InputTextModule, OverlayPanelModule, TableComponent]
})
export class SelectorPanelComponent extends BasicKitComponent implements OnInit, OnDestroy {
  // 🎯 表單控制相關
  @Input() valueControl = new FormControl();           // 主要值控制器
  @Input() isSubmitted = false;                        // 表單提交狀態

  // 🎯 自動完成建議相關
  @Input() autoCompleteItems: any[] = [];             // 自動完成的建議項目
  @Input() valuePropertyName = '';                     // 用於取值的屬性名稱
  @Input() labelPropertyName = '';                     // 用於顯示的屬性名稱
  @Input() displayFieldsConfig: DisplayFieldConfig[] = []; // 顯示欄位的配置
  @Output() searchInputChanged = new EventEmitter<Record<string, string>>(); // 搜尋輸入變更事件

  @Output() itemSelected = new EventEmitter<any>();    // 🎯 項目選擇事件
  @Output() valueChanged = new EventEmitter<{ oldValue: any, newValue: any, selectedItem: any }>(); // 🎯 值變更事件
  @Output() selectionChanged = new EventEmitter<any>(); // 🎯 選擇變更事件

  // 🎯 覆蓋面板相關
  @ViewChild('selectorOverlay') selectorOverlay: OverlayPanel | undefined;
  private unsubscribe$ = new Subject<void>();
  @Input() searchForm!: FormGroup;                     // 搜尋表單
  @Input() panelDataSource: any = [];                 // 面板內的資料來源
  @Input() isDataLoading = false;                     // 資料載入狀態
  selectedRecord: any;                                 // 目前選中的記錄
  @Input() panelTableColumns: Column[] = [];          // 面板表格的欄位設定
  @Output() searchFormChanged = new EventEmitter<any>(); // 搜尋表單變更事件
  @Input() totalDataCount = 0;                        // 總資料筆數

  ngOnInit(): void {
    this.updateControlState(this.valueControl);

    // 監聽搜尋表單變更
    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      takeUntil(this.unsubscribe$)
    ).subscribe(formValue => {
      const hasValidInput = Object.values(formValue).some(
        (val) => val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0)
      );
      if (hasValidInput) {
        this.searchFormChanged.emit(formValue);
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // 🎯 處理自動完成輸入變更
  onAutoCompleteInputChange() {
    if (this.valueControl.value === null || this.valueControl.value === undefined || this.valueControl.value === '') {
      this.autoCompleteItems = [];
      return;
    }
    this.searchInputChanged.emit({ [this.valuePropertyName]: this.valueControl.value });
  }

  // 🎯 根據設定取得欄位顯示值
  getDisplayFieldValue(fieldConfig: DisplayFieldConfig): string {
    let currentSelectedValue: string;

    if (typeof this.valueControl.value === 'string') {
      currentSelectedValue = this.valueControl.value;
    } else if (typeof this.valueControl.value === 'object') {
      currentSelectedValue = this.valueControl.value[this.valuePropertyName];
    } else {
      return '';
    }

    const matchedItem = this.autoCompleteItems.find((item: any) =>
      item[this.valuePropertyName] === currentSelectedValue
    );

    if (currentSelectedValue && matchedItem && this.autoCompleteItems && this.valuePropertyName) {
      if (matchedItem[fieldConfig.fieldName] !== undefined) {
        if (fieldConfig.formatValue) {
          return fieldConfig.formatValue(matchedItem[fieldConfig.fieldName]) as string;
        } else {
          return matchedItem[fieldConfig.fieldName];
        }
      }
    }
    return '';
  }

  // 🎯 處理表格行選擇事件
  onTableRowSelected(event: TableRowSelectEvent) {
    console.log('🎯 Selector panel - 表格行被選擇:', event.data);

    const oldValue = this.valueControl.value;
    const selectedItem = event.data;
    const newValue = this.valuePropertyName ? selectedItem[this.valuePropertyName] : selectedItem;

    // 🎯 更新控制器值
    this.valueControl.setValue(newValue);

    // 🎯 更新內部狀態
    this.selectedRecord = selectedItem;
    this.autoCompleteItems = [...this.panelDataSource];

    // 🚨 關鍵：發出包含完整選擇資料的事件
    this.itemSelected.emit(selectedItem);

    this.valueChanged.emit({
      oldValue: oldValue,
      newValue: newValue,
      selectedItem: selectedItem  // 🎯 這個很重要！
    });

    this.selectionChanged.emit(selectedItem);

    console.log('✅ Selector panel - 發出事件:', {
      itemSelected: selectedItem,
      valueChanged: { oldValue, newValue, selectedItem }
    });

    // 🎯 清理並關閉面板
    this.selectorOverlay?.hide();
    this.panelDataSource = [];
    this.selectedRecord = [];
    this.searchForm.reset();
  }

  // 🎯 處理分頁載入事件
  onPaginationLoad(event: LazyLoadEvent, searchFormGroup: FormGroup) {
    console.log('📄 SelectorPanel 收到分頁事件:', event);
    console.log('🚨 DEBUG - event:', event);
    console.log('🚨 DEBUG - 當前表單值:', searchFormGroup.value);

    // 🎯 修正：將 1-based 轉為 0-based，並正確處理 SortBy
    const pageIndex = Math.max(0, (event.pageIndex || 1) - 1);

    searchFormGroup.patchValue({
      pageSize: event.pageSize || 10,
      pageIndex: pageIndex,
      SortBy: event.SortBy || []  // 🎯 用大寫的 SortBy，傳陣列
    }, { emitEvent: false });

    console.log('📋 更新後的表單值:', searchFormGroup.value);

    this.triggerSearch(searchFormGroup);
  }

  // 🎯 新增：triggerSearch 方法（在 SelectorPanel 中加入）
  private triggerSearch(searchFormGroup: FormGroup): void {
    const formValue = searchFormGroup.value;

    console.log('🚀 SelectorPanel 觸發搜尋:', formValue);

    // 檢查是否有有效的搜尋條件（排除分頁參數）
    const searchConditions = { ...formValue };
    delete searchConditions.pageSize;
    delete searchConditions.pageIndex;
    delete searchConditions.SortBy;

    const hasValidInput = Object.values(searchConditions).some(
      (val) => val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0)
    );

    // 如果有搜尋條件或者是分頁操作，就發出搜尋事件
    if (hasValidInput || formValue.pageIndex > 0) {
      console.log('✅ 發出搜尋表單變更事件');
      this.searchFormChanged.emit(formValue);
    } else {
      console.log('📋 載入預設資料');
      this.searchFormChanged.emit({
        pageSize: formValue.pageSize || 10,
        pageIndex: 0,
        SortBy: formValue.SortBy || []
      });
    }
  }

  // 🎯 打開選擇器面板
  // 在 selector-panel.component.ts 中修改：
  openSelectorPanel(event: Event) {
    this.selectorOverlay?.toggle(event);

    // 🎯 加入這段：確保表單有分頁參數
    if (this.searchForm) {
      const currentValue = this.searchForm.value;

      // 如果沒有分頁參數，就設定預設值
      if (currentValue.pageSize === undefined || currentValue.pageIndex === undefined) {
        this.searchForm.patchValue({
          pageSize: 10,
          pageIndex: 0,  // 0-based
          SortBy: [{ field: this.valuePropertyName, order: 1 }]
        }, { emitEvent: false });

        console.log('🔧 初始化分頁參數:', this.searchForm.value);

        // 立即觸發一次搜尋
        this.triggerSearch(this.searchForm);
      }
    }
  }
  // 🎯 關閉選擇器面板
  closeSelectorPanel() {
    this.selectorOverlay?.hide();
  }
}
