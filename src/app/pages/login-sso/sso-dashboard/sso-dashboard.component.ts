import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../../layout/layout.service';
import { AuthService } from '../../../service/system/auth.service';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiItem, SsoDashboardService } from './sso-dashboard.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { Sys1000Service } from '../../../service/system/sys1000.service';

@Component({
  selector: 'app-sso-dashboard',
  templateUrl: './sso-dashboard.component.html',
  styleUrl: './sso-dashboard.component.scss',
})
export class SsoDashboardComponent implements OnInit {
  logo = 'assets/layout/images/logo.png';
  user: UserInfo | null = null;
  private subscriptions: Subscription[] = [];
  data: UserInfo | null = null; // 使用者資料
  items: MenuItem[] = [
    {
      label: '個人資料',
      items: [
        { label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => { this.visible = true; this.form.reset(); } },
        { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() },
      ],
    },
  ];

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
  }); // }, { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') });
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>-_+=`~[]\\;\']).{4,8}$';
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
    private userCodeService: UserCodeService,
  ) {
    this.subscriptions.push(
      this.authService.user.subscribe((x) => (this.user = x)),
    );
  }
  ngOnInit() {
    try {
      const userInfo = sessionStorage.getItem('UserInfo');
      this.data = userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      console.error('Failed to parse UserInfo:', error);
    }
    this.fetchUrlList();

    this.form.get('newPassword')?.valueChanges.subscribe(() => { this.form.get('confirmPassword')?.updateValueAndValidity() });
    this.form.get('confirmPassword')?.valueChanges.subscribe(() => { this.form.get('confirmPassword')?.updateValueAndValidity() });

    const time = JSON.parse(sessionStorage.getItem('UserInfo') || '{}').USER_PwdExpireDate;
    if (time <= new Date().toISOString()) {
      this.messageService.warnBubble(
        '為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。',
        '建議您定期更換密碼',
      );
      this.visible = true;
    }
  }
  fetchUrlList(): void {
    this.loading = true;
    this.urlItems = [
      {
        System_Id: 'ERP',
        System_Name: '商場營運管理系統',
        System_Url: '/dashboard',
        System_ImgFile: 'EIP_Image',
      },
    ];
    this.ssoDashboardService.fetchUrlList().subscribe({
      next: (data) => {
        const sortedAndFilteredData = data.Data
          .sort((a: any, b: any) => {
            const seqNoA = Number(a.Seq_No);
            const seqNoB = Number(b.Seq_No);
            if (seqNoA === undefined || seqNoA === null) return 1;
            if (seqNoB === undefined || seqNoB === null) return -1;
            return seqNoA - seqNoB;
          })
          .filter((item: any) => item.IsEnable === 'Y');
        this.urlItems = [...this.urlItems, ...sortedAndFilteredData];
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = '無法載入 URL 清單。請稍後再試。';
        this.loading = false;
        console.error('API 錯誤:', error);
      },
    });
  }

  navigateToUrl(item: ApiItem): void {
    if (this.urlItems.length > 0 && item === this.urlItems[0]) {
      this.loading = true; // 開始載入，顯示 loading 效果 (如果需要)
      this.authService.getFunRightsInfo().subscribe({
        next: (sys1000Response) => {
          sessionStorage.setItem('SYSTEMSetting', JSON.stringify(sys1000Response));
          this.loading = false; // 停止載入
          this.router.navigate([item.System_Url]);
        },
        error: (error) => {
          console.error('API 請求失敗:', error);
          this.loading = false; // 停止載入
          this.errorMessage = '載入資料失敗，無法導航。'; // 顯示錯誤訊息 (如果需要)
        },
      });
    } else {
      window.open(item.System_Url, '_blank');
    }
  }

  onSubmit(frm: FormGroup): void {
    frm.markAllAsTouched();
    if (frm.valid) {
      this.formButtonLoading = true;
      const query = {
        User_No: this.data?.user_No || '',
        Old_password: this.encryptionService.getPassword(this.data?.user_No || '', frm.value.oldPassword),
        New_password: this.encryptionService.getPassword(this.data?.user_No || '', frm.value.newPassword),
        PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 密碼到期日設為90天後
      };
      this.userCodeService.changePassword(query).subscribe({
        next: () => {
          this.messageService.successBubble('密碼修改成功');
          this.authService.logout();
          this.formButtonLoading = false;
        },
        error: (error) => {
          console.error('密碼修改失敗:', error);
          this.messageService.errorBubble('密碼修改失敗，請稍後再試。');
        },
      });
    }
  }
}
