import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { PrimeTemplate } from 'primeng/api';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
    selector: 'app-calendar-range',
    templateUrl: './calendar-range.component.html',
    styleUrl: './calendar-range.component.scss',
    standalone: true,
    imports: [NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent]
})
export class CalendarRangeComponent extends BasicKitComponent implements OnInit {
  // 基本設置
  @Input() label = ''; // 標籤
  @Input() startLabel = ''; // 起始日期標籤
  @Input() endLabel = ''; // 結束日期標籤
  @Input() startControl = new FormControl; // 起始日期
  @Input() endControl = new FormControl; // 結束日期
  @Input() submitted = false; // 檢查欄位是否標準
  // 選擇的元件類型
  @Input() calendarType: 'timeRange' | 'dateRange' | 'dateTimeRange' | 'dateMonthRange' | 'dateYearRange' = 'dateRange';
  // PrimeNG 設置
  @Input() timeOnly = true;
  @Input() showTime = true;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'month';
  @Input() minDate: Date | undefined | null = null;
  @Input() startMaxDate: Date | undefined | null = null;
  @Input() endMinDate: Date | undefined | null = null;
  @Input() maxDate: Date | undefined | null = null;
  // 元件類型對應
  private readonly calendarConfig = {
    timeRange: { timeOnly: true, showTime: true, dateFormat: undefined, view: 'date', placeholder: '請選擇時間' },
    dateRange: { timeOnly: false, showTime: false, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期' },
    dateTimeRange: { timeOnly: false, showTime: true, dateFormat: 'yy/mm/dd', view: 'date', placeholder: '請選擇日期時間' },
    dateMonthRange: { timeOnly: false, showTime: false, dateFormat: 'yy/mm', view: 'month', placeholder: '請選擇月份' },
    dateYearRange: { timeOnly: false, showTime: false, dateFormat: 'yy', view: 'year', placeholder: '請選擇年份' }
  };
  ngOnInit() {
    this.configCalendar(); // 設置元件
    if (!this.startControl.disabled && !this.endControl.disabled) {
      this.placeholder = this.calendarConfig[this.calendarType].placeholder;
      this.updateControlState(this.startControl, this.endControl);
    }
    if (this.startControl.value && typeof this.startControl.value === 'string') {
      this.startControl.setValue(new Date(this.startControl.value));
    }
    if (this.endControl.value && typeof this.endControl.value === 'string') {
      this.endControl.setValue(new Date(this.endControl.value));
    }
  }

  // 設置元件
  private configCalendar() {
    const config = this.calendarConfig[this.calendarType];
    this.timeOnly = config.timeOnly;
    this.showTime = config.showTime;
    this.dateFormat = config.dateFormat;
    this.view = config.view as 'date' | 'month' | 'year';
  }

  validateRange() {
    if (this.startControl.value && this.endControl.value && this.startControl.value > this.endControl.value) {
      this.endControl.setErrors({ invalidDateRange: true });
    } else {
      this.endControl.setErrors(null);
    }
  }

}
