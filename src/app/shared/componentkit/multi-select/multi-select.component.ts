import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    MultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ControlMessagesComponent,
  ],
})
export class MultiSelectComponent extends BasicKitComponent implements OnInit {
  @ViewChild('multiSelect') multiSelect!: MultiSelect;
  // 新增：唯讀模式
  @Input() readonly = false;
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() set options(value: any[] | null) {
    if (value !== null) {
      this.loading = false;
      this._options = value;
    } else {
      this.loading = true;
      this._options = [];
    }
  };
  get options(): any[] { return this._options; }
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue: string | undefined = ''; // 資料的 Value
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() loading = false;
  @Input() variant: 'filled' | 'outlined' = 'outlined';
  @Input() appendTo: HTMLElement | ElementRef | TemplateRef<any> | string | null | undefined | any = void 0;

  @Input() group = false; // 是否啟用分組
  @Input() optionGroupLabel = 'label'; // 分組的標籤欄位
  @Input() optionGroupChildren = 'items'; // 分組的子項目欄位
  @Input() selectedItemsLabel?: string;
  @Input() maxSelectedLabels = 3; // 預設值，可被覆寫
  @Input() filter = true;
  @Input() dataKey = this.optionValue;
  @Input() showClear = true;
  private _options: any[] = [];

  ngOnInit(): void {
    this.ensureControl();
    if (this.readonly) {
      this.control.disable();
    } else if (!this.control.disabled) {
      this.updateControlState(this.control);
    }
  }
  private ensureControl() {
    if (!this.control) {
      this.control = new FormControl();
    }
  }
  // 新增：取得選中項目的顯示文字
  get selectedItemsDisplayText(): string {
    const selectedValues = this.control.value;

    if (!selectedValues || !Array.isArray(selectedValues) || selectedValues.length === 0) {
      return '';
    }

    if (!this.options || this.options.length === 0) {
      return selectedValues.join(', ');
    }

    const selectedLabels: string[] = [];

    // 處理分組選項
    if (this.group) {
      this.options.forEach(group => {
        const groupItems = group[this.optionGroupChildren] || [];
        groupItems.forEach((item: any) => {
          const itemValue = this.optionValue ? item[this.optionValue] : item;
          if (selectedValues.includes(itemValue)) {
            const itemLabel = this.optionLabel ? item[this.optionLabel] : item;
            selectedLabels.push(itemLabel);
          }
        });
      });
    } else {
      // 處理一般選項
      selectedValues.forEach(value => {
        const selectedOption = this.options.find(option => {
          const optionValue = this.optionValue ? option[this.optionValue] : option;
          return optionValue === value;
        });

        if (selectedOption) {
          const label = this.optionLabel ? selectedOption[this.optionLabel] : selectedOption;
          selectedLabels.push(label);
        } else {
          // 如果找不到對應的選項，直接使用值
          selectedLabels.push(value?.toString() || '');
        }
      });
    }

    return selectedLabels.join(', ');
  }

  // 新增：取得 multi-select 的 CSS 類別
  get multiSelectClasses(): string {
    const classes = ['w-full'];

    if (this.readonly) {
      classes.push('readonly-field');
    }

    if (this.submitted && this.control.errors) {
      classes.push('ng-dirty', 'ng-invalid');
    }

    return classes.join(' ');
  }
}
