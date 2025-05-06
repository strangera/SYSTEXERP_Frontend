import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { OverlayPanel } from 'primeng/overlaypanel';

export interface FieldsConfig {
  field: string;
  header: string;
  format?: (value: any) => string | number | null;
  mainDataField?: boolean;
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent extends BasicKitComponent {
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() optionLabel: string | undefined; // 資料的 Label
  @Input() optionValue: string | undefined; // 資料的 Value

  @Input() options: any = [];
  @Input() suggestions: any[] = []; // 父層根據 API 結果過濾後的 suggestions
  filteredOptions: any = [];

  @Input() fieldsConfig: FieldsConfig[] = []; // 要顯示在 p-autoComplete 下方的欄位配置

  @Output() inputValueChanged = new EventEmitter<string>(); // 新增 Output 事件

  filterOptions(event: AutoCompleteCompleteEvent) {
    const filtered = [];
    const query = event.query ? event.query.toLowerCase() : '';
    if (this.options && this.optionLabel) {
      for (const option of (this.options)) {
        if (option[this.optionLabel] && option[this.optionLabel].toString().toLowerCase().startsWith(query)) {
          filtered.push(option);
        }
      }
    }
    this.filteredOptions = filtered;
  }

  onInputChange(event: any) {
    this.inputValueChanged.emit(this.control.value); // 發射輸入框的值
  }

  getFieldValue(field: FieldsConfig): string {
    // const firstItem = this.options.find((item: any) => item[this.optionLabel] === field.field);
    // return firstItem ? firstItem[field.field] : '';
    return '';
  }
}
