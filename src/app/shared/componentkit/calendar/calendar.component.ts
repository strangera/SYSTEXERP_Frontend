import { NgClass, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input,
  OnInit, Output, computed, effect, inject, signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidationService } from '@shared/service/validation.service';
import { PrimeTemplate } from 'primeng/api';
import { CalendarModule, CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { ReadonlyCalendarDisplayComponent } from './readonly-calendar-display/readonly-calendar-display.component';

export type CalendarType = 'timeOne' | 'dateOne' | 'dateTimeOne' | 'dateMonthOne' | 'dateYearOne';

const TYPE_CONFIGS: Record<CalendarType, any> = {
  timeOne: { timeOnly: true, showTime: true, dateFormat: undefined, view: 'date', maxLen: 5, placeholder: '請選擇時間', format: { lengths: [2], chars: [':'] } },
  dateOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm/dd', view: 'date', maxLen: 10, placeholder: '請選擇日期', format: { lengths: [4, 7], chars: ['/', '/'] } },
  dateTimeOne: { timeOnly: false, showTime: true, dateFormat: 'yy/mm/dd', view: 'date', maxLen: 16, placeholder: '請選擇日期時間', format: { lengths: [4, 7, 10, 13], chars: ['/', '/', ' ', ':'] } },
  dateMonthOne: { timeOnly: false, showTime: false, dateFormat: 'yy/mm', view: 'month', maxLen: 7, placeholder: '請選擇月份', format: { lengths: [4], chars: ['/'] } },
  dateYearOne: { timeOnly: false, showTime: false, dateFormat: 'yy', view: 'year', maxLen: 4, placeholder: '請選擇年份', format: null },
};

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReadonlyCalendarDisplayComponent, NgIf, CalendarModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, ControlMessagesComponent]
})
export class CalendarComponent extends BasicKitComponent implements OnInit {
  private validationService = inject(ValidationService);
  private destroyRef = inject(DestroyRef);
  @Input() readonly = false;
  @Input() override label = '';
  @Input() showLabel = true;
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false;
  @Input() customPlaceholder = '';
  @Input() timeOnly = false;
  @Input() showTime = false;
  @Input() hourFormat = '24';
  @Input() dateFormat: string | undefined = 'yy/mm/dd';
  @Input() view: 'date' | 'month' | 'year' = 'date';
  @Input() showSeconds = false;
  @Input() minDate: Date | null | undefined = null;
  @Input() maxDate: Date | null | undefined = null;
  @Input() disabled = false;
  @Input() helpMsg?: string;
  @Input() showErrorMessage = true;

  @Output() calendarEvent = new EventEmitter<any>();
  @Output() inputChange = new EventEmitter<string>();
  @Output() monthChangeEvent = new EventEmitter<CalendarMonthChangeEvent>();
  @Output() yearChangeEvent = new EventEmitter<CalendarYearChangeEvent>();

  // 使用 Signal 並在 Setter 中同步屬性
  private typeSignal = signal<CalendarType>('dateOne');
  @Input() set calendarType(v: CalendarType) {
    this.typeSignal.set(v);
    this.applyConfigToProperties(v);
  }
  get calendarType() { return this.typeSignal(); }

  protected config = computed(() => TYPE_CONFIGS[this.typeSignal()]);

  constructor() {
    super();
    // 效果：當類型變更時，自動更新 FormControl 的驗證器
    effect(() => {
      const maxLen = this.config().maxLen;
      this.maxLength = maxLen; // 同步給父類別
      if (this.control) {
        this.control.setValidators([
          Validators.maxLength(maxLen),
          this.validationService.containsFullWidth.bind(this.validationService)
        ]);
        this.control.updateValueAndValidity({ emitEvent: false });
      }
    });
  }

  ngOnInit() {
    this.initControl(this.control);
    if (this.disabled) this.control.disable();

    // 初始化時同步一次配置
    this.applyConfigToProperties(this.calendarType);

    // 監聽值變化
    this.control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(val => {
      if (val === '') {
        this.control.setValue(null, { emitEvent: false });
      }
      // 初次載入若為字串格式則轉換
      if (typeof val === 'string' && val.length >= 4) {
        const dateObj = this.parseDate(val);
        if (dateObj) this.control.setValue(dateObj, { emitEvent: false });
      }
      this.cdr.markForCheck();
    });
  }

  private applyConfigToProperties(type: CalendarType) {
    const cfg = TYPE_CONFIGS[type];
    if (cfg) {
      this.timeOnly = cfg.timeOnly;
      this.showTime = cfg.showTime;
      this.view = cfg.view;
      this.dateFormat = cfg.dateFormat;
      this.placeholder = cfg.placeholder; // 父類屬性
    }
  }

  private parseDate(value: string): Date | null {
    const s = value.replace(/\D/g, '');
    if (s.length === 8) return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, +s.slice(6, 8));
    if (s.length === 6) return new Date(+s.slice(0, 4), +s.slice(4, 6) - 1, 1);
    if (s.length === 4) return new Date(+s.slice(0, 4), 0, 1);
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  onInput(event: any) {
    const input = event.target as HTMLInputElement;
    let val = input.value;
    const rule = this.config().format;
    if (event.inputType?.includes('delete')) return;

    if (val.length > 1 && !val.includes('/') && !val.includes(':')) {
      val = this.formatByPattern(val, this.calendarType);
      input.value = val;
    } else if (rule) {
      const idx = rule.lengths.indexOf(val.length);
      if (idx !== -1 && !/[！-～　]/.test(val)) {
        input.value = val + rule.chars[idx];
      }
    }
    this.inputChange.emit(input.value);
  }

  private formatByPattern(val: string, type: CalendarType): string {
    const n = val.replace(/\D/g, '');
    switch (type) {
      case 'dateOne': return n.length >= 8 ? `${n.slice(0, 4)}/${n.slice(4, 6)}/${n.slice(6, 8)}` : val;
      case 'dateMonthOne': return n.length >= 6 ? `${n.slice(0, 4)}/${n.slice(4, 6)}` : val;
      case 'timeOne': return n.length >= 4 ? `${n.slice(0, 2)}:${n.slice(2, 4)}` : val;
      case 'dateTimeOne': return n.length >= 12 ? `${n.slice(0, 4)}/${n.slice(4, 6)}/${n.slice(6, 8)} ${n.slice(8, 10)}:${n.slice(10, 12)}` : val;
      default: return val;
    }
  }

  onBlur(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.value) return;
    const completed = this.fillIncompleteDate(input.value, this.calendarType);
    if (completed !== input.value) {
      const d = new Date(completed);
      if (!isNaN(d.getTime())) {
        this.control.setValue(d);
        input.value = completed;
      }
    }
  }

  private fillIncompleteDate(val: string, type: CalendarType): string {
    const n = val.replace(/\D/g, '');
    if (n.length === 4) {
      if (type === 'dateOne') return `${n}/01/01`;
      if (type === 'dateMonthOne') return `${n}/01`;
      if (type === 'dateTimeOne') return `${n}/01/01 00:00`;
    }
    if (n.length === 6 && type === 'dateOne') return `${n.slice(0, 4)}/${n.slice(4, 6)}/01`;
    if (n.length === 2 && type === 'timeOne') return `${n}:00`;
    return val;
  }

  onClose() {
    this.calendarEvent.emit(this.control.value);
  }
}
