import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { AuthService } from '../../../service/system/auth.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { MenubarComponent } from '../../../shared/component/menubar/menubar.component';
import { AccordionModule } from 'primeng/accordion';
import { InputTextComponent } from '../../../shared/componentkit/input-text/input-text.component';
import { PasswordComponent } from './password/password.component';
import { ButtonComponent } from '../../../shared/componentkit/button/button.component';
import { TranslateModule } from '@ngx-translate/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

export interface UserInfo {
  AccessToken: string;
  USER_PwdExpireDate: string;
  id: string;
  user_Name: string;
  user_No: string;
  user_email: string;
}

@UntilDestroy()
@Component({
  selector: 'app-changepsw',
  templateUrl: './changepsw.component.html',
  standalone: true,
  imports: [
    MenubarComponent,
    AccordionModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextComponent,
    PasswordComponent,
    ButtonComponent,
    TranslateModule,
  ],
})
export class ChangepswComponent implements OnInit {
  submitted = false;
  loading = false;
  customBreadcrumbItems: MenuItem[] = [{ label: '修改使用者密碼' }];
  userForm = this.formBuilder.group({
    User_No: [{ value: '', disabled: true }],
    User_Name: [{ value: '', disabled: true }],
    Old_password: ['', Validators.required],
    New_password: ['', [Validators.required, Validators.minLength(4), this.validationService.passwordStrengthValidator()]],
    New_password2: ['', Validators.required]
  }, { validators: this.validationService.passwordsMatchValidator('New_password', 'New_password2') });

  constructor(
    private notemessage: NotificationService,
    private encrypt: EncryptionService,
    private userCodeService: UserCodeService,
    private authService: AuthService,
    private validationService: ValidationService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    const userInfoString = this.authService.getUserInfo();
    if (userInfoString) {
      this.userForm.get('User_No')?.setValue(userInfoString.user_No);
      this.userForm.get('User_Name')?.setValue(userInfoString.user_Name);
    }
  }
  changePass(frm: FormGroup) {
    this.submitted = true;
    this.notemessage.blockUi();
    if (frm.valid) {
      this.notemessage.unblockUi();
      this.loading = true;
      const body = {
        User_No: frm.get('User_No')?.value,
        Old_password: this.encrypt.getPassword(frm.get('User_No')?.value, frm.value.Old_password),
        New_password: this.encrypt.getPassword(frm.get('User_No')?.value, frm.value.New_password),
        PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      }
      this.userCodeService.changePassword(body).pipe(untilDestroyed(this)).subscribe({
        next: (response) => {
          if (response && response.Status == "0000") {
            this.notemessage.successBubble(response?.Message, '更新成功');
            this.authService.logout();
          } else {
            this.notemessage.errorBubble(response?.Message, "更新失敗");
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      })
    }
  }
}
