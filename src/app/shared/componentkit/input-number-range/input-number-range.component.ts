import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgStyle } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberComponent } from '../input-number/input-number.component';
import { InputNumberInputEvent } from 'primeng/inputnumber';

@Component({
  selector: 'app-input-number-range',
  templateUrl: './input-number-range.component.html',
  styleUrl: './input-number-range.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf,
    NgStyle,
    ReactiveFormsModule,
    InputNumberComponent,
    InputGroupModule,
    InputGroupAddonModule,
  ]
})
export class InputNumberRangeComponent extends BasicKitComponent implements OnInit {
  // 必填欄位
  @Input() override label = '';
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() startControlName = '';
  @Input() endControlName = '';
  @Input() startControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl = new FormControl(); // 結束值的 FormControl
  @Input() submitted = false;
  // Primeng 相關屬性
  @Input() minFractionDigits = 0; // 最小小數位數
  @Input() maxFractionDigits = 0; // 最大小數位數
  @Input() useGrouping = true; // 是否使用千分位
  @Input() mode: 'decimal' | 'currency' = 'decimal'; // 數字模式 || 貨幣模式
  @Input() suffix: string | undefined | null = null;
  @Input() step = 1; // 步進值
  @Input() showButtons = false; // 是否顯示按鈕
  // 觸發事件
  @Output() startChangeEvent = new EventEmitter<InputNumberInputEvent>();
  @Output() endChangeEvent = new EventEmitter<InputNumberInputEvent>();
  @Output() startBlurEvent = new EventEmitter<Event>();
  @Output() endBlurEvent = new EventEmitter<Event>();

  ngOnInit(): void {
    this.checkRequiredValidator(this.startControl, 0);
    this.checkRequiredValidator(this.endControl, 1);
  }

  onStartInputChange(event: InputNumberInputEvent) {
    this.startChangeEvent.emit(event);
  }
  onEndInputChange(event: InputNumberInputEvent) {
    this.endChangeEvent.emit(event);
  }
  onStartBlur(event: Event) {
    // 如果開始值大於結束值,則將開始值設為結束值
    const start = this.startControl.value;
    const end = this.endControl.value;
    if (start != null && end != null && start > end) {
      this.startControl.setValue(end);
    }
    this.startBlurEvent.emit(event);
  }
  onEndBlur(event: Event) {
    // 如果結束值小於開始值,則將結束值設為開始值
    const start = this.startControl.value;
    const end = this.endControl.value;
    if (start != null && end != null && start > end) {
      this.endControl.setValue(start);
    }
    this.endBlurEvent.emit(event);
  }
}
