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
  // 可選：對應起/迄「年度」的 FormControl（值可為 Date 或 number）。
  // 沒有傳入時，validateRange() 維持原本純數字/字串比較，不影響既有頁面行為；
  // 有傳入且兩邊都能取到年度時，改用「年度*1000+期別」複合值比較，涵蓋跨年度區間。
  @Input() startYearControl: FormControl | null = null;
  @Input() endYearControl: FormControl | null = null;
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

    // 有傳入年度 Input 時，年度異動（不動期別本身）也要重新驗證區間
    this.startYearControl?.valueChanges.subscribe(() => {
      this.validateRange();
    });
    this.endYearControl?.valueChanges.subscribe(() => {
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

      if (this.isRangeInvalid(startVal, endVal)) {
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

  /**
   * 判斷「起 > 迄」是否成立。
   * 沒有傳入 startYearControl/endYearControl，或任一邊取不到年度時：
   *   維持原本邏輯，直接用 JS 大於比較（字串按字典順序 0-9 < A-Z，數字按數值比較）。
   * 兩邊都能取到年度時：改用「年度*1000+期別」複合值比較，涵蓋跨年度區間
   *（週次 1~53、半年別 1~2 都遠小於 1000，複合值排序不會互相干擾）。
   */
  private isRangeInvalid(startVal: string | number, endVal: string | number): boolean {
    const startYear = this.extractYear(this.startYearControl?.value);
    const endYear = this.extractYear(this.endYearControl?.value);

    if (startYear !== null && endYear !== null) {
      return (startYear * 1000 + Number(startVal)) > (endYear * 1000 + Number(endVal));
    }

    return startVal > endVal;
  }

  /**
   * 年度 FormControl 的值可能是 Date（calendar-range dateYearRange）或 number，統一轉成年度數字。
   */
  private extractYear(val: unknown): number | null {
    if (val === null || val === undefined) return null;
    if (val instanceof Date) return val.getFullYear();
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  }
}
