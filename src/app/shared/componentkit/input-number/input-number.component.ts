import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgClass } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
@UntilDestroy()
@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
  standalone: true,
  imports: [
    NgIf,
    InputGroupModule,
    InputNumberModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    InputGroupAddonModule,
    ControlMessagesComponent,
  ],
})
export class InputNumberComponent extends BasicKitComponent implements OnInit, OnChanges {
  @Input() label = '';
  @Input() suffix: string | undefined | null = null;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() step = 1; // 步進值
  @Input() showButtons = false; // 是否顯示按鈕
  @Input() min: number | null = 0; // 最小值
  @Input() max = 99999999999; // 最大值
  @Input() minFractionDigits = 0; // 最小小數位數
  @Input() maxFractionDigits = 0; // 最大小數位數
  @Input() useGrouping = true; // 是否使用千分位
  @Input() mode: 'decimal' | 'currency' = 'decimal'; // 數字模式
  @Input() incrementButtonClass = ''; // 增加按鈕樣式
  @Input() decrementButtonClass = ''; // 減少按鈕樣式
  @Input() customPlaceholder: string | undefined;
  @Input() showLabel = true;
  @Input() showErrorMessage = true;
  @Output() changeEvent = new EventEmitter<any>();
  @Output() blurEvent = new EventEmitter<any>();

  ngOnInit(): void {
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    if (this.control?.disabled) {
      this.placeholder = '';
    } else {
      this.updateControlState(this.control);
    }
    // 訂閱 control 的狀態變化
    this.control.statusChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updatePlaceholderState();
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submitted']?.currentValue === true) {
      this.updateControlState(this.control);
      this.control.markAsTouched();
      this.control.updateValueAndValidity({ emitEvent: false });
    }
  }

  // 抽出邏輯到一個獨立的方法，方便重用
  private updatePlaceholderState(): void {
    if (this.control?.disabled) {
      this.placeholder = '';
    } else {
      this.updateControlState(this.control); // 假設 updateControlState 會處理 placeholder
    }
  }
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.changeEvent.emit(input.value);
  }

  onBlur(event: Event) {
    this.blurEvent.emit(event);
  }
}
