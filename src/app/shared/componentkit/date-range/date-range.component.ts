import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  styleUrl: './date-range.component.scss'
})
// 日期,範圍選擇器
export class DateRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() startControl!: FormControl;
  @Input() endControl!: FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    // this.checkTwoRequiredValidator(this.startControl, this.endControl);
    // Placeholder
    // this.setDefaultPlaceholder('請選擇日期');
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
}
