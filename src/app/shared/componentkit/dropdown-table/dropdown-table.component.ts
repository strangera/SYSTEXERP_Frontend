import { NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
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
  imports: [NgFor, NgIf, AutoCompleteModule, FormsModule, ReactiveFormsModule, ControlMessagesComponent, InputTextModule, OverlayPanelModule, TableComponent, ButtonModule]
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
  private readonly destroy$ = new Subject<void>();      // 訂閱，為了監聽表單改變
  @Input() formGroup?: FormGroup;          // 下拉要輸入的form 必填
  @Input() dialogData: any = [];           // 下拉table 的資料 必填
  @Input() loading = false;
  selectedItems: any;
  @Input() dialogColumns: Column[] = [];       // 下拉table 的欄位配置 必填
  @Output() formValueChanged = new EventEmitter<any>(); // 表單改變事件
  @Input() totalRecords = 0;             // 總筆數
  @Output() select = new EventEmitter<any>(); // 選擇事件
  @Input() lazy = true;                  // 是否啟用分頁
  private readonly inputChangeSubject = new Subject<Record<string, string>>();
  private initialLoadDone = false;
  private suppressNextFocus = false;

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
      if (this.optionValue) {
        // 情況二：如果 optionValue 有傳入，control.value 是該屬性的值。
        // 需從 suggestions 中尋找完整的物件。
        const selectedValue = this.control.value[this.optionValue];
        selectedData = this.suggestions.find((item: any) => item[this.optionValue] === selectedValue);
      } else {
        selectedData = this.control.value;
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
  hideOverlay(): void {
    this.suppressNextFocus = true;
    this.op?.hide();
  }

  onFocusAndInitialLoad(event: Event): void {
    // 1. 同步阻止事件冒泡，不讓點擊訊號繼續往外擴散
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.suppressNextFocus) {
      this.suppressNextFocus = false;
      return;
    }

    // 2. 【核心修正】利用 setTimeout 延遲執行，確保在 PrimeNG 所有內建焦點事件處理完後才打開
    setTimeout(() => {
      if (this.showOverlay && this.op) {
        // 檢查目前是否已經開啟，如果沒開啟再打開，避免重複 toggle 閃爍
        // 註：有些版本的 PrimeNG op.el.nativeElement 存在時代表已開啟
        this.op.show(event);
      }
    }, 50); // 延遲 50ms 避開事件競爭

    // 3. 處理初次載入資料
    if (!this.initialLoadDone && (!this.dialogData || this.dialogData.length === 0)) {
      const emitValue = this.formGroup ? this.formGroup.value : { [this.optionLabel]: this.control.value };
      this.formValueChanged.emit(emitValue);
    }
    this.initialLoadDone = true;
  }

  onValueChange(event: AutoCompleteSelectEvent) {
    this.select.emit(event.value);
  }
}
