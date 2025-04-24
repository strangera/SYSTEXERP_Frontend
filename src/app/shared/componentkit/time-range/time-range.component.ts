import { Component, Input, OnInit } from '@angular/core';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-time-range',
  templateUrl: './time-range.component.html',
  styleUrl: './time-range.component.scss'
})
export class TimeRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() startControl: FormControl = new FormControl;
  @Input() endControl: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit() {
    // Required *
    // this.checkTwoRequiredValidator(this.startControl, this.endControl);
    // Placeholder
    // this.setDefaultPlaceholder('請選擇日期時間');
    //
    this.startControl.valueChanges.subscribe(() => this.validateRange());
    this.endControl.valueChanges.subscribe(() => this.validateRange());
  }

  validateRange() {
    if (this.startControl.value && this.endControl.value && this.startControl.value > this.endControl.value) {
      this.endControl.setErrors({ invalidDateRange: true });
    } else {
      this.endControl.setErrors(null);
    }
  }
}

