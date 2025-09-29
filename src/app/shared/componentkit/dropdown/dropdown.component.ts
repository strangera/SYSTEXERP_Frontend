import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrl: './dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ControlMessagesComponent
  ]
})
export class DropdownComponent extends BasicKitComponent implements OnInit {
  @Input() readonly = false; // 新增：唯讀模式
  // 必填
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() set control(value: FormControl) { this._control = value; }
  @Input() set options(value: any[] | null) {
    // 當 options 收到資料時，停止載入
    if (value !== null) {
      this.loading = false;
      this._options = value;
    } else {
      // 當 options 收到 null 時，表示開始載入
      this.loading = true;
      this._options = []; // 清空選項，避免顯示舊資料
    }
  };
  get options(): any[] { return this._options; }
  private _options: any[] = [];
  @Input() optionLabel = 'label'; // 資料的 Label
  @Input() optionValue: string | undefined; // 資料的 Value
  @Input() customPlaceholder = '請選擇';
  @Input() submitted = false; // 檢查欄位是否標準
  // PrimeNG 下拉選單屬性
  @Input() showClear = true; // 是否顯示清除按鈕
  @Input() filter = true; // 是否啟用過濾功能
  @Input() disabled = false; // 是否禁用
  @Input() loading = false;// 是否載入中
  @Input() editable = true; // 是否可編輯輸入
  // 自訂屬性
  @Input() showErrorMessage = true;
  @Input() templateLabel = ''; // 自訂 Label 模板
  @Input() errorForGroup = false; // 是否為 FormGroup 的錯誤訊息
  // 觸發事件
  @Output() changeEvent = new EventEmitter<DropdownChangeEvent>();
  @Output() valueChange = new EventEmitter<any>(); //直接用 (valueChange) 拿到值
  private _control: FormControl = new FormControl();
  public get control(): FormControl { this.disabled && this._control.disable(); return this._control; }

  ngOnInit(): void {
    this.initControl(this.control);
  }
  onDropdownChange(event: DropdownChangeEvent) {
    if (this.readonly) return;
    this.changeEvent.emit(event);
    this.valueChange.emit(event.value);  // 同時 emit 純值
  }

  get selectedOptionLabel(): string {
    if (!this.control.value || !this.options || this.options.length === 0) {
      return '';
    }

    const selectedOption = this.options.find(option =>
      option[this.optionValue!] === this.control.value
    );

    if (selectedOption) {
      return this.templateLabel !== '' ?
        selectedOption[this.templateLabel] :
        selectedOption[this.optionLabel];
    }

    return this.control.value?.toString() || '';
  }

  // 新增：取得 dropdown 的 CSS 類別
  get dropdownClasses(): string {
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
