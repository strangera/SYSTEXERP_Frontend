import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { UserInfo } from '../../models/system/userInfo';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../service/system/auth.service';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { NotificationService } from '../notification-message/notification.service';

interface Favorite {
  USER_No: string,
  PROG_No: string,
  FVT_SeqNo: number,
}
@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MenubarComponent implements OnInit, OnDestroy {
  @Input() ProgNo = '';
  home?: { icon: string, routerLink: string };
  breadcrumbItems: MenuItem[] = [];
  menu: string[] = [];

  isFavorite = false;
  // 使用者選單
  private userSubscription: Subscription | undefined; // 使用者訂閱
  data: UserInfo | null = null;              // 使用者資料
  private menuUpdatedSubscription: Subscription | undefined;
  funRightsInfo: FunsrightInfo[] = []; // 功能權限資訊

  constructor(
    private authService: AuthService,
    private messageService: NotificationService,
  ) { }

  ngOnInit(): void {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.breadcrumbItems = [];
    this.userSubscription = this.authService.user.subscribe((userInfo: UserInfo | null) => {
      this.data = userInfo;
    });
    this.menuUpdatedSubscription = this.authService.menuUpdated.subscribe((newData: FunsrightInfo[]) => {
      this.funRightsInfo = [
        { id: "", prog_No: "dashboard", prog_id: "", prog_name: "佈告欄", prog_up: "", module_no: "", sub_module_no: "", prog_ispage: "Y", prog_stopflag: "N", prog_sort: "" },
        { id: "", prog_No: "900001", prog_id: "", prog_name: "範例", prog_up: "", module_no: "", sub_module_no: "", prog_ispage: "Y", prog_stopflag: "N", prog_sort: "" },
        ...newData
      ];
      this.getMenuName(this.funRightsInfo, this.ProgNo);
      this.isFavorite = this.checkIfFavorite(this.ProgNo); // 檢查是否已經加入我的最愛
      for (let i = this.menu.length - 1; i >= 0; i--) {
        if (this.menu[i]) {
          this.breadcrumbItems.push({
            label: this.menu[i],
            command: i === 0 ? () => this.toggleFavorite() : undefined, // 只有第一個項目有 command
            isLast: i === 0 // 標記是否為最後一個 (因為我們是反向 push)
          });
        }
      }
    });
  }

  getMenuName(funs: FunsrightInfo[], progNo: string) {
    const prog = funs.filter(x => x.prog_No == progNo);
    if (prog.length > 0) {
      if (prog[0].prog_up !== '') {
        this.menu.push(prog[0].prog_name);
        this.getMenuName(funs, prog[0].prog_up);
      } else {
        this.menu.push(prog[0].prog_name);
      }
    } else {
      this.messageService.warnBubble(`此頁面尚未設定程式代號或在選單資料中找不到程式代號: ${progNo}`, '警告')
    }
  }

  checkIfFavorite(progNo: string): boolean {
    const favorites: Favorite[] = JSON.parse(sessionStorage.getItem('Favorites') || '[]');
    return favorites.some(favorite => favorite.PROG_No === progNo);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    const favorites: Favorite[] = JSON.parse(sessionStorage.getItem('Favorites') || '[]');
    if (this.isFavorite && !favorites.some(fav => fav.PROG_No === this.ProgNo)) {
      const currentFavorite: Favorite = { PROG_No: this.ProgNo, USER_No: this.data?.user_No || '', FVT_SeqNo: favorites.length + 1 };
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

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
    this.menuUpdatedSubscription?.unsubscribe();
  }
}
