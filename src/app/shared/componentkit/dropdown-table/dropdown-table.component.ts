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

export interface FieldsConfig {
  field: string;
  header: string;
  format?: (value: any) => string | number | null;
  mainDataField?: boolean;
}

@Component({
  selector: 'app-dropdown-table',
  templateUrl: './dropdown-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgFor, NgIf, AutoCompleteModule, FormsModule, ReactiveFormsModule, ControlMessagesComponent, InputTextModule, OverlayPanelModule, TableComponent]
})
export class DropdownTableComponent extends BasicKitComponent implements OnInit, OnDestroy {
  // 表單參數
  @Input() control = new FormControl;        // 必填
  @Input() submitted = false;            // 必填
  // 自動完成欄位
  @Input() suggestions: any[] = []; // 建議的資料  // 必填
  @Input() optionLabel = '';             // 必填
  @Input() optionValue = '';             // 必填
  @Input() templateLabel = ''; // 自訂 Label 模板
  @Input() fieldsConfig: FieldsConfig[] = []; // 要顯示在 p-autoComplete 下方的欄位配置
  @Output() inputValueChanged = new EventEmitter<Record<string, string>>(); // 方法:輸入p-autoComplete事件
  // OverlayPanel
  @ViewChild('op') op: OverlayPanel | undefined;
  private destroy$ = new Subject<void>();      // 訂閱，為了監聽表單改變
  @Input() formGroup!: FormGroup;          // 下拉要輸入的form 必填
  @Input() dialogData: any = [];           // 下拉table 的資料 必填
  @Input() loading = false;
  selectedItems: any;
  @Input() dialogColumns: Column[] = [];       // 下拉table 的欄位配置 必填
  @Output() formValueChanged = new EventEmitter<any>(); // 表單改變事件
  @Input() totalRecords = 0;             // 總筆數
  @Output() select = new EventEmitter<any>(); // 選擇事件
  @Input() lazy = true;                  // 是否啟用分頁
  // 新增一個 Subject 來處理 debounce
  private inputChangeSubject = new Subject<Record<string, string>>();

  ngOnInit(): void {
    this.updateControlState(this.control);
    this.formGroup.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(value => {
      const hasInputValue = Object.values(value).some(
        (val) => val !== null && val !== undefined && val !== '' && (!Array.isArray(val) || val.length > 0)
      );
      if (hasInputValue) {
        this.formValueChanged.emit(value);
      }
    });

    // 訂閱 inputChangeSubject，並應用 debounceTime
    this.inputChangeSubject.pipe(
      debounceTime(300), // 設定 300 毫秒的延遲
      takeUntil(this.destroy$) // 確保組件銷毀時取消訂閱
    ).subscribe(value => {
      this.inputValueChanged.emit(value); // 延遲後才觸發 EventEmitter
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange() {
    if (this.control.value === null || this.control.value === undefined || this.control.value === '') {
      this.suggestions = [];
      return;
    }
    // 不再直接 emit，而是將值發送到 inputChangeSubject
    this.inputChangeSubject.next({ [this.optionValue]: this.control.value });
  }

  getFieldValue(field: FieldsConfig): string {
    // 新增空值檢查
    if (this.control.value === null || this.control.value === undefined) {
      return '';
    }

    let selectedValue: string;
    if (typeof this.control.value === 'string') {
      selectedValue = this.control.value;
    } else if (typeof this.control.value === 'object') {
      // 這裡也需要檢查 this.control.value 是否為 null 或 undefined
      // 在最前面已經檢查過了，所以這裡可以放心地使用
      selectedValue = this.control.value[this.optionValue];
    } else {
      return ''; // 如果 control.value 不是字串也不是物件，則返回空字串
    }

    const selectedSuggestion = this.suggestions.find((item: any) => item[this.optionValue] === selectedValue);

    if (selectedValue && selectedSuggestion && this.suggestions && this.optionValue) {
      if (selectedSuggestion[field.field] !== undefined) {
        if (field.format) {
          return field.format(selectedSuggestion[field.field]) as string;
        } else {
          return selectedSuggestion[field.field];
        }
      }
    }

    return '';
  }

  onSelectionChange(event: TableRowSelectEvent) {
    this.selectedItems = event.data;
    this.select.emit(event.data);
    this.suggestions = [...this.dialogData]
    this.control.setValue(this.optionValue ? this.selectedItems[this.optionValue] : this.selectedItems);
    this.op?.hide();
    this.selectedItems = [];
    this.formGroup.reset();
  }

  onLazyLoadData(event: LazyLoadEvent, dataForm: FormGroup) {
    dataForm.patchValue({
      pageSize: event.pageSize,
      pageIndex: event.pageIndex,
      SortBy: event.SortBy
    });
  }
}
