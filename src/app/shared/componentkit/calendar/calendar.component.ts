import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  standalone: true,
  imports: [NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent]
})
export class CalendarComponent extends BasicKitComponent implements OnInit {
  // 📌 基本設置
  @Input() label = '';
  @Input() control = new FormControl();
  @Input() controlName = '';
  @Input() submitted = false;

  // 📌 calendarType（包含新增加 oddMonthOne）
  @Input() calendarType: 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne' | 'oddMonthOne' = 'dateOne';

  // 📌 PrimeNG 設置
  @Input() timeOnly = true;
  @Input() showTime = true;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'month'; // ✅ 不含 oddmonth
  @Input() showSeconds = false;
  @Input() minDate: Date | undefined | null;
  @Input() maxDate: Date | undefined | null;
  @Input() disabled = false;
  @Input() disabledDates: Date[] = [];

  @Output() calendarEvent = new EventEmitter<any>();
  @Output() monthChangeEvent = new EventEmitter<CalendarMonthChangeEvent>();
  @Output() yearChangeEvent = new EventEmitter<CalendarYearChangeEvent>();

  override updateControlState(control: FormControl) {
    super.updateControlState(control);
  }

  private readonly calendarConfig = {
    timeOne: { timeOnly: true, showTime: true, showSeconds: false, dateFormat: undefined, view: 'date', placeholder: '請選擇時間' },
    dateOne: { timeOnly: false, showTime: false, showSeconds: false, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期' },
    dateTimeOne: { timeOnly: false, showTime: true, showSeconds: true, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期時間' },
    dateMonthOne: { timeOnly: false, showTime: false, showSeconds: false, dateFormat: 'yy/mm', view: 'month', placeholder: '請選擇月份' },
    dateYearOne: { timeOnly: false, showTime: false, showSeconds: false, dateFormat: 'yy', view: 'year', placeholder: '請選擇年份' },
    oddMonthOne: { timeOnly: false, showTime: false, showSeconds: false, dateFormat: 'yy/mm', view: 'month', placeholder: '請選擇奇數月份' }
  };

  ngOnInit() {
    if (this.disabled) this.control.disable();

    this.configCalendar();

    if (!this.control.disabled) {
      this.placeholder = this.calendarConfig[this.calendarType]?.placeholder || '';
      this.updateControlState(this.control);
    }

    if (this.control.value && typeof this.control.value === 'string') {
      this.control.setValue(new Date(this.control.value));
    }

    if (this.calendarType === 'oddMonthOne') {
      this.generateEvenMonthDisabledDates(new Date().getFullYear());
    }
  }

  private configCalendar() {
    const config = this.calendarConfig[this.calendarType];
    if (config) {
      this.timeOnly = config.timeOnly;
      this.showTime = config.showTime;
      this.showSeconds = config.showSeconds;
      this.dateFormat = config.dateFormat;
      this.view = config.view as 'date' | 'month' | 'year';
    }
  }

  onClose() {
    this.calendarEvent.emit(this.control.value);
  }

  onCalendarMonthChange(event: CalendarMonthChangeEvent): void {
    const month = event.month ?? -1;
    if (this.calendarType === 'oddMonthOne') {
      const selectedMonth = month + 1;
      if (selectedMonth % 2 === 0) {
        this.control.setValue(null);
        alert('只允許選擇奇數月份');
        return;
      }
    }

    this.monthChangeEvent.emit(event);
  }

  onCalendarYearChange(event: CalendarYearChangeEvent): void {
    const year = event.year ?? new Date().getFullYear();
    if (this.calendarType === 'oddMonthOne') {
      this.generateEvenMonthDisabledDates(year);
    }

    this.yearChangeEvent.emit(event);
  }

  private generateEvenMonthDisabledDates(year: number) {
    const disabled: Date[] = [];
    const evenMonths = [1, 3, 5, 7, 9, 11]; // 偶數月 index（0-based）

    for (const month of evenMonths) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        disabled.push(new Date(year, month, day));
      }
    }

    this.disabledDates = disabled;
  }
}
