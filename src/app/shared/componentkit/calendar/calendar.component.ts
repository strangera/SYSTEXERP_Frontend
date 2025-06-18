import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent extends BasicKitComponent implements OnInit {
  // 基本設置
  @Input() label = '';
  @Input() control = new FormControl();
  @Input() controlName = '';
  @Input() submitted = false;
  // 選擇的元件類型
  @Input() calendarType: 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne' = 'dateOne';
  // PrimeNG 設置
  @Input() timeOnly = true;
  @Input() showTime = true;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'month';
  @Input() showSeconds = false;
  @Input() minDate: Date | undefined | null;
  @Input() maxDate: Date | undefined | null;
  @Input() disabled = false;
  @Input() disabledDates: Date[] = [];
  @Output() calendarEvent = new EventEmitter<Event>();
  @Output() monthChangeEvent = new EventEmitter<CalendarMonthChangeEvent>();
  @Output() yearChangeEvent = new EventEmitter<CalendarYearChangeEvent>();

  // 元件類型對應
  private readonly calendarConfig = {
    timeOne: { timeOnly: true, showTime: true, showSeconds: false, dateFormat: undefined, view: 'date', placeholder: '請選擇時間' },
    dateOne: { timeOnly: false, showTime: false, showSeconds: false, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期' },
    dateTimeOne: { timeOnly: false, showTime: true, showSeconds: true, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期時間' },
    dateMonthOne: { timeOnly: false, showTime: false, showSeconds: false, dateFormat: 'yy/mm', view: 'month', placeholder: '請選擇月份' },
    dateYearOne: { timeOnly: false, showTime: false, showSeconds: false, dateFormat: 'yy', view: 'year', placeholder: '請選擇年份' }
  };

  ngOnInit() {
    if (this.disabled) { this.control.disable(); }
    this.configCalendar(); // 設置元件
    if (!this.control.disabled) {
      this.placeholder = this.calendarConfig[this.calendarType].placeholder;
      this.updateControlState(this.control);
    }

    if (this.control.value && typeof this.control.value === 'string') {
      this.control.setValue(new Date(this.control.value));
    }
  }

  // 設置元件
  private configCalendar() {
    const config = this.calendarConfig[this.calendarType];
    this.timeOnly = config.timeOnly;
    this.showTime = config.showTime;
    this.showSeconds = config.showSeconds;
    this.dateFormat = config.dateFormat;
    this.view = config.view as 'date' | 'month' | 'year';
  }

  onClose() {
    this.calendarEvent.emit(event);
  }

  onCalendarMonthChange(event: CalendarMonthChangeEvent): void {
    this.monthChangeEvent.emit(event);
  }

  onCalendarYearChange(event: CalendarYearChangeEvent): void {
    this.yearChangeEvent.emit(event);
  }
}
