import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { CalendarModule, CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent]
})
export class CalendarComponent extends BasicKitComponent implements OnInit, OnDestroy {
  private valueChangeSubscription?: Subscription;
  @Input() readonly = false;
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;
  @Input() calendarType: 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne' = 'dateOne';
  @Input() timeOnly = true;
  @Input() showTime = true;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'month';
  @Input() showSeconds = false;
  @Input() minDate: Date | undefined | null = null;
  @Input() maxDate: Date | undefined | null = null;
  @Input() disabled = false;
  @Input() customPlaceholder = '請選擇';
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

    // 關鍵修改:區分 readonly 和 disabled
    // readonly 模式下不要 disable control,只設置視覺樣式
    if (this.disabled) {
      this.control.disable();
    }
    // readonly 模式下保持 control 啟用,但禁止用戶互動

    const config = this.calendarConfig[this.calendarType];
    if (config) {
      this.timeOnly = config.timeOnly;
      this.showTime = config.showTime;
      this.dateFormat = config.dateFormat;
      this.view = config.view as 'date' | 'month' | 'year';
      this.placeholder = config.customPlaceholder;
    }

    // 🔧 改進:處理字串格式的日期
    if (this.control.value && typeof this.control.value === 'string') {
      try {
        const dateValue = new Date(this.control.value);
        if (!isNaN(dateValue.getTime())) {
          this.control.setValue(dateValue, { emitEvent: false });
        }
      } catch (error) {
        console.warn('日期格式轉換失敗:', this.control.value);
      }
    }

    // 監聽 control 值變化
    this.valueChangeSubscription = this.control.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });

    this.cdr.markForCheck();
  }

  onClose() {
    //readonly 模式下也允許觸發事件(用於初始化載入)
    this.calendarEvent.emit(this.control.value);
  }

  onInput(event: any) {
    // 只有在用戶手動輸入時才阻止 readonly
    if (this.readonly) {
      event.preventDefault();
      return;
    }

    // !!! 一開始說的需求，現在又說不要
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

    const padZero = (num: number): string => num.toString().padStart(2, '0');

    switch (this.calendarType) {
      case 'dateOne':
        return `${date.getFullYear()}/${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}`;

      case 'timeOne':
        {
          const hours = padZero(date.getHours());
          const minutes = padZero(date.getMinutes());
          const seconds = padZero(date.getSeconds());
          return this.showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
        }

      case 'dateTimeOne':
        {
          const dateStr = `${date.getFullYear()}/${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}`;
          const timeStr = this.showSeconds
            ? `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`
            : `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
          return `${dateStr} ${timeStr}`;
        }

      case 'dateMonthOne':
        return `${date.getFullYear()}/${padZero(date.getMonth() + 1)}`;

      case 'dateYearOne':
        return date.getFullYear().toString();

      default:
        return `${date.getFullYear()}/${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}`;
    }
  }

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

  ngOnDestroy() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }
}
