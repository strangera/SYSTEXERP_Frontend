import { NgIf, NgStyle } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberInputEvent } from 'primeng/inputnumber';
import { FieldStateDirective } from '@shared/directive/field-state.directive';
import { InputNumberComponent } from '../input-number/input-number.component';

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
  ],
  hostDirectives: [FieldStateDirective],
})
export class InputNumberRangeComponent implements OnInit {
  protected readonly fieldState = inject(FieldStateDirective, { self: true });

  // 必填欄位
  @Input() label = '';
  @Input() startLabel!: string;
  @Input() endLabel!: string;
  @Input() startControlName = '';
  @Input() endControlName = '';
  @Input() startControl = new FormControl(); // 開始值的 FormControl
  @Input() endControl = new FormControl(); // 結束值的 FormControl
  @Input() submitted = false;
  @Input() descLabel = '(起迄)'; // 標籤說明
  // Primeng 相關屬性
  @Input() minFractionDigits = 0; // 最小小數位數
  @Input() maxFractionDigits = 0; // 最大小數位數
  @Input() useGrouping = true; // 是否使用千分位
  @Input() mode: 'decimal' | 'currency' = 'decimal'; // 數字模式 || 貨幣模式
  @Input() suffix: string | undefined | null = null;
  @Input() step = 1; // 步進值
  @Input() showButtons = false; // 是否顯示按鈕
  @Input() allowUnlimited = false; // 若 true，傳遞給內部 app-input-number 以放寬限制
  // 觸發事件
  @Output() startChangeEvent = new EventEmitter<InputNumberInputEvent>();
  @Output() endChangeEvent = new EventEmitter<InputNumberInputEvent>();
  @Output() startBlurEvent = new EventEmitter<Event>();
  @Output() endBlurEvent = new EventEmitter<Event>();

  ngOnInit(): void {
    this.fieldState.checkRequiredValidator(this.startControl, 0);
    this.fieldState.checkRequiredValidator(this.endControl, 1);
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
