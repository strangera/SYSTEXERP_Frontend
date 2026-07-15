import { NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldStateDirective } from '@shared/directive/field-state.directive';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-dropdown-range',
  standalone: true,
  imports: [
    NgIf,
    InputGroupModule,
    FormsModule,
    DropdownComponent,
    ReactiveFormsModule,
    NgStyle
  ],
  templateUrl: './dropdown-range.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [FieldStateDirective],
})
export class DropdownRangeComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  // 必填欄位
  @Input() label = '';
  @Input() showLabel = true;
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() controlName = '';
  @Input() startControlName = '';
  @Input() endControlName = '';
  @Input() startControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl = new FormControl(); // 結束值的 FormControl
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
  @Input() loading = false;// 是否載入中
  @Input() optionLabel = ''; // 資料的 Label
  @Input() optionValue = ''; // 資料的 Value
  @Input() submitted = false;
  // PrimeNG 下拉選單屬性
  @Input() showClear = true; // 是否顯示清除按鈕
  @Input() filter = true; // 是否啟用過濾功能
  // 自訂屬性
  @Input() errorForGroup = false;
  @Input() templateLabel = ''; // 自訂 Label 模板
  // 觸發事件
  @Output() startChangeEvent = new EventEmitter<DropdownChangeEvent>();
  @Output() endChangeEvent = new EventEmitter<DropdownChangeEvent>();

  ngOnInit(): void {
    this.fieldState.checkRequiredValidator(this.startControl, 0);
    this.fieldState.checkRequiredValidator(this.endControl, 1);
    // 監聽開始值變化
    this.startControl.valueChanges.subscribe(() => {
      this.validateRange();
    });

    // 監聽結束值變化
    this.endControl.valueChanges.subscribe(() => {
      this.validateRange();
    });
  }

  onStartDropdownChange(event: DropdownChangeEvent) {
    this.startChangeEvent.emit(event);
  }
  onEndDropdownChange(event: DropdownChangeEvent) {
    this.endChangeEvent.emit(event);
  }

  /**
   * 範圍驗證：開始必須小於等於結束
   * 支援 String (0-Z) 與 Number 比較
   */
  validateRange() {
    const startVal = this.startControl.value;
    const endVal = this.endControl.value;

    // 取得目前 startControl 所有的錯誤 (保留既有的必填等錯誤)
    const errors = this.startControl.errors || {};

    // 只有在兩者都有值的情況下才執行區間驗證
    if (startVal !== null && startVal !== undefined && startVal !== '' &&
      endVal !== null && endVal !== undefined && endVal !== '') {

      // 直接使用 JavaScript 的大於比較，字串會按字典順序 (0-9 < A-Z)，數字則按數值比較
      if (startVal > endVal) {
        // 設定錯誤標記
        this.startControl.setErrors({ ...errors, textRange: true });
      } else {
        // 移除錯誤標記
        if (errors['textRange']) {
          delete errors['textRange'];
        }
        const remainingErrors = Object.keys(errors).length > 0 ? errors : null;
        this.startControl.setErrors(remainingErrors);
      }
    } else {
      // 若其中一邊為空，移除此欄位的區間錯誤標記
      if (errors['textRange']) {
        delete errors['textRange'];
        const remainingErrors = Object.keys(errors).length > 0 ? errors : null;
        this.startControl.setErrors(remainingErrors);
      }
    }
  }
}
