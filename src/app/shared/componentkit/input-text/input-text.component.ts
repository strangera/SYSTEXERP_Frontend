import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
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
  imports: [
    NgIf,
    NgClass,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TooltipModule,
    ButtonComponent,
    ControlMessagesComponent
  ]
})
export class InputTextComponent extends BasicKitComponent implements OnInit {
  // 必填
  @Input() label = '';
  @Input() showLabel = true;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  // 自訂屬性
  @Input() showCopyButton = false; // 是否顯示複製按鈕
  @Input() customPlaceholder: string | undefined;
  @Input() errorForGroup = false; // 是否顯示群組錯誤訊息
  @Input() showStar = false; // 是否顯示星號
  value = '*****************************************'; // 用於顯示星號的值
  @Input() showButton = false; // 是否顯示按鈕
  @Input() buttonLabel = ''; // 按鈕標籤
  @Input() buttonLoading = false; // 按鈕是否加載中
  @Input() copyControl = new FormControl(); // 用於複製的控制項
  @Input() showErrorMessage = true;
  @Input() disabled = false; // 是否禁用輸入框
  // 觸發事件
  @Output() clickButton = new EventEmitter<unknown>(); // 按鈕點擊事件
  @Output() inputChange = new EventEmitter<Event>(); // 輸入變更事件

  ngOnInit(): void {
    this.initControl(this.control);
    if (this.disabled) {
      this.control.disable();
    }
  }
  onInputChange(event: Event): void {
    if (this.copyControl) {
      this.copyControl.setValue(this.control.value, { emitEvent: false });
    }
    this.inputChange.emit(event);
  }
  onClick(): void {
    this.clickButton.emit();
  }
}
