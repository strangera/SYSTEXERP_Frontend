import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-input-number-range',
  templateUrl: './input-number-range.component.html',
  styleUrl: './input-number-range.component.scss'
})
export class InputNumberRangeComponent extends BasicKitComponent implements OnInit {
  @Input() label: string = '';
  @Input() startControl: FormControl = new FormControl;
  @Input() endControl: FormControl = new FormControl;
  @Input() submitted: boolean = false; // 檢查欄位是否標準

  ngOnInit(): void {
    // Required *
    this.checkTwoRequiredValidator(this.startControl, this.endControl);
    // Placeholder
    this.setDefaultPlaceholder('輸入數字');
    //
    this.startControl.valueChanges.subscribe(() => this.validateRange());
    this.endControl.valueChanges.subscribe(() => this.validateRange());
  }

  validateRange() {
    if (this.startControl.value && this.endControl.value && this.startControl.value > this.endControl.value) {
      this.endControl.setErrors({ invalidNumberRange: true });
    } else {
      this.endControl.setErrors(null);
    }
  }
}
