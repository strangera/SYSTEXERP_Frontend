import { Router } from '@angular/router';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../layout.service';
import { AuthService } from '../../service/system/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserInfo } from '../../shared/models/system/userInfo';
import { FunsrightInfo } from '../../shared/models/system/funsrightInfo';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from '../../shared/component/notification-message/notification.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';

interface Favorite {
  USER_No: string,
  PROG_No: string,
  FVT_SeqNo: number,
  CRT_Date: string | null,
  CRT_USR_No: string | null,
  CRT_USR_Name: string | null,
  UPD_Date: string | null,
  UPD_USR_No: string | null,
  UPD_USR_Name: string | null
}

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrl: './app.topbar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppTopbarComponent implements OnInit, OnDestroy {
  @ViewChild('appTopbarDiv', { static: false }) appTopbarDiv!: ElementRef;
  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;
  // 當前時間
  private timerSubscription!: Subscription; // 計時器訂閱
  now: Date = new Date();
  // 代碼查詢
  queryForm = this.formBuilder.nonNullable.group({ query_data: [''] });
  // 我的最愛
  @ViewChild('op') favorite!: OverlayPanel; // 取得我的最愛的 OverlayPanel
  Favorites: MenuItem[] = [];               // 我的最愛清單
  selectedFavorites: MenuItem[] = [];       // 新增：用於存儲選中的最愛項目
  editingFavorites = false;                 // 是否正在編輯最愛
  // 使用者選單
  private userSubscription: Subscription | undefined; // 使用者訂閱
  data: UserInfo | null = null;              // 使用者資料
  items: MenuItem[] = [                     // User選單項目
    {
      label: '個人資料',
      items: [
        { label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => this.router.navigate(['/changepsw/changepsw']) },
        { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
      ]
    },
  ];
  private menuUpdatedSubscription: Subscription | undefined;
  funRightsInfo: FunsrightInfo[] = []; // 功能權限資訊
  topLevelMenuItems: FunsrightInfo[] = []; // 新增：第一層菜單項
  activeTopMenuItem: FunsrightInfo | null = null; // 新增：追蹤當前激活的頂部菜單項
  @Output() topMenuClick = new EventEmitter<string | null>(); // 新增：點擊頂部菜單項時發射事件

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    public router: Router,
    private messageService: NotificationService,
  ) { }
  ngOnInit() {
    // 訂閱 AccessService 的 menuUpdated，當選單資料更新時重新建立選單
    this.menuUpdatedSubscription = this.authService.menuUpdated.subscribe((newData: FunsrightInfo[]) => {
      if (newData?.length > 0) { // TODO: 先隱藏 000000 和 999999 的選單，等資料庫有刪掉就不用加這段了
        this.funRightsInfo = newData.filter(item => item.prog_no !== '000000' && item.prog_no !== '999999');
        this.funRightsInfo = this.funRightsInfo.map((item: FunsrightInfo) => ({
          ...item, label: `${item.prog_no} ${item.prog_name}` // 建立 label 屬性
        }));
        this.topLevelMenuItems = this.funRightsInfo.filter(item => item.parent_id === '0'); // 假設 parent_id 為 null 或 undefined 表示第一層
        this.initFavorites(); // 初始化最愛功能
      }
    });
    this.userSubscription = this.authService.user.subscribe((userInfo: UserInfo | null) => {
      this.data = userInfo;
      this.initFavorites();
    });
    this.timerSubscription = interval(500).subscribe(() => {
      this.now = new Date();
    });
  };
  // 當點擊頂部菜單項時
  onTopMenuItemClick(item: FunsrightInfo) {
    if (this.activeTopMenuItem === item) {
      this.activeTopMenuItem = null; // 點擊已激活的項，將其取消激活
      this.topMenuClick.emit(null); // 發射 null 表示沒有激活的頂部菜單項
    } else {
      this.activeTopMenuItem = item; // 點擊未激活的項，將其激活
      this.topMenuClick.emit(item.prog_no);
    }
  }
  // 搜尋程式編碼
  filteredProgs: { label: string; value: FunsrightInfo }[] = [];
  filterProgNo(event: AutoCompleteCompleteEvent) {
    const filtered: { label: string; value: FunsrightInfo }[] = [];
    const query = event.query;
    for (const f of this.funRightsInfo) {
      if (f.path?.trim() !== "") {
        if (f.label?.toLowerCase().includes(query.toLowerCase())) {
          filtered.push({ label: f.label, value: f });
        }
      }
    }
    this.filteredProgs = filtered;
    console.log(this.filteredProgs);

  }
  // 按下搜尋確認
  onSubmit(frm: FormGroup) {
    const query = frm.controls["query_data"].value;
    let matchedItem: FunsrightInfo | undefined;
    if (typeof query === 'string') {
      // 如果 query 是字串，直接在 funRightsInfo 中尋找 label 包含該字串的項目
      matchedItem = this.funRightsInfo.find(item =>
        item.label?.toLowerCase().includes(query.toLowerCase()) && item.path?.trim() !== ''
      );
    } else if (typeof query === 'object' && query !== null && 'value' in query) {
      // 如果 query 是選中的自動完成選項（包含 value 屬性），直接使用 query.value
      matchedItem = query.value;
    }
    if (matchedItem) {
      this.router.navigate([matchedItem.path]);
      this.queryForm.reset();
    } else {
      this.messageService.warnBubble('輸入的代碼不存在，或您目前無權限存取對應頁面。', '查無此快速碼');
    }
  }
  // 初始化我的最愛
  initFavorites(event?: Event) {
    if (this.favorite && event) {
      this.favorite.toggle(event)
      this.editingFavorites = false; // 取消編輯狀態
      this.selectedFavorites = [];
    }
    if (this.data?.user_No === undefined || !this.funRightsInfo.length) return;
    this.authService.getFavorites(this.data?.user_No).subscribe({
      next: (response) => { // 指明 response 的結構
        const favoritesWithDetails: FunsrightInfo[] = [];
        if (response.Data.length === 0) { this.Favorites = []; return; }
        console.log(response.Data);
        response.Data.forEach((fav: Favorite) => {
          const matchingFunRight = this.funRightsInfo.find(item => item.prog_no === fav.PROG_No);
          if (matchingFunRight) favoritesWithDetails.push(matchingFunRight);
        });
        sessionStorage.setItem('Favorites', JSON.stringify(response.Data));
        this.Favorites = favoritesWithDetails.map(item => ({
          ...item,
          label: item.prog_no + ' ' + item.prog_name,
          path: item.path,
        }));
      }, error: error => { console.error('Error fetching favorites:', error); }
    });
  }
  // 點擊我的最愛事件
  onFavoriteItemClick(item: FunsrightInfo) {
    if (item.path?.trim() === '') {
      this.messageService.warnBubble(`您目前無檢視「${item.label}」的權限，請聯絡系統管理員開啟權限。`, '無法開啟畫面');
      return;
    }
    this.router.navigate([item.path]);
    this.favorite.hide(); // 點擊後關閉最愛選單
  }
  // 進入編輯我的最愛模式
  editFavorites() {
    this.editingFavorites = !this.editingFavorites; // 切換編輯狀態
  }
  // 刪除我的最愛
  deleteSelectedFavorites() {
    if (this.selectedFavorites && this.selectedFavorites.length > 0 && this.Favorites) {
      const remainingFavorites = this.Favorites.filter(favorite =>
        !this.selectedFavorites.some(selected => selected['prog_no'] === favorite['prog_no'])
      );
      const body = remainingFavorites.map((favorite, index) => ({
        USER_No: this.data?.user_No,
        PROG_No: favorite['prog_no'],
        FVT_SeqNo: index + 1,
      }));
      this.authService.UpdateUserFavorite(body).subscribe({
        next: () => {
          this.editingFavorites = false; // 取消編輯狀態
          this.selectedFavorites = []; // 清空已選中的項目
          this.initFavorites(); // 重新初始化最愛功能
        },
        error: error => {
          console.error('Error deleting favorites:', error);
        }
      });
    } else {
      this.editingFavorites = false; // 取消編輯狀態
      this.selectedFavorites = []; // 清空已選中的項目
    }
  }
  // 排序我的最愛
  onRowReorder() {
    const body = this.Favorites.map((favorite, index) => ({
      USER_No: this.data?.user_No,
      PROG_No: favorite['prog_no'],
      FVT_SeqNo: index + 1, // 根據目前的順序生成 FVT_SeqNo
    }))
    this.authService.UpdateUserFavorite(body).subscribe({
      next: () => {
        this.initFavorites();
      }, error: error => { console.error('Error fetching favorites:', error); }
    });
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.menuUpdatedSubscription?.unsubscribe();
  }
}
