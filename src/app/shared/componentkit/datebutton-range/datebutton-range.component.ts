import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-datebutton-range',
  templateUrl: './datebutton-range.component.html',
  styleUrl: './datebutton-range.component.scss',
  encapsulation: ViewEncapsulation.None,

})
export class DatebuttonRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() startControl!: FormControl;
  @Input() endControl!: FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    this.checkTwoRequiredValidator(this.startControl, this.endControl);
    // Placeholder
    this.setDefaultPlaceholder('請選擇日期');
    //
    this.startControl.valueChanges.subscribe(() => this.validateRange());
    this.endControl.valueChanges.subscribe(() => this.validateRange());
    // Ensure the time part is set to 00:00:00
    this.setDefaultTime(this.startControl);
    this.setDefaultTime(this.endControl);
  }

  validateRange() {
    if (this.startControl.value && this.endControl.value && this.startControl.value > this.endControl.value) {
      this.endControl.setErrors({ invalidDateRange: true });
    } else {
      this.endControl.setErrors(null);
    }
  }

  setDefaultTime(control: FormControl) {
    if (control.value) {
      const date = new Date(control.value);
      date.setHours(0, 0, 0, 0);
      control.setValue(date, { emitEvent: false });
    }
  }
  // 去年:
  onLastYear() {
    const now = new Date();
    const lastYear = now.getFullYear() - 1;

    // 設定去年的開始日期 (例如，去年1月1日)
    const startDate = new Date(lastYear, 0, 1); // 0 是一月
    this.startControl.setValue(startDate, { emitEvent: true });

    // 設定去年的結束日期 (例如，去年12月31日)
    const endDate = new Date(lastYear, 11, 31); // 11 是十二月
    this.endControl.setValue(endDate, { emitEvent: true });
  }
	// 今年:
  onThisYear() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1); // 今年1月1日
    const endDate = new Date(now.getFullYear(), 11, 31); // 今年12月31日
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 上半年:
  onFirstHalf() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1); // 今年1月1日
    const endDate = new Date(now.getFullYear(), 5, 30); // 今年6月30日
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 下半年:
  onSecondHalf() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 6, 1); // 今年7月1日
    const endDate = new Date(now.getFullYear(), 11, 31); // 今年12月31日
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 第一季:
  onFirstQuarter() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1); // 今年1月1日
    const endDate = new Date(now.getFullYear(), 2, 31); // 今年3月31日
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 第二季:
  onSecondQuarter() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 3, 1); // 今年4月1日
    const endDate = new Date(now.getFullYear(), 5, 30); // 今年6月30日
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 第三季:
  onThirdQuarter() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 6, 1); // 今年7月1日
    const endDate = new Date(now.getFullYear(), 8, 30); // 今年9月30日
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 第四季:
  onFourthQuarter() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 9, 1); // 今年10月1日
    const endDate = new Date(now.getFullYear(), 11, 31); // 今年12月31日
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 上上個月:
  onMonthBeforeLast() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 上上個月的1日
    const endDate = new Date(now.getFullYear(), now.getMonth() - 1, 0); // 上上個月的最後一天
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 上個月:
  onLastMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1); // 上個月的1日
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0); // 上個月的最後一天
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 本月:
  onThisMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 本月的1日
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // 本月的最後一天
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 上週:
  onLastWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek - 6); // 上週的第一天
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek); // 上週的最後一天
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(endDate, { emitEvent: true });
    this.validateRange();
  }
	// 前天:
  onDayBeforeYesterday() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 2); // 前天
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(startDate, { emitEvent: true });
    this.validateRange();
  }
	// 昨天:
  onYesterday() {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); // 昨天
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(startDate, { emitEvent: true });
    this.validateRange();
  }
	// 今天:
  onToday() {
    const startDate = new Date(); // 今天
    this.startControl.setValue(startDate, { emitEvent: true });
    this.endControl.setValue(startDate, { emitEvent: true });
    this.validateRange();
  }
}
