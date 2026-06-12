import { NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { ControlMessagesComponent } from '../../../../shared/component/control-messages/control-messages.component';
import { BasicKitComponent } from '../../../../shared/componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-password',
  template: `
  <label *ngIf="label" [for]="controlName">{{ label }}
    <span *ngIf="isRequired" class="text-red-500">*</span>
  </label>
  <p-password styleClass="w-full" inputStyleClass="w-full" title='請輸入' [id]="controlName" type="text"
    [formControl]="control" [placeholder]="control.disabled ? '' : placeholder" [minlength]="minLength"
    [maxLength]="maxLength" [feedback]="feedback"
    [ngClass]="{'ng-invalid ng-dirty': submitted && control.errors || (this.errorForGroup && this.control.parent?.errors)}"
    [attr.aria-label]="label || placeholder" title="{{ label || placeholder }}" promptLabel="設定密碼" weakLabel="太簡單"
    mediumLabel="中等複雜度" strongLabel="複雜密碼" [toggleMask]="true" appendTo="body" [strongRegex]="strongRegex">
    <ng-template pTemplate="footer">
      <div *ngIf="showPasswordRule" class="flex flex-column">
        <p-divider />
        <p class="mt-2">密碼規則格式限制：</p>
        <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
          <li>字數限制：4 至 8 個字元</li>
          <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
            <li>至少一個英文小寫字母（a–z）</li>
            <li>至少一個數字（0–9）</li>
          </ul>
        </ul>
      </div>
    </ng-template>
  </p-password>
  <app-control-messages [onerror]="submitted || (control.touched && control.invalid)" [control]="control"
    [errorForGroup]='errorForGroup'></app-control-messages>
  <ng-content>
  </ng-content>
  `,
  standalone: true,
  imports: [NgIf, PasswordModule, FormsModule, ReactiveFormsModule, NgClass, PrimeTemplate, DividerModule, ControlMessagesComponent]
})
export class PasswordComponent extends BasicKitComponent implements OnInit {
  @Input() override label = '';
  @Input() override controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() disabled: boolean | undefined;
  @Input() customPlaceholder: string | undefined;
  @Input() errorForGroup = false;
  @Input() showPasswordRule = true; // 是否顯示密碼規則
  @Input() feedback = true; // 是否顯示回饋訊息
  strongRegex = '^(?=.*[a-z])(?=.*[0-9]).{4,8}$';

  ngOnInit(): void {
    if (this.disabled) {
      this.control.disable({ emitEvent: false });
    }
    if (this.customPlaceholder) {
      this.placeholder = this.customPlaceholder;
    }
    this.updateControlState(this.control);
  }
}
