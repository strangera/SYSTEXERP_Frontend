import { Component, Input, OnInit } from '@angular/core';
import { MenuItem, PrimeTemplate } from 'primeng/api';
import { AuthService } from '../../../service/system/auth.service';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { NotificationService } from '../notification-message/notification.service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

interface Favorite {
  USER_No: string,
  PROG_No: string,
  FVT_SeqNo: number,
}
@UntilDestroy()
@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss',
  standalone: true,
  imports: [
    BreadcrumbModule,
    PrimeTemplate,
    RouterLink,
    NgIf,
  ],
})
export class MenubarComponent implements OnInit {
  @Input() ProgNo = '';
  @Input() customBreadcrumbItems: MenuItem[] = [];
  home = { icon: 'pi pi-home', routerLink: '/account/dashboard' };
  breadcrumbItems: MenuItem[] = [];
  menu: string[] = [];
  isFavorite = false;
  // 使用者選單
  funRightsInfo: FunsrightInfo[] = []; // 功能權限資訊

  constructor(
    private authService: AuthService,
    private messageService: NotificationService,
  ) { }

  ngOnInit(): void {
    if (this.customBreadcrumbItems.length > 0) { return; }
    this.breadcrumbItems = [];
    this.authService.menuUpdated.pipe(untilDestroyed(this)).subscribe((newData: FunsrightInfo[]) => {
      this.funRightsInfo = [...newData];
      this.menu = [];
      this.breadcrumbItems = [];
      this.getMenuName(this.funRightsInfo, this.ProgNo);
      for (let i = this.menu.length - 1; i >= 0; i--) {
        if (this.menu[i]) {
          this.breadcrumbItems.push({
            label: this.menu[i],
            command: i === 0 ? () => this.toggleFavorite() : undefined, // 只有第一個項目有 command
            isLast: i === 0 // 標記是否為最後一個 (因為我們是反向 push)
          });
          this.breadcrumbItems = [...this.breadcrumbItems];
          this.isFavorite = this.checkIfFavorite(this.ProgNo); // 檢查是否已經加入我的最愛
        }
      }
    });
  }

  getMenuName(funs: FunsrightInfo[], progNo: string): void {
    const prog = funs.find(x => x.prog_No === progNo);
    if (!prog) { this.menu = ['未知頁面']; return; }
    this.menu.push(prog.prog_name);
    if (prog.prog_up) this.getMenuName(funs, prog.prog_up);
  }

  checkIfFavorite(progNo: string): boolean {
    const favorites: Favorite[] = JSON.parse(sessionStorage.getItem('Favorites') || '[]');
    if (!favorites || favorites.length === 0) {
      this.authService.getFavorites(this.authService.currentUserValue?.user_No).subscribe((response) => {
        sessionStorage.setItem('Favorites', JSON.stringify(response.Data))
        return response.Data.some((favorite: Favorite) => favorite.PROG_No === progNo);
      });
    };
    return favorites.some(favorite => favorite.PROG_No === progNo);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    const favorites: Favorite[] = JSON.parse(sessionStorage.getItem('Favorites') || '[]');
    if (this.isFavorite && !favorites.some(fav => fav.PROG_No === this.ProgNo)) {
      const currentFavorite: Favorite = { PROG_No: this.ProgNo, USER_No: this.authService.currentUserValue?.user_No || '', FVT_SeqNo: favorites.length + 1 };
      favorites.push(currentFavorite);
    } else {
      const index = favorites.findIndex(fav => fav.PROG_No === this.ProgNo);
      if (index > -1) favorites.splice(index, 1)
      for (let i = index; i < favorites.length; i++) {
        favorites[i].FVT_SeqNo = i + 1;
      }
    }
    this.authService.UpdateUserFavorite(favorites).subscribe({
      next: (response) => {
        this.messageService.successBubble('我的最愛已更新', response.Message);
        sessionStorage.setItem('Favorites', JSON.stringify(favorites));
      }, error: error => { console.error('Error fetching favorites:', error); }
    });
  }
}
