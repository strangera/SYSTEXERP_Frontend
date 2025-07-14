import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BasicKitComponent } from '../../../../shared/componentextends/basic-kit/basic-kit.component';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrl: './password.component.scss'
})
export class PasswordComponent extends BasicKitComponent implements OnInit {
  @Input() label: string | undefined;
  @Input() controlName = '';
  @Input() control = new FormControl();
  @Input() submitted = false; // 檢查欄位是否標準
  @Input() disabled: boolean | undefined;
  @Input() customPlaceholder: string | undefined;
  @Input() errorForGroup = false;
  @Input() showPasswordRule = true; // 是否顯示密碼規則
  @Input() feedback = true; // 是否顯示回饋訊息
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>\-_+=`~[\]\\;\']).{4,8}$';

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
