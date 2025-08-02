import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgClass } from '@angular/common';
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
    NgClass,
    ReactiveFormsModule,
    InputNumberComponent,
    InputGroupModule,
    InputGroupAddonModule,
  ]
})
export class InputNumberRangeComponent extends BasicKitComponent implements OnInit {
  // 必填欄位
  @Input() label = '';
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
}
