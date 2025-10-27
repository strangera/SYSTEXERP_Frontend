import { Component, ViewChild, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { NgStyle } from '@angular/common';
import { AuthService } from '@service/system/auth.service';
import { OverlayPanel } from 'primeng/overlaypanel';

// 為了與父組件傳入的 user() 類型匹配，我們定義一個 UserInfo 接口（或使用 FunsrightInfo 內的用戶部分）
// 這裡假設傳入的 user 物件具備 user_No 和 user_Name
interface UserInfo {
  user_No: string;
  user_Name: string;
}

@Component({
  selector: 'app-topbar-user',
  template: `
    <div class="text-center ml-1 block" [ngStyle]="{'color': 'rgb(146, 60, 60)'}">
      <!-- 點擊按鈕開啟選單 -->
      <button type="button" class="layout-topbar-button p-link min-w-max" pTooltip="個人資料"
        (click)="menu.toggle($event)">
        <!-- 接收 Input 的 user 物件 -->
        <span class="text-sm block" style="color: var(--text-color-secondary);">{{ user?.user_No }}</span>
        <span class="text-lg font-bold block" style="color: var(--text-color);">{{ user?.user_Name }}</span>
        <i class="pi pi-angle-down" style="color: var(--text-color);"></i>
      </button>
      
      <!-- PrimeNG Menu -->
      <p-menu #menu [model]="userMenuItems" [popup]="true" class="static" styleClass="border-round-xl p-2"
        [style]="{'width': '12rem'}" appendTo="body">
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
    MenuModule, TooltipModule, NgStyle
  ]
})
export class AppTopbarUserComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService); // 注入 AuthService 執行登出

  @ViewChild('menu') menu!: OverlayPanel; // 引用 PrimeNG Menu (使用 OverlayPanel 更準確，但 PrimeNG Menu 也常用 #menu)

  // 接收父組件傳入的使用者資訊 (Signal 的值)
  @Input() user: UserInfo | null = null;

  // 使用者選單
  public readonly userMenuItems: MenuItem[] = [
    {
      label: '個人資料',
      items: [
        { label: '回主畫面', icon: 'pi pi-home', command: () => this.router.navigate(['/sso/dashboard']) },
        { label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => this.router.navigate(['/account/changepsw']) },
        { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
      ]
    },
  ];
}
