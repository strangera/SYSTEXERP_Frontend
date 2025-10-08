import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ValidationService } from '../../service/validation.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-control-messages',
  templateUrl: './control-messages.component.html',
  standalone: true,
  imports: [NgIf],
})
export class ControlMessagesComponent {
  // 是否按下確認
  @Input() onerror = false;
  @Input() control!: AbstractControl | null;
  @Input() errorForGroup = false; // 新增輸入值，決定是否顯示 FormGroup 的錯誤

  constructor(private validService: ValidationService) { }

  get errorMessage() {
    if (this.onerror && this.control) {
      // 1️⃣ 先檢查自身的錯誤
      if (this.control.errors) {
        for (const propertyName in this.control.errors) {
          if (Object.prototype.hasOwnProperty.call(this.control.errors, propertyName)) {
            return this.validService.getValidatorErrorMessage(
              propertyName,
              this.control.errors[propertyName]
            );
          }
        }
      }

      // 2️⃣ 只在 `errorForGroup = true` 時顯示 `FormGroup` 的錯誤
      if (this.errorForGroup && this.control.parent?.errors) {
        for (const propertyName in this.control.parent.errors) {
          if (Object.prototype.hasOwnProperty.call(this.control.parent.errors, propertyName)) {
            return this.validService.getValidatorErrorMessage(
              propertyName,
              this.control.parent.errors[propertyName]
            );
          }
        }
      }
    }
    return null;
  }
}
