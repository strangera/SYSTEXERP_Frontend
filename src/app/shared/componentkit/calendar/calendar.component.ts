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
  timeOne: { lengths: [2], chars: [':'] },             // HH:mm
  dateOne: { lengths: [4, 7], chars: ['/', '/'] },       // YYYY/MM/DD
  dateTimeOne: { lengths: [4, 7, 10, 13], chars: ['/', '/', ' ', ':'] }, // YYYY/MM/DD HH:mm
  dateMonthOne: { lengths: [4], chars: ['/'] },         // YYYY/MM
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
    this.maxLength = maxLen;

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
      this.placeholder = config.customPlaceholder;
    }
  }

  constructor(private validationService: ValidationService) {
    super();
  }

  ngOnInit() {
    this.initControl(this.control);
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
      this.placeholder = this.customPlaceholder;
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
    const config = FORMAT_RULES[this.calendarType];

    if (!config) {
      this.inputChange.emit(value);
      return;
    }

    if (event.inputType === 'deleteContentBackward') {
      this.inputChange.emit(value);
      return;
    }

    if (event.inputType === 'insertFromPaste' || (event.data && event.data.length > 1)) {
      input.value = this.formatFullString(value, this.calendarType);
      this.inputChange.emit(input.value);
      return;
    }

    const index = config.lengths.indexOf(value.length);
    if (index !== -1) {
      const charToAppend = config.chars[index];
      if (value.charAt(value.length - 1) !== charToAppend) {
        if (!/[！-～　]/.test(value)) {
          input.value = value + charToAppend;
        }
      }
    }
    this.inputChange.emit(input.value);
  }

  private formatFullString(value: string, type: CalendarType): string {
    const nums = value.replace(/\D/g, '');
    switch (type) {
      case 'dateOne':
        if (nums.length >= 8) {
          return `${nums.substring(0, 4)}/${nums.substring(4, 6)}/${nums.substring(6, 8)}`;
        }
        return value;
      case 'dateMonthOne':
        if (nums.length >= 6) {
          return `${nums.substring(0, 4)}/${nums.substring(4, 6)}`;
        }
        return value;
      case 'timeOne':
        if (nums.length >= 4) {
          return `${nums.substring(0, 2)}:${nums.substring(2, 4)}`;
        }
        return value;
      case 'dateTimeOne':
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
    if (!value) return;

    const completedValue = this.fillIncompleteDate(value, this.calendarType);
    if (completedValue !== value) {
      const dateValue = new Date(completedValue);
      if (!isNaN(dateValue.getTime())) {
        const adjustedDate = this.adjustDateTime(dateValue);
        this.control.setValue(adjustedDate);
        input.value = completedValue;
      }
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

  private parseDateWithOptionalTime(value: string, keepTime = false): Date | null {
    if (!value) return null;
    const dateStr = value.trim();

    let match = dateStr.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
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
