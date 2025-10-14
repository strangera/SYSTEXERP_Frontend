import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { CalendarMonthChangeEvent, CalendarYearChangeEvent, CalendarModule } from 'primeng/calendar';
import { NgIf, NgClass } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent]
})
export class CalendarComponent extends BasicKitComponent implements OnInit {

  @Input() readonly = false;  // 新增：唯讀模式
  // 必填
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;
  // 日期類型
  @Input() calendarType: 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne' = 'dateOne';
  // Primeng 相關屬性
  @Input() timeOnly = true;
  @Input() showTime = true;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'month';
  @Input() showSeconds = false;
  @Input() minDate: Date | undefined | null = null;
  @Input() maxDate: Date | undefined | null = null;
  // 自訂屬性
  @Input() disabled = false;
  @Input() customPlaceholder = '請選擇';
  // 觸發事件
  @Output() calendarEvent = new EventEmitter<any>();
  @Output() inputChange = new EventEmitter<string>();
  @Output() monthChangeEvent = new EventEmitter<CalendarMonthChangeEvent>();
  @Output() yearChangeEvent = new EventEmitter<CalendarYearChangeEvent>();

  private readonly calendarConfig = {
    timeOne: { timeOnly: true, showTime: true, dateFormat: undefined, view: 'date', customPlaceholder: '請選擇時間' },
    dateOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm/dd', view: 'date', customPlaceholder: '請選擇日期' },
    dateTimeOne: { timeOnly: false, showTime: true, dateFormat: 'yy/mm/dd', view: 'date', customPlaceholder: '請選擇日期時間' },
    dateMonthOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm', view: 'month', customPlaceholder: '請選擇月份' },
    dateYearOne: { timeOnly: false, showTime: false, dateFormat: 'yy', view: 'year', customPlaceholder: '請選擇年份' },
  };

  ngOnInit() {
    this.initControl(this.control);
    if (this.disabled || this.readonly) {
      this.control.disable();
    }
    const config = this.calendarConfig[this.calendarType];
    if (config) {
      this.timeOnly = config.timeOnly;
      this.showTime = config.showTime;
      this.dateFormat = config.dateFormat;
      this.view = config.view as 'date' | 'month' | 'year';
      this.placeholder = config.customPlaceholder;
    }

    if (this.control.value && typeof this.control.value === 'string') {
      this.control.setValue(new Date(this.control.value));
    }
  }
  onClose() {
    if (this.readonly) return; // 唯讀模式下不處理事件
    this.calendarEvent.emit(this.control.value);
  }
  // dateTimeOne
  onInput(event: any) {
    if (this.readonly) return; // 唯讀模式下不處理事件
    if (this.calendarType === 'timeOne') {
      if (event.target.value.length === 2 && event.data && event.target.value.indexOf(':') === -1) {
        event.target.value = event.target.value + ':';
      }
    }
    if (this.calendarType === 'dateOne' || this.calendarType === 'dateTimeOne') {
      if (event.target.value.length === 4 && event.data && event.target.value.indexOf('/') === -1) {
        event.target.value = event.target.value + '/';
      }
      if (event.target.value.length === 7 && event.data && event.target.value.lastIndexOf('/') === event.target.value.indexOf('/')) {
        event.target.value = event.target.value + '/';
      }
    }
    if (this.calendarType === 'dateTimeOne') {
      if (event.target.value.length === 10 && event.data && event.target.value.indexOf(' ') === -1) {
        event.target.value = event.target.value + ' ';
      }
      if (event.target.value.length === 13 && event.data && event.target.value.lastIndexOf(':') === event.target.value.indexOf(':')) {
        event.target.value = event.target.value + ':';
      }
    }
    if (this.calendarType === 'dateMonthOne') {
      if (event.target.value.length === 4 && event.data && event.target.value.indexOf('/') === -1) {
        event.target.value = event.target.value + '/';
      }
    }
    this.inputChange.emit(event.target.value);
  }

  getDisplayValue(): string {
    if (!this.control.value) return '';

    const date = this.control.value;
    if (!(date instanceof Date)) return date.toString();

    // 輔助函數：補零
    const padZero = (num: number): string => num.toString().padStart(2, '0');

    switch (this.calendarType) {
      case 'dateOne':
        // 使用手動格式化確保補零：2025/09/01
        return `${date.getFullYear()}/${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}`;

      case 'timeOne':
        // 確保時間格式補零：14:30 或 14:30:00
        {
          const hours = padZero(date.getHours());
          const minutes = padZero(date.getMinutes());
          const seconds = padZero(date.getSeconds());
          return this.showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
        }

      case 'dateTimeOne':
        // 日期時間組合：2025/09/01 14:30:00
        {
          const dateStr = `${date.getFullYear()}/${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}`;
          const timeStr = this.showSeconds
            ? `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`
            : `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
          return `${dateStr} ${timeStr}`;
        }

      case 'dateMonthOne':
        // 年月格式：2025/09
        return `${date.getFullYear()}/${padZero(date.getMonth() + 1)}`;

      case 'dateYearOne':
        // 年份格式：2025
        return date.getFullYear().toString();

      default:
        return `${date.getFullYear()}/${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}`;
    }
  }


  // 新增：取得 calendar 的 CSS 類別
  get calendarClasses(): string {
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
