import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CalendarType } from '../calendar.component';

@Component({
  selector: 'app-readonly-calendar-display',
  templateUrl: './readonly-calendar-display.component.html',
  styleUrls: ['./readonly-calendar-display.component.scss'], // 引用唯讀模式樣式
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule]
})
export class ReadonlyCalendarDisplayComponent {
  @Input({ required: true }) control!: FormControl;
  @Input() calendarType: CalendarType = 'dateOne';
  @Input() showSeconds = false;
  @Input() placeholder: string | undefined;
  @Input() submitted = false; // 用於錯誤樣式
  @Input() controlName = '';

  /**
   * 根據 calendarType 格式化並返回要顯示的字串值。
   * 這是從 CalendarComponent 中移動過來的核心邏輯。
   */
  get displayValue(): string {
    const value = this.control.value;
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);

    // 處理無效日期或非日期物件 (如果值不是有效日期，則原樣返回或轉字串)
    if (isNaN(date.getTime())) {
      return value.toString();
    }

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
        // 預設與 dateOne 相同
        return `${date.getFullYear()}/${padZero(date.getMonth() + 1)}/${padZero(date.getDate())}`;
    }
  }

  /**
   * 負責應用唯讀和錯誤樣式。
   */
  get calendarClasses(): string {
    const classes = ['w-full', 'readonly-field']; // 唯讀模式下固定添加 readonly-field

    // 檢查錯誤狀態，以應用 ng-invalid 樣式
    if (this.submitted && this.control.errors) {
      classes.push('ng-dirty', 'ng-invalid');
    }

    return classes.join(' ');
  }
}