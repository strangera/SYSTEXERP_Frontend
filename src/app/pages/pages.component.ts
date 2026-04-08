import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { AuthService } from '@service/system/auth.service';
import { UserCodeService } from '@service/system/user-code.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { UserInfo } from '@shared/models/system/userInfo';
import { EncryptionService } from '@shared/service/encryption.service';
import { ValidationService } from '@shared/service/validation.service';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { finalize } from 'rxjs';
import { LayoutComponent } from '../core/layout/layout.component';

@UntilDestroy()
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  providers: [DatePipe],
  standalone: true,
  imports: [
    LayoutComponent,
    RouterOutlet,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    PasswordModule,
    DialogModule,
    Button,
    DividerModule,
  ],
})
export class PagesComponent implements OnInit {
  user: UserInfo | null = null;
  visible = false;
  form = this.formBuilder.group(
    {
      code: [{ value: '', disabled: true }],
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8), this.validationService.passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') },
  );

  // 可有可無，沒用到可以刪掉
  strongRegex = '^(?=.*[a-z])(?=.*[0-9]).{4,8}$';

  formButtonLoading = false;
  noClose = false;

  constructor(
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private encryptionService: EncryptionService,
    private userCodeService: UserCodeService,
    private messageService: NotificationService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    const userInfo = this.authService.currentUserValue;

    if (userInfo && userInfo.USER_PwdExpireDate) {
      this.user = userInfo; // ✅ 把 user 存起來給 onSubmit 用

      const passwordExpireDate = new Date(userInfo.USER_PwdExpireDate);
      if (passwordExpireDate <= new Date()) {
        this.messageService.warnBubble(
          '為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。',
          '建議您定期更換密碼',
        );
        this.visible = true;
        this.noClose = true;
        this.form.patchValue({ code: userInfo.user_No }); // 顯示 user_No 在畫面上
      }
    }
  }

  onSubmit(frm: FormGroup): void {
    frm.markAllAsTouched();
    if (!frm.valid) return;

    const userNo = this.user?.user_No;
    if (!userNo) {
      this.messageService.errorBubble('無法取得使用者代碼，請重新登入後再試一次');
      return;
    }

    this.formButtonLoading = true;

    const query = {
      User_No: userNo,
      Old_password: this.encryptionService.getPassword(userNo, frm.value.oldPassword),
      New_password: this.encryptionService.getPassword(userNo, frm.value.newPassword),
      PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };

    this.userCodeService
      .changePassword(query)
      .pipe(
        untilDestroyed(this),
        finalize(() => (this.formButtonLoading = false)),
      )
      .subscribe({
        next: (response) => {
          if (response && response.Status === '0000') {
            this.messageService.successBubble(response?.Message, '更新成功');
            this.authService.logout();
          } else {
            this.messageService.errorBubble(response?.Message, '更新失敗');
          }
        },
        error: (err) => {
          console.error('Change password failed:', err);
        },
      });
  }
}
