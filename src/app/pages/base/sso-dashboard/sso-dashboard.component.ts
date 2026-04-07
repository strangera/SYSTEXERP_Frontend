// src/app/pages/base/sso-dashboard/sso-dashboard.component.ts
import { AsyncPipe, LocationStrategy, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core'; // 新增 OnDestroy
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { SystemDataService } from '@service/system/system-data.service';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, Subscription } from 'rxjs'; // 引入 tap
import { LayoutService } from '../../../core/layout/layout.service';
import type { OuterTokenResponse } from '../../../service/system/auth.service';
import { AuthService } from '../../../service/system/auth.service';
import { UserCodeService } from '../../../service/system/user-code.service';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { EncryptionService } from '../../../shared/service/encryption.service';
import { ValidationService } from '../../../shared/service/validation.service';
import { ApiItem, SsoDashboardService } from './sso-dashboard.service';
const SYSTEM_CONFIG: Record<string, { color: string, order: number }> = {
  'ERP': { color: '#e98ab1', order: 1 }, // 商場營運 (左上)
  'CRM': { color: '#f3bc18', order: 2 }, // 行銷管理 (右上)
  'HR': { color: '#c6d914', order: 3 }, // 人資系統 (左下)
  'EIP': { color: '#4fbcec', order: 4 }, // EIP (右下)
  'ERP2': { color: '#e98ab1', order: 5 }, // 商場營運 (左上)
};
@UntilDestroy()
@Component({
  selector: 'app-sso-dashboard',
  templateUrl: './sso-dashboard.component.html',
  styleUrls: ['./sso-dashboard.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    TooltipModule,
    MenuModule,
    PrimeTemplate,
    ProgressSpinnerModule,
    NgFor,
    CardModule,
    Button,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    PasswordModule,
    DividerModule,
    AsyncPipe,
    TranslateModule,
  ],
})
export class SsoDashboardComponent implements OnInit, OnDestroy { // 實現 OnDestroy
  currentPage = 0;
  pagedItems: ApiItem[][] = [];
  logo = 'assets/layout/images/logo-main.svg';
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
  loading = true; // 預設為 true，因為 ngOnInit 會調用 fetchUrlList
  errorMessage = '';
  visible = false;
  form = this.formBuilder.group({
    code: [{ value: '', disabled: true }],
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8), this.validationService.passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.validationService.passwordsMatchValidator('newPassword', 'confirmPassword') });
  strongRegex = '^(?=.*[a-z])(?=.*[0-9]).{4,8}$';
  formButtonLoading = false;
  noClose = false;

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    private systemDataService: SystemDataService,
    public router: Router,
    private ssoDashboardService: SsoDashboardService,
    private formBuilder: FormBuilder,
    private encryptionService: EncryptionService,
    private messageService: NotificationService,
    private userCodeService: UserCodeService,
    private validationService: ValidationService,
    private locationStrategy: LocationStrategy
  ) {
    this.subscriptions.push(
      this.authService.user.pipe(untilDestroyed(this)).subscribe((x) => {
        this.user = x;
        // 在這裡設置 code 字段的值，因為 user 可能會延遲加載
        if (this.user) {
          this.form.patchValue({ code: this.user.user_No });
        }
      }),
    );
  }

  ngOnInit() {
    this.fetchUrlList();
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

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  fetchUrlList(): void {
    this.loading = true; // 在開始請求前設置為 true
    this.subscriptions.push( // 將訂閱添加到 subscriptions 陣列
      this.ssoDashboardService.fetchUrlList().pipe(
        untilDestroyed(this),
        finalize(() => this.loading = false) // 無論成功失敗，在所有請求完成後將 loading 設為 false
      ).subscribe({
        next: (data) => {
          const processedData = data.Data.map((item: any) => {
            // 根據 System_Id 取得配置，若找不到則給預設灰色
            const config = SYSTEM_CONFIG[item.System_Id] || { color: '#95a5a6', order: 99 };
            return {
              ...item,
              dynamicColor: config.color,
              customOrder: config.order
            };
          });
          const allItems = [
            // 加入原本寫死的 ERP (如果是從 API 回來就不用這段)
            {
              System_Id: 'ERP',
              System_Name: '商場營運管理系統',
              System_Url: 'account/dashboard',
              System_ImgFile: 'TSRDERP',
              IsEnable: 'Y',
              Seq_No: 1,
              dynamicColor: SYSTEM_CONFIG['ERP'].color,
              customOrder: SYSTEM_CONFIG['ERP'].order,
            },
            {
              System_Id: 'ERP2',
              System_Name: '測試如果未來有第五個系統顯示在此處',
              System_Url: 'account/dashboard',
              System_ImgFile: 'TSRDERP',
              IsEnable: 'Y',
              Seq_No: 1,
              dynamicColor: SYSTEM_CONFIG['ERP2'].color,
              customOrder: SYSTEM_CONFIG['ERP2'].order,
            },
            ...processedData
          ].sort((a, b) => a.customOrder - b.customOrder).filter((item: any) => item.IsEnable === 'Y'); // 強制按我們定義的順序排
          // this.loading = false; // 這裡不需要設置 false，由 finalize 處理
          this.pagedItems = [];
          for (let i = 0; i < allItems.length; i += 4) {
            this.pagedItems.push(allItems.slice(i, i + 4));
          }
        },
        error: (error) => {
          this.errorMessage = '無法載入 URL 清單。請稍後再試。';
          // this.loading = false; // 這裡不需要設置 false，由 finalize 處理
          console.error('API 錯誤:', error);
        },
      })
    );
  }
  // 導覽功能
  nextPage() { if (this.hasMorePages()) this.currentPage++; }
  prevPage() { if (this.currentPage > 0) this.currentPage--; }
  hasMorePages() { return this.currentPage < this.pagedItems.length - 1; }

  // 填充空白 block 讓佈局不崩壞
  getFillerArray(page: any[]) {
    return new Array(4 - page.length);
  }
  private appendOrReplaceParam(url: string, key: string, value: string): string {
    try {
      // 這裡不給 base，因為 url 此時已經是完整路徑了
      const u = new URL(url);
      u.searchParams.set(key, value);
      return u.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }
  navigateToUrl(item: ApiItem): void {
    this.loading = true;

    // 判斷是否為內部系統 (ERP / ERP2)
    if (item.System_Id === 'ERP' || item.System_Id === 'ERP2') {
      this.subscriptions.push(
        this.ssoDashboardService.Inner().pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        ).subscribe({
          next: () => {
            // 安全做法：直接傳入路由陣列，Angular 會自動補齊 /tsrdwebdev/
            this.router.navigate(['account', 'dashboard']);
          },
          error: () => {
            this.messageService.errorBubble('進入系統失敗');
          }
        })
      );
    } else {
      // 外部系統導向
      this.subscriptions.push(
        this.authService.getOuterToken().pipe(
          untilDestroyed(this),
          finalize(() => this.loading = false)
        ).subscribe({
          next: (res: OuterTokenResponse) => {
            // 安全做法：處理 window.open 的路徑
            let targetUrl = item.System_Url;

            // 如果路徑不是 http 開頭，代表它是相對路徑，需要手動補上 Base Href
            if (!targetUrl.startsWith('http')) {
              const base = this.locationStrategy.getBaseHref(); // 取得 /tsrdwebdev/
              // 使用 URL 物件自動處理斜線，基準點用當前 window.location.origin
              const absoluteBase = window.location.origin + base;
              targetUrl = new URL(item.System_Url, absoluteBase).href;
            }

            const finalUrl = this.appendOrReplaceParam(targetUrl, 'token', res.token);
            window.open(finalUrl, '_blank');
          },
          error: () => this.messageService.errorBubble('無法前往外部系統')
        })
      );
    }
  }
  /** 從 localStorage 的 preLoginUrlOnce 取出 redirecturl/redirectURL/redirect，並解碼回原網址 */
  private getRedirectFromPreLogin(): string {
    const raw = localStorage.getItem('preLoginUrlOnce');
    if (!raw) return '';

    // 只取 ? 後的查詢字串；不使用 URLSearchParams.get()，避免自動 decode 取不到「原始值」的需求
    const q = raw.indexOf('?');
    if (q === -1) return '';

    const qs = raw.slice(q + 1);
    for (const kv of qs.split('&')) {
      if (!kv) continue;
      const [k, v = ''] = kv.split('=');
      if (!k) continue;
      const key = k.toLowerCase();
      if (key === 'redirecturl' || key === 'redirect') {
        try { return decodeURIComponent(v); } catch { return v; }
      }
    }
    return '';
  }

  onSubmit(frm: FormGroup): void {
    frm.markAllAsTouched();
    if (!frm.valid) return;

    this.formButtonLoading = true;
    const query = {
      User_No: this.user?.user_No || '',
      Old_password: this.encryptionService.getPassword(this.user?.user_No || '', frm.value.oldPassword),
      New_password: this.encryptionService.getPassword(this.user?.user_No || '', frm.value.newPassword),
      PwdExpireDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    };
    this.subscriptions.push(
      this.userCodeService.changePassword(query).pipe(
        untilDestroyed(this),
        finalize(() => this.formButtonLoading = false)
      ).subscribe({
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
      })
    );
  }
}
