import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrl: './input-number.component.scss',
})
export class InputNumberComponent extends BasicKitComponent implements OnInit, OnDestroy {
  @Input() label = '';
  @Input() suffix: string | undefined | null = null;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() step = 1; // 步進值
  @Input() showButtons = false; // 是否顯示按鈕
  @Input() min = 0; // 最小值
  @Input() max = 99999999999; // 最大值
  @Input() minFractionDigits = 0; // 最小小數位數
  @Input() maxFractionDigits = 0; // 最大小數位數
  @Input() useGrouping = true; // 是否使用千分位
  @Input() mode: 'decimal' | 'currency' = 'decimal'; // 數字模式
  @Input() incrementButtonClass = ''; // 增加按鈕樣式
  @Input() decrementButtonClass = ''; // 減少按鈕樣式
  @Input() customPlaceholder: string | undefined;
  @Output() changeEvent = new EventEmitter<any>();
  @Output() blurEvent = new EventEmitter<any>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // 動態設置 max 值，// 設置 max 為 10^maxLength - 1
    if (this.maxLength) { this.max = Math.pow(10, this.maxLength) - 1; }
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    if (this.control?.disabled) {
      this.placeholder = '';
    } else {
      this.updateControlState(this.control);
    }
    // 訂閱 control 的狀態變化
    this.control.statusChanges
      .pipe(takeUntil(this.destroy$)) // 使用 takeUntil 確保組件銷毀時取消訂閱
      .subscribe(() => {
        this.updatePlaceholderState(); // 當狀態改變時重新評估 placeholder
      });
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
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
