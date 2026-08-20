import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
  ViewEncapsulation,
  computed,
  signal,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
// import { MenuItem } from 'primeng/api'; // ⚠️ 不再需要 MenuItem
import { LayoutService } from '../layout.service';
import { MenuModule } from 'primeng/menu';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FunsrightInfo } from '@shared/models/system/funsrightInfo';
import { AuthService } from '@service/system/auth.service';
import { SystemDataService } from '@service/system/system-data.service';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { NgClass, NgFor } from '@angular/common';

// 導入新的小元件
import { AppTopbarTimeComponent } from './app-topbar-time.component';
import { AppTopbarSearchComponent } from './app-topbar-search.component';
import { AppTopbarFavoritesComponent } from './app-topbar-favorites.component';
import { AppTopbarUserComponent } from './app-topbar-user.component';
import { AppTopbarVersionComponent } from './app-topbar-version.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrl: './app.topbar.component.scss',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    RouterLink, Button, MenuModule, TranslateModule, TooltipModule, NgClass, NgFor,
    // 引入新的小元件
    AppTopbarTimeComponent, AppTopbarSearchComponent, AppTopbarFavoritesComponent, AppTopbarUserComponent, AppTopbarVersionComponent
  ],
})
export class AppTopbarComponent {
  readonly brand = environment.brand;
  // 使用 inject 獲取依賴
  private readonly router = inject(Router);
  public layoutService = inject(LayoutService);
  public authService = inject(AuthService);
  private readonly systemDataService = inject(SystemDataService);

  // 獲取原始功能權限數據
  private readonly rawFunRights = toSignal(this.systemDataService.menuUpdated, { initialValue: [] as FunsrightInfo[] });

  // 僅保留與佈局控制相關的 ViewChild
  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') topbarMenu!: ElementRef;
  // 讓 LayoutComponent 能讀取 topbar 實際渲染高度（換行、非同步選單載入後量測用）
  @ViewChild('appTopbarDiv') appTopbarDiv!: ElementRef<HTMLElement>;

  // **狀態 (Signals & toSignal)**
  public readonly user = toSignal(this.authService.user, { initialValue: null });
  public activeTopMenuItem = signal<FunsrightInfo | null>(null); // 頂部菜單激活狀態

  @Output() topMenuClick = new EventEmitter<string | null>();

  // 派生狀態 (Computed) - 包含 'label' 屬性的完整功能清單
  // 此列表將提供給 AppTopbarSearchComponent 進行篩選。
  public readonly allFunRightsWithLabel = computed(() => {
    return this.rawFunRights().map((item: FunsrightInfo) => ({
      ...item,
      // 確保 label 被計算出來，格式為 'ID 名稱'
      label: `${item.prog_id} ${item.prog_name}`
    }));
  });

  // 派生狀態 (Computed) - 頂層菜單 (使用包含 label 的列表)
  public readonly topLevelMenuItems = computed(() => {
    const data = this.allFunRightsWithLabel(); // 使用已轉換的列表
    if (data.length === 0) return [];

    return data
      .filter(item => item.prog_up === '' && item.module_no !== '')
      .sort((a, b) => parseInt(a.prog_sort, 10) - parseInt(b.prog_sort, 10))
      .map(item => ({
        ...item,
        icon: this.getMenuIcon(item.prog_No) // 這裡已經有 label 了，不再重複添加
      }));
  });

  // **頂部菜單邏輯**
  onTopMenuItemClick(item: FunsrightInfo) {
    if (this.activeTopMenuItem()?.prog_No === item.prog_No) { // 比較 prog_No
      this.activeTopMenuItem.set(null);
      this.topMenuClick.emit(null);
    } else {
      this.activeTopMenuItem.set(item);
      this.topMenuClick.emit(item.prog_No);
    }
  }

  // 子組件通知導航成功，清除激活狀態
  onSearchNavigateSuccess() {
    this.activeTopMenuItem.set(null);
    this.topMenuClick.emit(null);
  }

  // 輔助函式 (Helper Function)
  private getMenuIcon(progNo: string): string {
    switch (progNo) {
      case 'FIN00000': return 'pi pi-users';
      case 'ASS00000': return 'pi pi-briefcase';
      case 'TLS00000': return 'pi pi-shopping-bag';
      case 'SYS0000': return 'pi pi-user';
      case 'CPM0000': return 'pi pi-chart-pie';
      default: return 'pi pi-circle';
    }
  }
}
