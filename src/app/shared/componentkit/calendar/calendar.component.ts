import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '@shared/service/validation.service';
import { PrimeTemplate } from 'primeng/api';
import { CalendarModule, CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { ReadonlyCalendarDisplayComponent } from './readonly-calendar-display/readonly-calendar-display.component';

export type CalendarType = 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne';

const FORMAT_RULES: Record<string, { lengths: number[], chars: string[] }> = {
  timeOne: { lengths: [2], chars: [':'] }, // HH:mm
  dateOne: { lengths: [4, 7], chars: ['/', '/'] }, // YYYY/MM/DD
  dateTimeOne: { lengths: [4, 7, 10, 13], chars: ['/', '/', ' ', ':'] }, // YYYY/MM/DD HH:mm
  dateMonthOne: { lengths: [4], chars: ['/'] }, // YYYY/MM
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReadonlyCalendarDisplayComponent, NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent]
})
export class CalendarComponent extends BasicKitComponent implements OnInit, OnDestroy {
  private valueChangeSubscription?: Subscription;
  private _calendarType: CalendarType = 'dateOne';
  private readonly calendarMaxLength: Record<CalendarType, number> = {
    timeOne: 5,
    dateOne: 10,
    dateTimeOne: 16,
    dateMonthOne: 7,
    dateYearOne: 4
  };

  @Input() readonly = false;
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;

  // 使用 setter 確保 calendarType 變更時立即套用配置
  @Input()
  set calendarType(value: CalendarType) {
    this._calendarType = value;
    this.applyCalendarConfig();
  }
  get calendarType(): CalendarType {
    return this._calendarType;
  }

  // 改為較安全的預設值 (不顯示時間)
  @Input() timeOnly = false;
  @Input() showTime = false;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'date';
  @Input() showSeconds = false;
  @Input() minDate: Date | undefined | null = null;
  @Input() maxDate: Date | undefined | null = null;
  @Input() disabled = false;
  @Input() customPlaceholder = '請選擇';
  @Output() calendarEvent = new EventEmitter<any>();
  @Output() inputChange = new EventEmitter<string>();
  @Output() monthChangeEvent = new EventEmitter<CalendarMonthChangeEvent>();
  @Output() yearChangeEvent = new EventEmitter<CalendarYearChangeEvent>();
  @Input() helpMsg?: string;
  @Input() showErrorMessage = true;

  private readonly calendarConfig = {
    timeOne: { timeOnly: true, showTime: true, dateFormat: undefined, view: 'date', customPlaceholder: '請選擇時間' },
    dateOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm/dd', view: 'date', customPlaceholder: '請選擇日期' },
    dateTimeOne: { timeOnly: false, showTime: true, dateFormat: 'yy/mm/dd', view: 'date', customPlaceholder: '請選擇日期時間' },
    dateMonthOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm', view: 'month', customPlaceholder: '請選擇月份' },
    dateYearOne: { timeOnly: false, showTime: false, dateFormat: 'yy', view: 'year', customPlaceholder: '請選擇年份' },
  };

  /**
   * 套用 calendarType 對應的配置
   */
  private applyCalendarConfig(): void {
    const config = this.calendarConfig[this._calendarType];
    if (config) {
      this.timeOnly = config.timeOnly;
      this.showTime = config.showTime;
      this.dateFormat = config.dateFormat;
      this.view = config.view as 'date' | 'month' | 'year';

      const maxLen = this.calendarMaxLength[this._calendarType];
      this.maxLength = maxLen; // 這是 BasicKitComponent 的屬性，會連動影響 placeholder

      if (this.control) {
        // 更新驗證器，保留原有的，但加入 maxLength；若有 required 一併保留以維持 hasValidator(Validators.required) 為 true（標籤 * 顯示）
        const hadRequiredBefore = this.control.hasValidator(Validators.required);
        const currentValidators = this.control.validator ? [this.control.validator] : [];
        const newValidators = [...currentValidators, Validators.maxLength(maxLen)];
        if (hadRequiredBefore) {
          newValidators.push(Validators.required);
        }
        this.control.setValidators(newValidators);
        this.control.updateValueAndValidity({ emitEvent: false });
      }
      if (!this.customPlaceholder || this.customPlaceholder === '請選擇') {
        this.placeholder = config.customPlaceholder;
      }
    }
  }

  constructor(private validationService: ValidationService) {
    super();
  }

  ngOnInit() {
    this.initControl(this.control);

    // 1. 動態加入全形卡控驗證器
    const validators: any[] = [this.validationService.containsFullWidth.bind(this.validationService)];

    // 如果原本就有 validator，則合併
    if (this.control.validator) {
      validators.push(this.control.validator);
    }
    this.control.setValidators(validators);

    if (this.disabled) {
      this.control.disable();
    }

    // 確保配置已套用 (calendarType setter 可能在某些情況下沒有被觸發)
    this.applyCalendarConfig();

    // 處理自訂 placeholder
    if (this.customPlaceholder && this.customPlaceholder !== '請選擇') {
      this.placeholder = this.customPlaceholder;
    }

    // 🔧 處理字串格式的日期，轉為 Date 物件並移除時間
    if (this.control.value && typeof this.control.value === 'string') {
      try {
        const shouldKeepTime = this.showTime || this.calendarType === 'dateTimeOne' || this.calendarType === 'timeOne';
        const dateValue = this.parseDateWithOptionalTime(this.control.value, shouldKeepTime);
        // const dateValue = this.parseDateWithoutTime(this.control.value); // !!!有問題的方法，會導致時間被強制歸0
        if (dateValue) {
          this.control.setValue(dateValue, { emitEvent: false });
        }
      } catch (error) {
        console.warn('日期格式轉換失敗:', this.control.value);
      }
      // !!!此處造成時間被強制歸0，請在自己的作業提交前做轉換避免在共通元件做處理(不懂之處請參考PrimeNg文檔)
      // } else if (this.control.value instanceof Date && !this.timeOnly) {
      //   // 如果已經是 Date 物件，確保移除時間（timeOnly 模式需保留時間）
      //   const dateOnly = new Date(
      //     this.control.value.getFullYear(),
      //     this.control.value.getMonth(),
      //     this.control.value.getDate()
      //   );
      //   if (dateOnly.getTime() !== this.control.value.getTime()) {
      //     this.control.setValue(dateOnly, { emitEvent: false });
      //   }
    }
    // 監聽 control 值變化
    this.valueChangeSubscription = this.control.valueChanges.subscribe((val) => {
      // 關鍵：攔截空字串並轉為 null
      if (val === '') {
        this.control.setValue(null, { emitEvent: false }); // 使用 emitEvent: false 避免無限循環
      }
      this.cdr.markForCheck();
    });

    this.cdr.markForCheck();
  }

  onClose() {
    this.calendarEvent.emit(this.control.value);
  }

  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const config = FORMAT_RULES[this.calendarType];

    if (!config) {
      this.inputChange.emit(value);
      return;
    }

    // 1. 如果是刪除操作，不處理，避免刪不掉
    if (event.inputType === 'deleteContentBackward') {
      this.inputChange.emit(value);
      return;
    }

    // 2. 處理「貼上」或「一次性輸入多個字元」的情況
    // 如果輸入的資料長度 > 1，或者目前的 value 只有數字但長度已經超過觸發點
    if (event.inputType === 'insertFromPaste' || (event.data && event.data.length > 1)) {
      input.value = this.formatFullString(value, this.calendarType);
      this.inputChange.emit(input.value);
      return;
    }

    // 3. 原本的單一按鍵自動補位邏輯
    const index = config.lengths.indexOf(value.length);
    if (index !== -1) {
      const charToAppend = config.chars[index];
      if (value.charAt(value.length - 1) !== charToAppend) {
        // 注意：這裡如果使用者打全形，長度判斷會受影響，建議只在半形時補位
        if (!/[！-～　]/.test(value)) {
          input.value = value + charToAppend;
        }
      }
    }

    this.inputChange.emit(input.value);
  }

  /**
   * 核心：將純數字字串根據類型轉換為帶符號的格式
   */
  private formatFullString(value: string, type: CalendarType): string {
    // 先提取所有數字
    const nums = value.replace(/\D/g, '');

    switch (type) {
      case 'dateOne': // 20251023 -> 2025/10/23
        if (nums.length >= 8) {
          return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)}`;
        }
        return value;

      case 'dateMonthOne': // 202510 -> 2025/10
        if (nums.length >= 6) {
          return `${nums.substring(0, 4)}/${nums.substring(4, 6)}`;
        }
        return value;

      case 'timeOne': // 1430 -> 14:30
        if (nums.length >= 4) {
          return `${nums.substring(0, 2)}:${nums.substring(2, 4)}`;
        }
        return value;

      case 'dateTimeOne': // 202510231430 -> 2025/10/23 14:30
        if (nums.length >= 12) {
          return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)} ${nums.substring(8, 10)}:${nums.substring(10, 12)}`;
        }
        return value;

      default:
        return value;
    }
  }

  onBlur(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (!value) {
      // this.control.setValue(null);
      return;
    }

    // 取得補齊後的結果
    const completedValue = this.fillIncompleteDate(value, this.calendarType);

    if (completedValue !== value) {
      // 嘗試將補齊後的字串轉為 Date 物件
      const dateValue = new Date(completedValue);
      if (!isNaN(dateValue.getTime())) {
        this.control.setValue(dateValue);
        // 手動更新 input 顯示的文字
        input.value = completedValue;
      }
    }

    // this.onBlur.emit(event); // 如果 BasicKitComponent 有定義 blur emitter
  }

  /**
   * 補齊不完整的日期字串
   */
  private fillIncompleteDate(value: string, type: CalendarType): string {
    // 提取數字
    const nums = value.replace(/\D/g, '');

    switch (type) {
      case 'dateOne':
        // 只有年份 2025 -> 2025/01/01
        if (nums.length === 4) return `${nums}/01/01`;
        // 只有年月份 202512 或 2025/12 -> 2025/12/01
        if (nums.length === 6) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/01`;
        break;

      case 'dateMonthOne':
        // 只有年份 2025 -> 2025/01
        if (nums.length === 4) return `${nums}/01`;
        break;

      case 'dateTimeOne':
        // 補齊到日期後，再補時間 00:00
        if (nums.length === 4) return `${nums}/01/01 00:00`;
        if (nums.length === 6) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/01 00:00`;
        if (nums.length === 8) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)} 00:00`;
        // 已有日期但時間不完整 2025/01/01 14 -> 14:00
        if (nums.length === 10) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)} ${nums.substring(8, 10)}:00`;
        break;

      case 'timeOne':
        // 只有小時 14 -> 14:00
        if (nums.length === 2) return `${nums}:00`;
        break;
    }

    return value; // 若長度不符合規則則回傳原值
  }

  /**
   * 解析日期字串並移除時間部分
   * 支援格式: YYYYMM, YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD 等
   */
  // !!!有問題的方法，會導致時間被強制歸0，請在自己的作業提交前做轉換避免在共通元件做處理(不懂之處請參考PrimeNg文檔)
  private parseDateWithoutTime(value: string): Date | null {
    if (!value) return null;

    const dateStr = value.trim();
    if (!dateStr) return null;

    // --- 新增：處理純數字字串 (YYYYMM 或 YYYYMMDD) ---
    if (/^\d+$/.test(dateStr)) {
      // 情況 A: YYYYMM (長度 6)
      if (dateStr.length === 6) {
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1;
        return new Date(year, month, 1); // 預設為該月 1 號
      }
      // 情況 B: YYYYMMDD (長度 8)
      if (dateStr.length === 8) {
        const year = parseInt(dateStr.substring(0, 4), 10);
        const month = parseInt(dateStr.substring(4, 6), 10) - 1;
        const day = parseInt(dateStr.substring(6, 8), 10);
        return new Date(year, month, day);
      }
    }

    // --- 以下為原本處理帶分隔符號的邏輯 ---
    // 移除時間部分
    const datePart = dateStr.split(/[T\s]/)[0];

    // 嘗試 YYYY-MM-DD 或 YYYY/MM/DD 格式
    let match = datePart.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }

    // 處理 YYYY/MM 格式 (dateMonthOne 常見格式)
    match = datePart.match(/^(\d{4})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      return new Date(year, month, 1);
    }

    // 最後嘗試原生解析
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      // 這裡強制 new Date(年, 月, 日)，導致「時、分、秒」全部遺失變回 00:00
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    return null;
  }


  /**
 * 修改後的解析方法：增加一個 keepTime 參數
 */
  private parseDateWithOptionalTime(value: string, keepTime = false): Date | null {
    if (!value) return null;
    const dateStr = value.trim();

    // 嘗試 YYYY-MM-DD 或 YYYY/MM/DD 格式
    let match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : date;
    }

    // 處理 YYYY/MM 格式 (dateMonthOne 常見格式)
    match = dateStr.match(/^(\d{4})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      return new Date(year, month, 1);
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      if (keepTime) {
        // 如果需要時間（如 dateTimeOne），直接回傳解析後的 Date 物件
        return parsed;
      }
      // 如果不需要時間，才執行歸零邏輯
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
    return null;
  }

  ngOnDestroy() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }
}
