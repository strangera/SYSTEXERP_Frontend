import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { first } from 'rxjs';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../../service/system/auth.service';
import { userLogin } from '../../../shared/models/system/userLogin';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { PasswordModule } from 'primeng/password';
import { Button, ButtonDirective } from 'primeng/button';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    PasswordModule,
    NgClass,
    Button,
    ButtonDirective,
  ],
})
export class LoginComponent implements OnInit {
  logoPath = 'assets/layout/images/login_logo.webp';
  loginForm = this.formBuilder.group({
    code: ['' as string, Validators.required],
    password: ['' as string, Validators.required],
  });
  submitted = false;
  loading = false;

  private readonly URL_KEY = 'preLoginUrlOnce'; // 只存一次

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private notemessage: NotificationService,
  ) { }

  ngOnInit(): void { }

  // ✅ 只存一次，目前頁面實際的完整 URL（例如 http://localhost:4200/login%20123）
  private saveCurrentUrlOnce(): void {
    if (typeof window === 'undefined') return;
    try {
      if (!localStorage.getItem(this.URL_KEY)) {
        localStorage.setItem(this.URL_KEY, window.location.href);
        // 如果你想存「解碼後」的可讀版本，改成：decodeURI(window.location.href)
      }
    } catch {
      // 無痕模式/空間不足就忽略
    }
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;

    // 送出前記錄一次目前 URL
    this.saveCurrentUrlOnce();

    if (frm.invalid) return;

    this.loading = true;
    this.authService.login(this.loginForm.value as userLogin)
      .pipe(first(), untilDestroyed(this))
      .subscribe({
        next: () => {
          this.notemessage.successBubble('登入成功');
          this.loading = false;
        },
        error: () => {
          this.loginForm.patchValue({ password: '' }); // 清空密碼
          this.loading = false;
        }
      });

    this.notemessage.unblockUi();
  }
}
