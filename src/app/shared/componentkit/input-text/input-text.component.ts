import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { Subject, takeUntil } from 'rxjs';
import { NgIf, NgClass } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonComponent } from '../button/button.component';
import { ControlMessagesComponent } from '../../component/control-messages/control-messages.component';

@Component({
    selector: 'app-input-text',
    templateUrl: './input-text.component.html',
    styleUrl: './input-text.component.scss',
    standalone: true,
    imports: [NgIf, FormsModule, InputTextModule, ReactiveFormsModule, NgClass, TooltipModule, ButtonComponent, ControlMessagesComponent]
})
export class InputTextComponent extends BasicKitComponent implements OnInit {
  @Input() label = '';
  @Input() controlName = '';
  @Input() control = new FormControl;
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() disabled: boolean | undefined;
  @Input() showCopyButton = false;
  @Input() customPlaceholder: string | undefined;
  @Input() errorForGroup = false;
  @Input() showStar = false;
  value = '********************************************************************************************************************************************************************************************************************************************************************************************************';

  @Input() showButton = false;
  @Input() buttonLabel = '';
  @Input() buttonLoading = false;
  @Output() clickButton = new EventEmitter<any>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.disabled) {
      this.control.disable({ emitEvent: false });
    }
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    this.updateControlState(this.control);
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
  onClick(): void {
    this.clickButton.emit();
  }
}
