import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../../shared/service/layout.service';
import { AuthService } from '../../../service/system/auth.service';
import { UserInfo } from '../../../models/system/userInfo';
import { forkJoin, Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiItem, SsoDashboardService } from './sso-dashboard.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { NotificationService } from '../../../shared/service/notification.service';
import { Sys1000Service } from '../../../service/SYS100/sys1000.service';

@Component({
  selector: 'app-sso-dashboard',
  templateUrl: './sso-dashboard.component.html',
  styleUrl: './sso-dashboard.component.scss'
})
export class SsoDashboardComponent implements OnInit {
  logo: string = 'assets/layout/images/logo.png';
  user: UserInfo | null = null;
  private subscriptions: Subscription[] = [];
  data: UserInfo | null = null; // 使用者資料
  items!: MenuItem[];

  urlItems: ApiItem[] = [];
  loading = true;
  errorMessage = '';
  visible = false; // 控制對話框的顯示與隱藏
  form = this.formBuilder.group({
    code: [{ value: '', disabled: true }],
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required]],
    // newPassword: ['', [Validators.required, this.validationService.passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
  });// }, { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') });
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>\-_+=`~[\]\\;\']).{4,8}$';
  formButtonLoading = false; // 控制按鈕的載入狀態

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private sys1000Service: Sys1000Service,
    public router: Router,
    private ssoDashboardService: SsoDashboardService,
    private formBuilder: FormBuilder,
    private validationService: ValidationService,
    private encryptionService: EncryptionService,
    private messageService: NotificationService,
  ) {
    this.subscriptions.push(this.authService.user.subscribe(x => this.user = x));
  }
  ngOnInit() {
    this.items = [
      {
        label: '個人資料',
        items: [
          { label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => { this.visible = true; this.form.reset() } },
          { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
        ]
      },
    ];
    try {
      const userInfo = sessionStorage.getItem('UserInfo');
      this.data = userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error("Failed to parse UserInfo:", error);
    }
    this.fetchUrlList();

    const time = JSON.parse(sessionStorage.getItem('UserInfo') || '{}').USER_PwdExpireDate;
    // if (time <= new Date().toISOString()) {
    if (true) {
      this.messageService.errorBubble('超過90天使用時間，請修改密碼');
      this.visible = true;
      console.log('密碼過期');
    }
  }
  fetchUrlList(): void {
    this.loading = true;
    this.ssoDashboardService.fetchUrlList().subscribe({
      next: (data) => {
        this.urlItems = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = '無法載入 URL 清單。請稍後再試。';
        this.loading = false;
        console.error('API 錯誤:', error);
      }
    });
  }

  navigateToUrl(item: ApiItem): void {
    if (item.routerLink) {
      this.loading = true; // 開始載入，顯示 loading 效果 (如果需要)
      forkJoin([
        this.authService.getFunRightsInfo(),
        this.sys1000Service.getData()
      ]).subscribe({
        next: ([funRightsResponse, sys1000Response]) => {
          sessionStorage.setItem('SYSTEMSetting', JSON.stringify(sys1000Response));
          this.loading = false; // 停止載入
          this.router.navigate([item.routerLink]); // 切換路由
        },
        error: (error) => {
          // 其中一個或兩個 API 請求失敗
          console.error('API 請求失敗:', error);
          this.loading = false; // 停止載入
          this.errorMessage = '載入資料失敗，無法導航。'; // 顯示錯誤訊息 (如果需要)
          // 可以在這裡處理錯誤，例如顯示錯誤訊息給使用者
        }
      });
    } else if (item.url) {
      window.open(item.url, '_blank');
    }
  }

  onSubmit(frm: FormGroup): void {
    frm.markAllAsTouched();
    if (frm.valid) {
      this.formButtonLoading = true;
      // const body = {
      //   User_code: this.data?.code || '',
      //   Old_password: this.encryptionService.getPassword(this.data?.code || '', frm.value.oldPassword),
      //   New_password: this.encryptionService.getPassword(this.data?.code || '', frm.value.newPassword),
      // };
      // this.authService.changePassword(body).subscribe({
      //   next: () => {
      this.messageService.successBubble('更新成功');
      this.authService.logout();
      this.formButtonLoading = false;
      //   },
      //   error: (error) => {
      //     this.messageService.errorBubble(error?.message, '錯誤');
      //     this.formButtonLoading = false;
      //   }
      // })
    }
  }
  get containerClass() {
    return {
      'layout-theme-light': this.layoutService.config().colorScheme === 'light',
      'layout-theme-dark': this.layoutService.config().colorScheme === 'dark',
      'dark-theme': this.layoutService.config().colorScheme === 'dark', // 添加 dark-theme class
      'light-theme': this.layoutService.config().colorScheme === 'light', // 添加 light-theme class (可選，因為預設是 light)
      'layout-overlay': this.layoutService.config().menuMode === 'overlay',
      'layout-static': this.layoutService.config().menuMode === 'static',
      'layout-static-inactive': this.layoutService.state.staticMenuDesktopInactive && this.layoutService.config().menuMode === 'static',
      'layout-overlay-active': this.layoutService.state.overlayMenuActive,
      'layout-mobile-active': this.layoutService.state.staticMenuMobileActive,
      'p-input-filled': this.layoutService.config().inputStyle === 'filled',
      'p-ripple-disabled': !this.layoutService.config().ripple
    }
  }
}

