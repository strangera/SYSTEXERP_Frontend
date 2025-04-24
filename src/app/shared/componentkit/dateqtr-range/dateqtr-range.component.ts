import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-dateqtr-range',
  templateUrl: './dateqtr-range.component.html',
  styleUrl: './dateqtr-range.component.scss'
})
// 季 (需要調整，因為不確定回傳欄位是什麼)
export class DateqtrRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() startControl!: FormControl;
  @Input() endControl!: FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準
  seasons = [
    { label: '第一季', value: 1 },
    { label: '第二季', value: 2 },
    { label: '第三季', value: 3 },
    { label: '第四季', value: 4 }
  ];

  ngOnInit() {
    // Required *
    // this.checkTwoRequiredValidator(this.startControl, this.endControl);
    //
    this.placeholder = '選擇季';
  }

  validateRange() {
    if (this.startControl.value && this.endControl.value && this.startControl.value > this.endControl.value) {
      this.endControl.setErrors({ invalidDateRange: true });
    } else {
      this.endControl.setErrors(null);
    }
  }
}
