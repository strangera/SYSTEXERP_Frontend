import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';
import { FieldStateDirective } from '@shared/directive/field-state.directive';
import { ValidationService } from '@shared/service/validation.service';
import { PrimeTemplate } from 'primeng/api';
import { CalendarModule, CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { ReadonlyCalendarDisplayComponent } from './readonly-calendar-display/readonly-calendar-display.component';

export type CalendarType = 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne';

const FORMAT_RULES: Record<string, { lengths: number[], chars: string[] }> = {
  timeOne: { lengths: [2], chars: [':'] },             // HH:mm
  dateOne: { lengths: [4, 7], chars: ['/', '/'] },       // YYYY/MM/DD
  dateTimeOne: { lengths: [4, 7, 10, 13], chars: ['/', '/', ' ', ':'] }, // YYYY/MM/DD HH:mm
  dateMonthOne: { lengths: [4], chars: ['/'] },         // YYYY/MM
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReadonlyCalendarDisplayComponent, NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, EnterToTabDirective],
  hostDirectives: [FieldStateDirective],
})
export class CalendarComponent implements OnInit, OnDestroy {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });
  private readonly cdr = inject(ChangeDetectorRef);

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
  @Input() label = '';
  @Input() showLabel = true;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;

  // 用於判斷起迄日的時間預設邏輯
  @Input() isStartDate = false;
  @Input() isEndDate = false;

  @Input() set calendarType(value: CalendarType) {
    this._calendarType = value;
    this.applyCalendarConfig();
  }
  get calendarType(): CalendarType {
    return this._calendarType;
  }

  // 只有「日期／日期時間」型別會在同一個面板內切換 日→月→年 三種檢視，
  // 才需要靠固定面板高度避免切換時跳動；純年份/純年月選擇器本來就不會跳動，不需要也不應該撐高。
  // dateTimeOne 另外標記 app-calendar-drilldown-time：因為切到月/年檢視時，下方的時間選擇器會整塊消失，
  // 需要額外補高月/年檢視，否則一樣會因為少了時間選擇器的高度而跳動。
  get panelStyleClass(): string {
    if (this._calendarType === 'dateOne') return 'app-calendar-drilldown';
    if (this._calendarType === 'dateTimeOne') return 'app-calendar-drilldown app-calendar-drilldown-time';
    return '';
  }

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

  private initialRequired = false;

  private readonly calendarConfig = {
    timeOne: { timeOnly: true, showTime: true, dateFormat: undefined, view: 'date', customPlaceholder: '請選擇時間' },
    dateOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm/dd', view: 'date', customPlaceholder: '請選擇日期' },
    dateTimeOne: { timeOnly: false, showTime: true, dateFormat: 'yy/mm/dd', view: 'date', customPlaceholder: '請選擇日期時間' },
    dateMonthOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm', view: 'month', customPlaceholder: '請選擇月份' },
    dateYearOne: { timeOnly: false, showTime: false, dateFormat: 'yy', view: 'year', customPlaceholder: '請選擇年份' },
  };

  private applyCalendarConfig(): void {
    const config = this.calendarConfig[this._calendarType];
    if (!config || !this.control) return;

    this.timeOnly = config.timeOnly;
    this.showTime = config.showTime;
    this.dateFormat = config.dateFormat;
    this.view = config.view as 'date' | 'month' | 'year';

    const maxLen = this.calendarMaxLength[this._calendarType];
    this.fieldState.maxLength = maxLen;

    const newValidators: any[] = [];
    newValidators.push(Validators.maxLength(maxLen));

    if (this.validationService) {
      newValidators.push(this.validationService.containsFullWidth.bind(this.validationService));
    }

    if (this.initialRequired || this.control.hasValidator(Validators.required)) {
      this.initialRequired = true;
      newValidators.push(Validators.required);
    }

    this.control.setValidators(newValidators);
    this.control.updateValueAndValidity({ emitEvent: false });

    if (!this.customPlaceholder || this.customPlaceholder === '請選擇') {
      this.fieldState.placeholder = config.customPlaceholder;
    }
  }

  constructor(private validationService: ValidationService) {
  }

  ngOnInit() {
    this.fieldState.initControl(this.control, this.controlName, this.label);
    this.initialRequired = this.control.hasValidator(Validators.required);

    const validators: any[] = [this.validationService.containsFullWidth.bind(this.validationService)];
    if (this.control.validator) {
      validators.push(this.control.validator);
    }
    this.control.setValidators(validators);

    if (this.disabled) {
      this.control.disable();
    }

    this.applyCalendarConfig();

    if (this.customPlaceholder && this.customPlaceholder !== '請選擇') {
      this.fieldState.placeholder = this.customPlaceholder;
    }

    // 🔧 處理字串格式的日期，轉為 Date 物件並校正起迄日時間
    if (this.control.value && typeof this.control.value === 'string') {
      try {
        const shouldKeepTime = this.showTime || this.calendarType === 'dateTimeOne' || this.calendarType === 'timeOne';
        const dateValue = this.parseDateWithOptionalTime(this.control.value, shouldKeepTime);
        if (dateValue) {
          this.control.setValue(dateValue, { emitEvent: false });
        }
      } catch (error) {
        console.warn('日期格式轉換失敗:', this.control.value);
      }
    } else if (this.control.value instanceof Date && this.calendarType === 'dateOne') {
      const adjustedDate = this.adjustDateTime(this.control.value);
      this.control.setValue(adjustedDate, { emitEvent: false });
    }

    // 監聽 control 值變化
    this.valueChangeSubscription = this.control.valueChanges.subscribe((val) => {
      if (val === '') {
        this.control.setValue(null, { emitEvent: false });
      } else if (val instanceof Date && this.calendarType === 'dateOne') {
        const adjustedDate = this.adjustDateTime(val);
        if (val.getTime() !== adjustedDate.getTime()) {
          this.control.setValue(adjustedDate, { emitEvent: false });
        }
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
    const maxLen = this.fieldState.maxLength ?? 0;

    // 1. 如果是刪除鍵，放行讓使用者刪除
    if (event.inputType === 'deleteContentBackward') {
      this.inputChange.emit(value);
      return;
    }

    // 2. 處理複製貼上，或是多字元輸入的情境
    if (event.inputType === 'insertFromPaste' || (event.data && event.data.length > 1)) {
      const formatted = this.formatFullString(value, this.calendarType);
      input.value = maxLen > 0 ? formatted.substring(0, maxLen) : formatted;

      const shouldKeepTime = this.showTime || this.calendarType === 'dateTimeOne' || this.calendarType === 'timeOne';
      const parsedDate = this.parseDateWithOptionalTime(input.value, shouldKeepTime);
      this.control.setValue(parsedDate ?? input.value, { emitEvent: false });
      this.control.updateValueAndValidity({ emitEvent: false });
      this.inputChange.emit(input.value);
      return;
    }

    // 3. 長度超過 maxLength 時裁切
    if (maxLen > 0 && value.length > maxLen) {
      const truncatedValue = value.substring(0, maxLen);
      input.value = truncatedValue;
      this.control.setValue(truncatedValue, { emitEvent: false });
      this.control.updateValueAndValidity({ emitEvent: false });
      this.inputChange.emit(truncatedValue);
      this.cdr.markForCheck();
      return;
    }

    // 4. 自動補符號邏輯（/ 或 :）
    const config = FORMAT_RULES[this.calendarType];
    if (config) {
      const index = config.lengths.indexOf(value.length);
      if (index !== -1) {
        const charToAppend = config.chars[index];
        if (value.charAt(value.length - 1) !== charToAppend) {
          if (!/[！-～ ]/.test(value)) {
            const newValue = value + charToAppend;
            if (maxLen === 0 || newValue.length <= maxLen) {
              // 🌟 使用 setTimeout 避開 PrimeNG 的同步 writeValue 週期
              setTimeout(() => {
                input.value = newValue;
                this.control.setValue(newValue, { emitEvent: false });
                // 確保游標停在最新補上的符號後面
                input.setSelectionRange(newValue.length, newValue.length);
                this.inputChange.emit(newValue);
              });
              return;
            }
          }
        }
      }
    }

    this.inputChange.emit(input.value);
  }

  private formatFullString(value: string, type: CalendarType): string {
    const nums = value.replace(/\D/g, '');
    const maxLen = this.calendarMaxLength[type];
    let result = value;

    switch (type) {
      case 'dateOne':
        if (nums.length >= 8) result = `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)}`;
        break;
      case 'dateMonthOne':
        if (nums.length >= 6) result = `${nums.substring(0, 4)}/${nums.substring(4, 6)}`;
        break;
      case 'timeOne':
        if (nums.length >= 4) result = `${nums.substring(0, 2)}:${nums.substring(2, 4)}`;
        break;
      case 'dateTimeOne':
        if (nums.length >= 12) result = `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)} ${nums.substring(8, 10)}:${nums.substring(10, 12)}`;
        break;
    }

    // 回傳前切齊該型態的最大長度
    return result.substring(0, maxLen);
  }

  onBlur(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (!value) return;

    const shouldKeepTime = this.showTime || this.calendarType === 'dateTimeOne' || this.calendarType === 'timeOne';

    // 🌟 優先直接解析使用者原始輸入（尊重使用者自己打的分隔符號位置，允許月/日/時/分為1~2碼），
    // 避免 fillIncompleteDate 純憑數字總長度猜段落，把「2026/1/1」誤判成「2026/11/01」。
    // 只有直接解析失敗（代表段落數量不足，如只打了年份或年+月）才 fallback 回舊有補值邏輯。
    let dateValue = this.parseStrict(value);
    if (!dateValue) {
      const completedValue = this.fillIncompleteDate(value, this.calendarType);
      dateValue = this.parseDateWithOptionalTime(completedValue, shouldKeepTime);
    }

    if (dateValue) {
      this.control.setValue(dateValue);
      input.value = this.formatDateForDisplay(dateValue, this.calendarType);
    }
  }

  // 統一將 Date 物件格式化為畫面顯示字串，月/日/時/分一律補齊2碼，分隔符號固定歸一
  private formatDateForDisplay(date: Date, type: CalendarType): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());

    switch (type) {
      case 'dateTimeOne': return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
      case 'dateMonthOne': return `${yyyy}/${mm}`;
      case 'timeOne': return `${hh}:${mi}`;
      case 'dateYearOne': return `${yyyy}`;
      default: return `${yyyy}/${mm}/${dd}`;
    }
  }

  private fillIncompleteDate(value: string, type: CalendarType): string {
    const nums = value.replace(/\D/g, '');
    switch (type) {
      case 'dateOne':
        if (nums.length === 4) return `${nums}/01/01`;
        if (nums.length === 6) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/01`;
        break;
      case 'dateMonthOne':
        if (nums.length === 4) return `${nums}/01`;
        break;
      case 'dateTimeOne':
        if (nums.length === 4) return `${nums}/01/01 00:00`;
        if (nums.length === 6) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/01 00:00`;
        if (nums.length === 8) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)} 00:00`;
        if (nums.length === 10) return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)} ${nums.substring(8, 10)}:00`;
        break;
      case 'timeOne':
        if (nums.length === 2) return `${nums}:00`;
        break;
    }
    return value;
  }

  /**
   * 統一調配 Date 物件時分秒的輔助方法
   * @param date 目標 Date 物件
   * @param forcedIsEndDate 選擇性參數：是否強制判定為迄日。若未傳入，則採用 Input 屬性 this.isEndDate
   */
  private adjustDateTime(date: Date, forcedIsEndDate?: boolean): Date {
    if (this.calendarType !== 'dateOne') return date;

    // 🌟 優先採用方法傳入的參數，若沒傳才讀取組件 Input 狀態
    const isEnd = forcedIsEndDate !== undefined ? forcedIsEndDate : this.isEndDate;
    const isStart = forcedIsEndDate !== undefined ? !forcedIsEndDate : this.isStartDate;

    if (isStart) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
    }
    if (isEnd) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    }

    // 若皆未指定，則維持預設的歸零邏輯
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  // 嚴格解析：只認使用者自己打的分隔符號位置，允許月/日/時/分為1~2碼；不做任何猜測式 fallback。
  // dateOne/dateTimeOne/dateMonthOne/timeOne 共用，貼上路徑與離焦手動輸入路徑皆靠這個函式保證正確歸位。
  private parseStrict(value: string): Date | null {
    if (!value) return null;
    const dateStr = value.trim();

    let match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+(\d{1,2}):(\d{1,2})$/);
    if (match) {
      const date = new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), parseInt(match[4], 10), parseInt(match[5], 10));
      return isNaN(date.getTime()) ? null : date;
    }

    match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      const date = new Date(year, month, day);
      return isNaN(date.getTime()) ? null : this.adjustDateTime(date);
    }

    match = dateStr.match(/^(\d{4})[-/](\d{1,2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const date = new Date(year, month, 1);
      return isNaN(date.getTime()) ? null : date;
    }

    match = dateStr.match(/^(\d{1,2}):(\d{1,2})$/);
    if (match) {
      const now = new Date();
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(match[1], 10), parseInt(match[2], 10));
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  private parseDateWithOptionalTime(value: string, keepTime = false): Date | null {
    if (!value) return null;

    const strict = this.parseStrict(value);
    if (strict) return strict;

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      if (keepTime) {
        return parsed;
      }
      return this.adjustDateTime(parsed);
    }
    return null;
  }

  ngOnDestroy() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }
}
