import { NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { CalendarModule, CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { ReadonlyCalendarDisplayComponent } from './readonly-calendar-display/readonly-calendar-display.component';

export type CalendarType = 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReadonlyCalendarDisplayComponent, NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent]
})
export class CalendarComponent extends BasicKitComponent implements OnInit, OnDestroy {
  private valueChangeSubscription?: Subscription;
  @Input() readonly = false;
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;
  @Input() calendarType: CalendarType = 'dateOne';
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

    if (this.disabled) {
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
    this.calendarEvent.emit(this.control.value);
  }

  onInput(event: any) {
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

  ngOnDestroy() {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
  }
}
