import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BasicKitComponent } from '../../componentextends/basic-kit/basic-kit.component';
import { NgIf, NgClass } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberInputEvent, InputNumberModule } from 'primeng/inputnumber';
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
    NgClass,
    ReactiveFormsModule,
    InputNumberModule,
    InputGroupModule,
    InputGroupAddonModule,
    ControlMessagesComponent,
  ],
})
export class InputNumberComponent extends BasicKitComponent implements OnInit {
  // 必填
  @Input() label = '';
  @Input() showLabel = true;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  // Primeng 相關屬性
  @Input() min: number | null = 0; // 最小值
  @Input() max = 99999999999; // 最大值
  @Input() minFractionDigits = 0; // 最小小數位數
  @Input() maxFractionDigits = 0; // 最大小數位數
  @Input() useGrouping = true; // 是否使用千分位
  @Input() mode: 'decimal' | 'currency' = 'decimal'; // 數字模式 || 貨幣模式
  @Input() suffix: string | undefined | null = null;
  @Input() step = 1; // 步進值
  @Input() showButtons = false; // 是否顯示按鈕
  // 自訂屬性
  @Input() customPlaceholder: string | undefined; // 自訂提示
  @Input() showErrorMessage = true;
  // 觸發事件
  @Output() changeEvent = new EventEmitter<InputNumberInputEvent>();

  ngOnInit(): void {
    this.updateControlState(this.control);
    // 訂閱 control 的狀態變化
    this.control.statusChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateControlState();
    });
  }
  onInputChange(event: InputNumberInputEvent) {
    this.changeEvent.emit(event);
  }
}
