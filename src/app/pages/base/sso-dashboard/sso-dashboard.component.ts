import { Component, OnInit } from '@angular/core';
import { LayoutService } from '../../../layout/layout.service';
import { ApiResponse, AuthService } from '../../../service/system/auth.service';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { concatMap, finalize, Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiItem, SsoDashboardService } from './sso-dashboard.service';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { UserCodeService } from '../../../service/basic/user-code.service';
import { ValidationService } from '../../../shared/service/validation.service';

@Component({
  selector: 'app-sso-dashboard',
  templateUrl: './sso-dashboard.component.html',
  styleUrl: './sso-dashboard.component.scss',
})
export class SsoDashboardComponent implements OnInit {
  logo = 'assets/layout/images/logo.png';
  user: UserInfo | null = null;
  private subscriptions: Subscription[] = [];
  items: MenuItem[] = [
    {
      label: '個人資料',
      items: [
        {
          label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => {
            this.visible = true;
            this.form.reset();
            this.form.markAsPristine();
          }
        },
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
    newPassword: ['', [Validators.required, this.validationService.passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') });
  strongRegex = '^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>-_+=`~[]\\;\']).{4,8}$';
  formButtonLoading = false; // 控制按鈕的載入狀態
  noClose = false; // 禁用對話框的關閉

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    public router: Router,
    private ssoDashboardService: SsoDashboardService,
    private formBuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private messageService: NotificationService,
    private userCodeService: UserCodeService,
    private validationService: ValidationService
  ) {
    this.subscriptions.push(
      this.authService.user.subscribe((x) => (this.user = x)),
    );
  }
  ngOnInit() {
    this.fetchUrlList();
    const time = JSON.parse(sessionStorage.getItem('UserInfo') || '{}').USER_PwdExpireDate;
    if (new Date(time) <= new Date()) {
      this.messageService.warnBubble(
        '為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。',
        '建議您定期更換密碼',
      );
      this.visible = true;
      this.noClose = true
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
    this.loading = true;
    if (this.urlItems.length > 0 && item === this.urlItems[0]) {
      // 導向內部系統 (this.urlItems[0])
      this.ssoDashboardService.Inner().pipe(
        // finalize 操作符會在 Observable 完成或出錯時執行，確保 loading 狀態被重置
        finalize(() => this.loading = false)
      ).subscribe({
        next: (innerResponse: ApiResponse<any>) => {
          if (innerResponse.Status === '0000') {
            console.log("Inner API 成功:", innerResponse);

            // 使用 concatMap 串聯兩個權限相關的 API 呼叫
            // concatMap 會等待前一個 Observable 完成後再訂閱下一個
            this.authService.getFunRightsInfo().pipe(
              concatMap(() => this.authService.queryAllSystemCode()) // getFunRightsInfo 成功後，接著呼叫 queryAllSystemCode
            ).subscribe({
              next: () => {
                console.log('所有權限資料載入成功。');
                this.router.navigate([item.System_Url]); // 兩個 API 都成功後才導航
              },
              error: (error) => {
                console.error('載入權限資料失敗:', error);
                this.messageService.errorBubble('載入權限資料失敗，無法導航。');
              },
            });

          } else {
            console.error('Inner API 失敗:', innerResponse.Message);
            this.messageService.errorBubble(innerResponse.Message || '內部系統登入失敗，請稍後再試。');
          }
        },
        error: (error) => {
          console.error('Inner API 請求失敗:', error);
          this.messageService.errorBubble('連線內部系統失敗。');
        },
      });
    } else {
      // 導向外部系統
      this.ssoDashboardService.Outer().subscribe({
        next: (response) => {
          if (response.Status === '0000' && response.Data && response.Data.AccessToken) {
            const accessToken = response.Data.AccessToken;
            console.log("取得的 AccessToken:", accessToken);
            const urlWithToken = `${item.System_Url}?token=${encodeURIComponent(accessToken)}`;
            window.open(urlWithToken, '_blank'); // 在新分頁打開

            this.loading = false;
          } else {
            console.error('Outer API 未成功取得 AccessToken:', response);
            this.loading = false;
            this.messageService.errorBubble('無法登入外部系統，請稍後再試。');
          }
        },
        error: (error) => {
          console.error('Outer API 請求失敗:', error);
          this.loading = false;
          this.messageService.errorBubble('導航至外部系統失敗。');
        },
      });
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
      this.userCodeService.changePassword(query).subscribe({
        next: () => {
          this.messageService.successBubble('密碼修改成功');
          this.authService.logout();
          this.formButtonLoading = false;
        },
        error: () => {
          this.formButtonLoading = false;
        },
      });
    }
  }
}
