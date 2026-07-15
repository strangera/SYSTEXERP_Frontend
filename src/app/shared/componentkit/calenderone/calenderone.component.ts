import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { CalendarMonthChangeEvent, CalendarYearChangeEvent, CalendarModule } from 'primeng/calendar';
import { NgIf, NgClass } from '@angular/common';
import { PrimeTemplate } from 'primeng/api';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { EnterToTabDirective } from '@shared/directive/enter-to-tab.directive';

@Component({
  selector: 'app-calenderone',
  standalone: true,
  styleUrls: ['./calendarone.component.scss'],
  imports: [NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent, EnterToTabDirective],
  templateUrl: './calenderone.component.html'
})
export class CalenderoneComponent extends BasicKitComponent implements OnInit {
  @Input() readonly = false;
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;

  // 日期類型
  @Input() calendarType: 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne' = 'dateOne';

  // PrimeNG
  @Input() timeOnly = true;
  @Input() showTime = true;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'month';
  @Input() showSeconds = false;
  @Input() minDate: Date | undefined | null = null;
  @Input() maxDate: Date | undefined | null = null;

  // 自訂
  @Input() disabled = false;

  // 事件：
  // 1) 原本事件：丟出目前 control 的值（Date）
  @Output() calendarEvent = new EventEmitter<any>();
  // 2) 新增：專門丟出 YYYYMM（特別給 dateMonthOne 用）
  @Output() yyyymmChange = new EventEmitter<string>();
  @Output() inputChange = new EventEmitter<string>();
  @Output() monthChangeEvent = new EventEmitter<CalendarMonthChangeEvent>();
  @Output() yearChangeEvent = new EventEmitter<CalendarYearChangeEvent>();

  private readonly calendarConfig = {
    timeOne:      { timeOnly: true,  showTime: true,  dateFormat: undefined,  view: 'date',  placeholder: '請選擇時間' },
    dateOne:      { timeOnly: false, showTime: false, dateFormat: 'yy/mm/dd', view: 'date',  placeholder: '請選擇日期' },
    dateTimeOne:  { timeOnly: false, showTime: true,  dateFormat: 'yy/mm/dd', view: 'date',  placeholder: '請選擇日期時間' },
    // 👇 月份模式：顯示到「月」就好
    dateMonthOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm',    view: 'month', placeholder: '請選擇月份' },
    dateYearOne:  { timeOnly: false, showTime: false, dateFormat: 'yy',       view: 'year',  placeholder: '請選擇年份' },
  };

  ngOnInit() {
    this.initControl(this.control);
    if (this.disabled || this.readonly) this.control.disable();

    const config = this.calendarConfig[this.calendarType];
    if (config) {
      this.timeOnly = config.timeOnly;
      this.showTime = config.showTime;
      this.dateFormat = config.dateFormat;
      this.view = config.view as 'date' | 'month' | 'year';
      this.placeholder = config.placeholder;
    }

    // 統一把初始值轉成 Date（支援 YYYYMM / YYYY/MM）
    if (this.control.value) {
      this.control.setValue(this.coerceToDate(this.control.value, this.calendarType), { emitEvent: false });
    }
  }

  /** 內部維持 Date；外部（事件）需要時才輸出 YYYYMM */
  private coerceToDate(value: any, type: typeof this.calendarType): Date | null {
    if (value instanceof Date && !isNaN(value.getTime())) return value;

    const s = String(value ?? '').trim();
    if (!s) return null;

    const digits = s.replace(/\D/g, '');

    if (type === 'dateMonthOne') {
      // 支援 'YYYYMM' 或 'YYYY/MM'
      if (digits.length >= 6) {
        const y = Number(digits.slice(0, 4));
        const m = Number(digits.slice(4, 6)) - 1; // 0-based
        const dt = new Date(y, m, 1, 0, 0, 0, 0); // 固定當月 1 號
        return isNaN(dt.getTime()) ? null : dt;
      }
    }

    const dt = new Date(s);
    return isNaN(dt.getTime()) ? null : dt;
  }

  /** 將 Date 轉成 'YYYYMM' */
  private toYYYYMM(input: any): string | null {
    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}${m}`;
  }

  onClose() {
    if (this.readonly) return;

    // 原本的事件，仍然把 control 值（Date）丟出去
    this.calendarEvent.emit(this.control.value);

    // 新增：若是月份模式，另外發出 YYYYMM 給外層（不更動 control 型別）
    if (this.calendarType === 'dateMonthOne' && this.control.value) {
      const yyyymm = this.toYYYYMM(this.control.value);
      if (yyyymm) this.yyyymmChange.emit(yyyymm);
    }
  }

  onInput(event: any) {
    if (this.readonly) return;

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
      // 鍵入 YYYY 後自動補 /
      if (event.target.value.length === 4 && event.data && event.target.value.indexOf('/') === -1) {
        event.target.value = event.target.value + '/';
      }
    }

    this.inputChange.emit(event.target.value);
  }

  /** 顯示字串：dateMonthOne 僅顯示 YYYY/MM */
  getDisplayValue(): string {
    if (!this.control.value) return '';

    const date = this.control.value instanceof Date ? this.control.value : new Date(this.control.value);
    if (isNaN(date.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    switch (this.calendarType) {
      case 'dateOne':
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
      case 'timeOne': {
        const h = pad(date.getHours()), m = pad(date.getMinutes()), s = pad(date.getSeconds());
        return this.showSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
      }
      case 'dateTimeOne': {
        const d = `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
        const t = this.showSeconds ? `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
                                   : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
        return `${d} ${t}`;
      }
      case 'dateMonthOne':
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}`;
      case 'dateYearOne':
        return date.getFullYear().toString();
      default:
        return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
    }
  }

  get calendarClasses(): string {
    const classes = ['w-full'];
    if (this.readonly) classes.push('readonly-field');
    if (this.submitted && this.control.errors) classes.push('ng-dirty', 'ng-invalid');
    return classes.join(' ');
  }
}
