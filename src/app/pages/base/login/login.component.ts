import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs';
import { registerLocaleData } from '@angular/common';
import zhHant from '@angular/common/locales/zh-Hant';
import { AuthService } from '../../../service/system/auth.service';
import { CommonService } from '../../../shared/service/common.service';
import { userLogin } from '../../../shared/models/system/userLogin';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { Router } from '@angular/router';

registerLocaleData(zhHant, 'zh-tw');

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  logoPath = 'assets/layout/images/login_logo.png';
  loginForm = this.formBuilder.group({
    code: ['admin' as string, Validators.required],
    password: ['1' as string, Validators.required],
    client_ip: ['' as string]
  });
  submitted = false;
  loading = false;
  ipAddress = '';
  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private notemessage: NotificationService,
    private commService: CommonService,
    private router: Router,
  ) {
  }

  ngOnInit(): void {
    // 檢查使用者是否已經登入
    if (this.authService.currentUserValue) {
      // 如果已經登入，則導向到主頁面（例如 dashboard）
      this.router.navigate(['/SSO/dashboard']);
      return; // 終止 ngOnInit 的執行，避免不必要的 IP 請求
    }
    this.commService.getIPAddress().subscribe((result: any) => {
      this.ipAddress = result.ip;
    });
  }

  onSubmit(frm: FormGroup) {
    this.submitted = true;
    if (frm.invalid) return;
    this.loading = true;
    this.loginForm.value.client_ip = this.ipAddress;
    this.authService.login(this.loginForm.value as userLogin).pipe(first()).subscribe({
      next: () => {
        this.notemessage.successBubble('登入成功');
        console.log('登入成功', this.loginForm.value);
        this.loading = false;
      },
      error: () => {
        this.loginForm.patchValue({ password: '' }); //清空密碼
        this.loading = false;
      }
    });
    this.notemessage.unblockUi();
  }
}
