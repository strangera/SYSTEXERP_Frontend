import { AsyncPipe, LocationStrategy, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core'; // 新增 OnDestroy
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateModule } from '@ngx-translate/core';
import { SystemDataService } from '@service/system/system-data.service';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { concatMap, finalize, Subscription } from 'rxjs'; // 引入 tap
import { environment } from 'src/environments/environment';
import { LayoutService } from '../../../core/layout/layout.service';
import { AuthService } from '../../../service/system/auth.service';
import { ChangePasswordComponent } from '../../../shared/biz-components/change-password/change-password.component';
import { NotificationService } from '../../../shared/components/notification-message/notification.service';
import { UserInfo } from '../../../shared/models/system/userInfo';
import { ApiItem, ERP_SYSTEM_ID, SsoDashboardService } from './sso-dashboard.service';
@UntilDestroy()
@Component({
  selector: 'app-sso-dashboard',
  templateUrl: './sso-dashboard.component.html',
  styleUrls: ['./sso-dashboard.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    TooltipModule,
    MenuModule,
    PrimeTemplate,
    ProgressSpinnerModule,
    NgFor,
    CardModule,
    Button,
    DialogModule,
    AsyncPipe,
    TranslateModule,
    ChangePasswordComponent,
  ],
})
export class SsoDashboardComponent implements OnInit, OnDestroy {
  private readonly ssoDashboardService = inject(SsoDashboardService);
  private readonly messageService = inject(NotificationService);
  private readonly locationStrategy = inject(LocationStrategy);
  private readonly systemDataService = inject(SystemDataService);
  public layoutService = inject(LayoutService);
  public authService = inject(AuthService);
  public router = inject(Router);
  private readonly subscriptions: Subscription[] = [];
  public user: UserInfo | null = null;
  public imagesUrl = environment.ApiUrl + '/images/sso/';
  public logo = this.imagesUrl + 'logo-main.svg';
  public currentPage = 0;
  public pagedItems: ApiItem[][] = [];
  public items: MenuItem[] = [
    {
      label: '個人資料',
      items: [
        {
          label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => {
            this.visible = true;
          }
        },
        { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() },
      ],
    },
  ];
  constructor() {
    this.subscriptions.push(
      this.authService.user.pipe(untilDestroyed(this)).subscribe((x) => {
        this.user = x;
      }),
    );
  }
  ngOnInit() {
    if (!this.authService.isLoggedIn()) return;         // 1. 如果沒有 UserInfo 不往下執行
    this.fetchUrlList();                                // 2. 讀取SSO清單
    const userInfo = this.authService.currentUserValue; // 3. 直接從 AuthService 獲取最新狀態
    if (                                                // 4. tblUser.USER_PwdExpireDate 過期判斷
      userInfo?.USER_PwdExpireDate &&
      (new Date(userInfo.USER_PwdExpireDate) <= new Date())
    ) {
      this.messageService.warnBubble('為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。', '建議您定期更換密碼');
      this.visible = true;
      this.noClose = true; // 禁用關閉，強制用戶修改密碼
    }
  }
  fetchUrlList(): void {
    if (!this.authService.currentUserValue) return;
    this.loading = true; // 在開始請求前設置為 true
    this.subscriptions.push( // 將訂閱添加到 subscriptions 陣列
      this.ssoDashboardService.getTransformedUrlList().pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe((allItems) => {
        this.pagedItems = [];
        // 每 4 個一組進行分頁處理
        for (let i = 0; i < allItems.length; i += 4) {
          this.pagedItems.push(allItems.slice(i, i + 4));
        }
      })
    );
  }
  // 導覽功能
  nextPage() { if (this.hasMorePages()) this.currentPage++; }
  prevPage() { if (this.currentPage > 0) this.currentPage--; }
  hasMorePages() { return this.currentPage < this.pagedItems.length - 1; }
  getFillerArray(page: ApiItem[]) { return new Array(4 - page.length); }

  // 手機滑動換頁
  private readonly swipeThreshold = 50;
  private touchStartX = 0;
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }
  onTouchEnd(event: TouchEvent): void {
    const deltaX = event.changedTouches[0].screenX - this.touchStartX;
    if (deltaX <= -this.swipeThreshold) this.nextPage();
    else if (deltaX >= this.swipeThreshold) this.prevPage();
  }
  navigateToUrl(item: ApiItem): void {
    this.loading = true;
    if (item.System_Id === ERP_SYSTEM_ID) {
      // 內部系統
      this.systemDataService.resetData();
      this.subscriptions.push(
        this.ssoDashboardService.inner().pipe(concatMap(() => {
          return this.systemDataService.getFunRightsInfo().pipe(concatMap(() => this.systemDataService.queryAllSystemCode()));
        }), finalize(() => this.loading = false)).subscribe(() => { this.router.navigate(['account', 'dashboard']); })
      );
    } else {
      // 外部系統導向
      this.subscriptions.push(this.ssoDashboardService.getOuterToken().pipe(untilDestroyed(this), finalize(() => this.loading = false)).subscribe(res => {
        let targetUrl = item.System_Url;
        if (!targetUrl.startsWith('http')) {
          const base = this.locationStrategy.getBaseHref(); // 取得 base href
          const absoluteBase = globalThis.location.origin + base;
          targetUrl = new URL(item.System_Url, absoluteBase).href;
        }
        const finalUrl = this.appendOrReplaceParam(targetUrl, 'token', res.token);
        globalThis.open(finalUrl, '_blank');
      })
      );
    }
  }
  private appendOrReplaceParam(url: string, key: string, value: string): string {
    try {
      const u = new URL(url);
      u.searchParams.set(key, value);
      return u.toString();
    } catch {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }
  }
  // ======================= 修改密碼 =======================
  public visible = false;
  public noClose = false;
  public loading = true;

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
}
