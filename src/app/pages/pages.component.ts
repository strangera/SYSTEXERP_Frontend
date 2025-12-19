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
import { finalize, Subscription } from 'rxjs';
import { LayoutComponent } from '../core/layout/layout.component';

@UntilDestroy()
@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  providers: [DatePipe],
  standalone: true,
  imports: [
    LayoutComponent, RouterOutlet,
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
  private subscriptions: Subscription[] = [];
  visible = false;
  form = this.formBuilder.group({
    code: [{ value: '', disabled: true }],
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, this.validationService.passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') });
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>-_+=`~[]\\;\']).{4,8}$';
  formButtonLoading = false;
  noClose = false;
  constructor(
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private encryptionService: EncryptionService,
    private userCodeService: UserCodeService,
    private messageService: NotificationService,
    public authService: AuthService,
  ) { }

  ngOnInit() {
    // 密碼過期檢查移到 AuthService 的 isLoggedIn 或 AuthGuard
    // 或者在 SsoDashboardComponent 初始化時只讀取並顯示通知，不強制打開對話框
    // 如果要強制打開，確保其在獲取到 user.user_No 後才填充表單
    const userInfo = this.authService.currentUserValue; // 直接從 AuthService 獲取最新狀態
    if (userInfo && userInfo.USER_PwdExpireDate) {
      const passwordExpireDate = new Date(userInfo.USER_PwdExpireDate);
      if (passwordExpireDate <= new Date()) {
        this.messageService.warnBubble(
          '為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。',
          '建議您定期更換密碼',
        );
        this.visible = true;
        this.noClose = true; // 禁用關閉，強制用戶修改密碼
        this.form.patchValue({ code: userInfo.user_No }); // 設置 user_No 到表單
      }
    }
  }

  onSubmit(frm: FormGroup): void {
    frm.markAllAsTouched();
    if (frm.valid) {
      this.formButtonLoading = true;
      const query = {
        User_No: this.user?.user_No || '',
        Old_password: this.encryptionService.getPassword(this.user?.user_No || '', frm.value.oldPassword),
        New_password: this.encryptionService.getPassword(this.user?.user_No || '', frm.value.newPassword),
        PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 密碼到期日設為90天後
      };
      this.subscriptions.push( // 將訂閱添加到 subscriptions 陣列
        this.userCodeService.changePassword(query).pipe(
          untilDestroyed(this),
          finalize(() => this.formButtonLoading = false) // 無論成功失敗，都重置按鈕載入狀態
        ).subscribe({
          next: () => {
            this.messageService.successBubble('密碼修改成功');
            this.authService.logout(); // 修改密碼成功後登出
            // this.formButtonLoading = false; // 這裡不需要，因為 finalize 會處理
          },
          error: (err) => {
            // 錯誤處理會由 ErrorHandlerService 負責顯示訊息
            console.error('Change password failed:', err);
            // this.formButtonLoading = false; // 這裡不需要，因為 finalize 會處理
          },
        })
      );
    }
  }
}
