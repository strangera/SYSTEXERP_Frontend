import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-datemm-range',
  templateUrl: './datemm-range.component.html',
  styleUrl: './datemm-range.component.scss'
})
export class DatemmRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() startControl!: FormControl;
  @Input() endControl!: FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    this.checkTwoRequiredValidator(this.startControl, this.endControl);
    // Placeholder
    this.setDefaultPlaceholder('請選擇月份');
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
