import { DatePipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '@service/system/auth.service';
import { NotificationService } from '@shared/components/notification-message/notification.service';
import { UserInfo } from '@shared/models/system/userInfo';
import { DialogModule } from 'primeng/dialog';
import { ChangePasswordComponent } from '@shared/biz-components/change-password/change-password.component';
import { LayoutComponent } from '../core/layout/layout.component';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  providers: [DatePipe],
  standalone: true,
  imports: [
    LayoutComponent,
    RouterOutlet,
    NgIf,
    DialogModule,
    ChangePasswordComponent,
  ],
})
export class PagesComponent implements OnInit {
  user: UserInfo | null = null;
  visible = false;
  noClose = false;

  constructor(
    private messageService: NotificationService,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    const userInfo = this.authService.currentUserValue;

    if (userInfo && userInfo.USER_PwdExpireDate) {
      this.user = userInfo;

      const passwordExpireDate = new Date(userInfo.USER_PwdExpireDate);
      if (passwordExpireDate <= new Date()) {
        this.messageService.warnBubble(
          '為維護帳號安全，您的密碼已超過 90 天未變更，為保障帳戶安全，請立即設定新密碼後再登入系統。',
          '建議您定期更換密碼',
        );
        this.visible = true;
        this.noClose = true;
      }
    }
  }
}
