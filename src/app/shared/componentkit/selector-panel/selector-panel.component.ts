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
    this.selectedRecord = event.data;
    this.autoCompleteItems = [...this.panelDataSource];
    this.valueControl.setValue(this.valuePropertyName ? this.selectedRecord[this.valuePropertyName] : this.selectedRecord);
    this.selectorOverlay?.hide();
    this.panelDataSource = [];
    this.selectedRecord = [];
    this.searchForm.reset();
  }

  // 🎯 處理分頁載入事件
  onPaginationLoad(event: LazyLoadEvent, searchFormGroup: FormGroup) {
    searchFormGroup.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }

  // 🎯 打開選擇器面板
  openSelectorPanel(event: Event) {
    this.selectorOverlay?.toggle(event);
  }

  // 🎯 關閉選擇器面板
  closeSelectorPanel() {
    this.selectorOverlay?.hide();
  }
}
