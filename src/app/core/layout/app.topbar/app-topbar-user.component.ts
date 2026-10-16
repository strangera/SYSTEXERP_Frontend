import { NgIf, NgStyle } from '@angular/common';
// 🎯 新增引入 OnInit, OnDestroy
import { Component, inject, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@service/system/auth.service';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from 'src/environments/environment';
import { DebugToggleService } from '../../services/debug-toggle.service';

// 為了與父組件傳入的 user() 類型匹配，我們定義一個 UserInfo 接口（或使用 FunsrightInfo 內的用戶部分）
interface UserInfo {
  user_No: string;
  user_Name: string;
}

@Component({
  selector: 'app-topbar-user',
  template: `
    <div class="text-center ml-1 block" [ngStyle]="{'color': 'rgb(146, 60, 60)'}">
        <button type="button" class="layout-topbar-button p-link min-w-max" pTooltip="個人資料"
          (click)="menu.toggle($event)">
            <i *ngIf="debugService.isDebugEnabled()"
              class="pi pi-bug mr-1"
              pTooltip="SQL 偵錯模式已開啟"
              style="color: red;">
            </i>
            <span class="text-sm block" style="color: var(--text-color-secondary);">{{ user?.user_No }}</span>
            <span class="text-lg font-bold block" style="color: var(--text-color);">{{ user?.user_Name }}</span>
            <i class="pi pi-angle-down" style="color: var(--text-color);"></i>
        </button>

        <p-menu #menu [model]="userMenuItems" [popup]="true" class="static" styleClass="border-round-xl p-2"
           [style]="{'width': '14rem'}" appendTo="body">

          <ng-template pTemplate="start">
            <!-- 先暫時用admin判斷，UAT/平測區不應該跟正式區用相同的environment...我的天 (= =|||) -->
            <div class="p-menuitem p-0" *ngIf="showDebugToggleInMenu && user?.user_No === 'admin'">
              <div class="flex justify-content-between align-items-center p-menuitem-link hover:surface-100 p-2 cursor-pointer">
                <i class="pi pi-bolt"></i>
                <span class="ml-2 w-full">SQL 偵錯模式</span>
                <p-button
                  (onClick)="toggleDebugMode()"
                  [label]="debugService.isDebugEnabled() ? '關閉' : '開啟'"
                  [severity]="debugService.isDebugEnabled() ? 'danger' : 'success'"
                  [style]="{'font-size': '0.75rem', 'padding': '0.2rem 0.5rem'}">
                </p-button>
              </div>
            </div>
            <li class="p-menu-separator" *ngIf="showDebugToggleInMenu && user?.user_No === 'admin'"></li>
          </ng-template>

          <ng-template pTemplate="submenuheader" let-item>
              <span class="font-bold text-lg text-primary">{{ item.label }}</span>
          </ng-template>

          <ng-template pTemplate="item" let-item>
              <a pRipple class="flex justify-content-between align-items-center p-menuitem-link" tabindex="0"
                (click)="item.command()" (keydown.enter)="item.command()" (keydown.space)="item.command()">
                  <span [class]="item.icon"></span>
                  <div class="w-full">
                      <span class="ml-2">{{ item.label }}</span>
                  </div>
              </a>
          </ng-template>
        </p-menu>
    </div>
    `,
  standalone: true,
  imports: [
    MenuModule, TooltipModule, NgStyle, ButtonModule, OverlayPanelModule, NgIf
  ],
})
export class AppTopbarUserComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  public readonly debugService = inject(DebugToggleService);

  public readonly showDebugToggleInMenu = this.debugService.showDebugToggleInMenu;
  @ViewChild('menu') menu!: OverlayPanel;
  @ViewChild('op') op!: OverlayPanel;

  @Input() user: UserInfo | null = null;

  // 使用者選單
  public readonly userMenuItems: MenuItem[] = [
    {
      label: '個人資料',
      items: [
        // 精誠版沒有 SSO 選單，回主畫面直接回 ERP 首頁
        { label: '回主畫面', icon: 'pi pi-home', command: () => this.router.navigate([environment.skipSsoDashboard ? '/account/dashboard' : '/sso/dashboard']) },
        { label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => this.router.navigate(['/account/changepsw']) },
        { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
      ]
    },
  ];

  /**
   * 切換除錯模式開關
   */
  public toggleDebugMode(): void {
    const newState = !this.debugService.isDebugEnabled();
    this.debugService.toggleDebug(newState);
    console.log(`SQL 偵錯模式已切換為: ${newState ? '開啟' : '關閉'}`);
  }
}
