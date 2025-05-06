import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { Subject, takeUntil } from 'rxjs';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Column } from '../table/table.model';

export interface FieldsConfig {
  field: string;
  header: string;
  format?: (value: any) => string | number | null;
  mainDataField?: boolean;
}

@Component({
  selector: 'app-dropdown-table',
  templateUrl: './dropdown-table.component.html',
  styleUrl: './dropdown-table.component.scss'
})
export class DropdownTableComponent extends BasicKitComponent implements OnInit, OnDestroy {
  @ViewChild('op') op: OverlayPanel | undefined;
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() optionLabel: string | undefined; // 資料的 Label
  @Input() optionValue: string | undefined; // 資料的 Value
  @Input() suggestions: any[] = []; // 父層根據 API 結果過濾後的 suggestions
  @Input() fieldsConfig: FieldsConfig[] = []; // 要顯示在 p-autoComplete 下方的欄位配置
  @Input() opForm!: FormGroup;
  @Input() columns: Column[] = []; // 表格的欄位配置
  @Input() selectedItems: any = []; // 選擇的項目

  @Output() inputValueChanged = new EventEmitter<string>(); // 新增 Output 事件
  @Output() formValueChanged = new EventEmitter<FormGroup>(); // 監聽 form 變化的 Output

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.updateControlState(this.control);
    if (this.opForm) {
      this.opForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => {
        this.formValueChanged.emit(value);
      });
    }
  }
  onSelectionChange(event: any) {
    if (event.length > 0) {
      this.selectedItems = event;
      this.control.setValue(this.selectedItems[0]?.[this.optionValue || '']);
      this.op?.hide();
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  onInputChange(event: any) {
    this.selectedItems = []
    this.control.setValue(event.target.value); // 更新控制項的值
    this.inputValueChanged.emit(this.control.value); // 發射輸入框的值
  }

  getFieldValue(field: FieldsConfig): string {
    const selectedSuggestion = this.suggestions.find((item: any) => item[this.optionValue || ''] === this.control.value);
    if (this.control.value && selectedSuggestion && this.suggestions && this.optionValue) {
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
}
