import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlMessagesComponent } from '@shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '@shared/componentextends/basic-kit/basic-kit.component';
import { TableComponent } from '@shared/componentkit/table/table.component';
import { Column, LazyLoadEvent } from '@shared/componentkit/table/table.model';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TableRowSelectEvent } from 'primeng/table';
import { debounceTime, Subject, takeUntil } from 'rxjs';

export interface FieldsConfig {
  field: string;
  header: string;
  format?: (value: any) => string | number | null;
  mainDataField?: boolean;
}

@Component({
  selector: 'app-multiselect-table',
  templateUrl: './multiselect-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AutoCompleteModule,
    FormsModule,
    ReactiveFormsModule,
    ControlMessagesComponent,
    InputTextModule,
    OverlayPanelModule,
    TableComponent,
  ]
})
export class MultiselectTableComponent extends BasicKitComponent implements OnInit, OnDestroy {
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
  private inputChangeSubject = new Subject<Record<string, string>>();
  // 新增標記，判斷是否為第一次點擊
  private initialLoadDone = false;
  ngOnInit(): void {
    this.updateControlState(this.control);
    this.formGroup.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(value => {
      this.formValueChanged.emit(value);
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
    const inputValue = this.control.value || '';
    // 使用 optionLabel 作為 key，傳遞輸入的字串
    this.inputChangeSubject.next({ [this.optionLabel]: inputValue });
  }

  getFieldValue(field: FieldsConfig): string {
    // 新增空值檢查
    if (this.control.value === null || this.control.value === undefined) {
      return '';
    }

    let selectedData: any;

    if (typeof this.control.value === 'object' && this.control.value !== null) {
      // 情況一：如果 optionValue 未傳入（為空字串），control.value 就是選取的完整物件。
      if (!this.optionValue) {
        selectedData = this.control.value;
      } else {
        // 情況二：如果 optionValue 有傳入，control.value 是該屬性的值。
        // 需從 suggestions 中尋找完整的物件。
        const selectedValue = this.control.value[this.optionValue];
        selectedData = this.suggestions.find((item: any) => item[this.optionValue] === selectedValue);
      }
    } else if (typeof this.control.value === 'string' && this.optionLabel) {
      // 情況三：如果 control.value 是字串，且我們沒有設定 optionValue，
      // PrimeNG 預設將 optionLabel 的值寫入。
      // 需從 suggestions 中尋找完整的物件。
      selectedData = this.suggestions.find((item: any) => item[this.optionLabel] === this.control.value);
    }

    // 如果找到選取的資料物件 (selectedData)
    if (selectedData) {
      // 檢查 field 是否存在於選取的資料物件中
      if (selectedData[field.field] !== undefined) {
        const value = selectedData[field.field];
        if (field.format) {
          return field.format(value) as string;
        } else {
          return value;
        }
      }
    }

    return '';
  }

  onSelectionChange(event: TableRowSelectEvent) {
    this.selectedItems = event.data;
    this.select.emit(event.data);
    this.suggestions = [...this.dialogData]

    // 【修改處】當 optionValue 為空時，設定完整的物件
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
  // 【新增 onFocusAndInitialLoad】: 處理初次點擊時的載入邏輯
  onFocusAndInitialLoad(event: any) {
    // 觸發 Overlay Panel
    this.op?.toggle(event);

    // 如果表格資料為空，且尚未載入過，則發送一次空的查詢請求，讓父元件載入所有資料
    if (!this.initialLoadDone && (!this.dialogData || this.dialogData.length === 0)) {
      // 發出一個空值事件，讓父元件觸發初始載入 (loadVenData())
      this.formValueChanged.emit(this.formGroup.value);
    }
    this.initialLoadDone = true;
  }

  onValueChange(event: AutoCompleteSelectEvent) {
    this.select.emit(event.value);
  }
}
