import { NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Column, LazyLoadEvent } from '@others/component/table/table.model';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TableLazyLoadEvent, TableModule } from 'primeng/table'; // 引入原生的 TableModule
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { FieldStateDirective } from '@shared/directive/field-state.directive';
import { focusNextFocusable } from '@shared/directive/enter-to-tab.util';

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
  imports: [
    NgClass, NgFor, NgIf, FormsModule, ReactiveFormsModule,
    AutoCompleteModule, InputTextModule, OverlayPanelModule, ButtonModule,
    TableModule, // 替換為原生的 TableModule
  ],
  hostDirectives: [FieldStateDirective],
})
export class DropdownTableComponent implements OnInit, OnDestroy {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  @Input() control = new FormControl();
  @Input() submitted = false;

  // AutoComplete
  @Input() suggestions: any[] = [];
  @Input() optionLabel = '';
  @Input() optionValue = '';
  @Input() templateLabel = '';
  @Input() fieldsConfig: FieldsConfig[] = [];
  @Output() inputValueChanged = new EventEmitter<Record<string, string>>();
  // 選填：輸入框按下 Enter 時額外觸發（例如條碼槍掃描），預設仍會執行 focusNextFocusable 跳到下一欄位
  @Output() enterKey = new EventEmitter<Event>();

  // OverlayPanel 與 Table 基礎屬性
  @Input() showOverlay = true;
  @ViewChild('op') op: OverlayPanel | undefined;
  @Input() formGroup?: FormGroup;
  @Input() dialogData: any[] = [];
  @Input() loading = false;
  @Input() dialogColumns: Column[] = [];
  @Input() totalRecords = 0;
  @Input() lazy = true;
  @Output() formValueChanged = new EventEmitter<any>();
  @Output() select = new EventEmitter<any>();

  // 抽出與移植原本 app-table 需要的分頁與勾選控制參數
  @Input() showCheckBox = true;
  @Input() selectionMode: 'multiple' | 'single' | null | undefined = 'single';
  @Input() showPage = true;
  @Input() rows = 30;
  @Input() rowsPerPageOptions: any[] = [30, 60, 90];
  @Input() scrollHeight = '400px';
  @Output() lazyLoadData = new EventEmitter<LazyLoadEvent>();

  selectedItems: any;
  private readonly destroy$ = new Subject<void>();
  private readonly filterSubject$ = new Subject<string>();
  private initialLoadDone = false;
  private suppressNextFocus = false;
  protected readonly focusNextFocusable = focusNextFocusable;

  ngOnInit(): void {
    this.fieldState.updateControlState(this.control);

    // 處理 AutoComplete 鍵盤打字防抖
    this.filterSubject$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(inputValue => {
      this.inputValueChanged.emit({ [this.optionLabel]: inputValue });
      if (this.showOverlay && this.op?.overlayVisible) {
        this.op.hide();
      }
    });

    // 監聽 Overlay 內表單查詢欄位異動
    if (this.formGroup) {
      this.formGroup.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      ).subscribe(value => {
        this.formValueChanged.emit(value);
      });
    }
  }

  onCompleteMethod(event: { originalEvent: Event; query: string }): void {
    const queryText = event.query ? event.query.trim() : '';
    this.filterSubject$.next(queryText);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hideOverlay(): void {
    this.suppressNextFocus = true;
    this.op?.hide();
  }

  onFocusAndInitialLoad(event: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.suppressNextFocus) {
      this.suppressNextFocus = false;
      return;
    }
    setTimeout(() => {
      if (this.showOverlay && this.op) {
        this.op.show(event);
      }
    }, 50);

    if (!this.initialLoadDone && (!this.dialogData || this.dialogData.length === 0)) {
      const emitValue = this.formGroup ? this.formGroup.value : { [this.optionLabel]: this.control.value };
      this.formValueChanged.emit(emitValue);
    }
    this.initialLoadDone = true;
  }

  onAutoCompleteSelect(event: AutoCompleteSelectEvent): void {
    const selectedValue = typeof event.value === 'object' ? event.value[this.optionValue] : event.value;
    if (!selectedValue) return;

    const fullRowData = this.suggestions.find(item => item[this.optionValue] === selectedValue);
    if (fullRowData) {
      this.select.emit(fullRowData);
    }
  }

  /**
   * ⚡ 抽自 app-table 的單元格對齊與 cellClass 融合機制 ⚡
   */
  getTableCellClass(col: Column, rowData: any): Record<string, boolean> {
    const result: Record<string, boolean> = {
      'text-right': col.align === 'right' || col.style === 'text-right',
      'text-center': col.align === 'center' || (!col.align && !col.style),
      'text-left': col.align === 'left',
    };

    if (col.cellClass) {
      const extra = col.cellClass(rowData, col.field);
      if (typeof extra === 'string' && extra.trim()) {
        extra.trim().split(/\s+/).forEach(cls => {
          if (cls) result[cls] = true;
        });
      }
    }
    return result;
  }

  /**
   * 原生 p-table 的選取變更事件：多選持續更新 control 值；單選則選完立即關閉並重置查詢表單
   */
  onSelectionChange(event: any): void {
    this.selectedItems = event ?? [];
    this.select.emit(this.selectedItems);
    this.suggestions = [...this.dialogData];

    if (this.selectionMode === 'single') {
      const rowData = Array.isArray(this.selectedItems) ? this.selectedItems[0] : this.selectedItems;
      this.control.setValue(this.optionValue ? rowData?.[this.optionValue] : rowData);
      this.op?.hide();
      this.selectedItems = [];
      this.formGroup?.reset();
      return;
    }

    const items: any[] = Array.isArray(this.selectedItems) ? this.selectedItems : [];
    this.control.setValue(this.optionValue ? items.map(item => item[this.optionValue]) : items);
  }

  /**
   * 原生 p-table 懶加載驅動事件轉換
   */
  onPrimeTableLazyLoad(event: TableLazyLoadEvent): void {
    if (this.totalRecords === 0) return;
    const pageSize = event.rows && event.rows > 0 ? event.rows : 30;
    const pageIndex = (event.first ?? 0) / pageSize + 1;

    this.lazyLoadData.emit({
      pageIndex,
      pageSize,
      SortBy: (event.multiSortMeta as any) ?? [{ field: this.optionValue, order: 1 }]
    });
  }

  getFieldValue(field: FieldsConfig): string {
    if (this.control.value === null || this.control.value === undefined) return '';
    let selectedData: any;

    if (typeof this.control.value === 'object' && this.control.value !== null) {
      if (this.optionValue) {
        const selectedValue = this.control.value[this.optionValue];
        selectedData = this.suggestions.find((item: any) => item[this.optionValue] === selectedValue);
      } else {
        selectedData = this.control.value;
      }
    } else if (this.optionValue) {
      // eslint-disable-next-line eqeqeq
      selectedData = this.suggestions.find((item: any) => item[this.optionValue] == this.control.value);
    } else if (this.optionLabel) {
      selectedData = this.suggestions.find((item: any) => item[this.optionLabel] === this.control.value);
    }

    if (selectedData && selectedData[field.field] !== undefined) {
      const value = selectedData[field.field];
      return field.format ? (field.format(value) as string) : value;
    }
    return '';
  }
}
