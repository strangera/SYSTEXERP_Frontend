import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { TableComponent } from '../table/table.component';
import { Column, LazyLoadEvent } from '../table/table.model';

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
  @Input() showOverlay = true;// 控制是否顯示 Overlay Panel，預設為 true (打開)
  @ViewChild('op') op: OverlayPanel | undefined;
  private destroy$ = new Subject<void>();      // 訂閱，為了監聽表單改變
  @Input() formGroup?: FormGroup;          // 下拉要輸入的form 必填
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
    if (this.formGroup) {
      this.formGroup.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(value => {
        this.formValueChanged.emit(value);
      });
    }
    this.inputChangeSubject.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(value => {
      this.inputValueChanged.emit(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange() {
    const inputValue = this.control.value || '';
    this.inputChangeSubject.next({ [this.optionLabel]: inputValue });
    if (this.showOverlay) this.op?.hide();
  }

  getFieldValue(field: FieldsConfig): string {
    // 新增空值檢查
    if (this.control.value === null || this.control.value === undefined) return '';
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

  onSelectionChange(event: any) {
    console.log('dropdown-table selectionChange event =', event);
    const rowData = Array.isArray(event) ? event[0] : event;
    if (!rowData) {
      return;
    }
    this.handleRowSelected(rowData);
  }

  // 直接點整列（itemClick）時觸發
  onRowClick(rowData: any) {
    console.log('dropdown-table rowClick rowData =', rowData);
    if (!rowData) return;
    this.handleRowSelected(rowData);
  }

  private handleRowSelected(rowData: any) {
    console.log('dropdown-table handleRowSelected rowData =', rowData);
    this.selectedItems = rowData;
    this.select.emit(rowData);
    this.suggestions = [...this.dialogData];
    // 當 optionValue 為空時，設定完整的物件
    this.control.setValue(this.optionValue ? rowData[this.optionValue] : rowData);
    this.op?.hide();
    this.selectedItems = [];
    this.formGroup?.reset();
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
    // 【修改點】只有當 showOverlay 為 true 時，才觸發 Overlay Panel
    if (this.showOverlay) {
      this.op?.toggle(event);
    }
    // 如果表格資料為空，且尚未載入過，則發送一次空的查詢請求，讓父元件載入所有資料
    if (!this.initialLoadDone && (!this.dialogData || this.dialogData.length === 0)) {
      // 修改：如果沒有 formGroup，就傳空物件或目前的 control 值
      const emitValue = this.formGroup ? this.formGroup.value : { [this.optionLabel]: this.control.value };
      this.formValueChanged.emit(emitValue);
    }
    this.initialLoadDone = true;
  }

  onValueChange(event: AutoCompleteSelectEvent) {
    this.select.emit(event.value);
  }
}
