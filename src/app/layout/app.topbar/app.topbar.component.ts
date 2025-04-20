import { Router } from '@angular/router';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../../shared/service/layout.service';
import { AuthService } from '../../service/system/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserInfo } from '../../models/system/userInfo';
import { FunsrightInfo } from '../../models/system/funsrightInfo';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from '../../shared/service/notification.service';
import { OverlayPanel } from 'primeng/overlaypanel';
import { TableRowReorderEvent } from 'primeng/table';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrl: './app.topbar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AppTopbarComponent implements OnInit {
  @ViewChild('op') favorite!: OverlayPanel; // 確保正確引入 pMenu
  title: string = 'management-platform-title';
  logo: string = 'assets/layout/images/logo.png';
  items!: MenuItem[];
  Favorites!: MenuItem[];
  selectedFavorites: MenuItem[] = []; // 新增：用於存儲選中的最愛項目
  editingFavorites = false; // 是否編輯最愛
  data: UserInfo | null = null; // 使用者資料
  image = '';// 預設圖片路徑
  @ViewChild('appTopbarDiv', { static: false }) appTopbarDiv!: ElementRef; // 修正此行
  @ViewChild('menubutton') menuButton!: ElementRef;
  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
  @ViewChild('topbarmenu') menu!: ElementRef;
  queryForm = this.formBuilder.nonNullable.group({
    query_data: ['']
  });
  funRightsInfo: FunsrightInfo[] = []; // 功能權限資訊
  topLevelMenuItems: FunsrightInfo[] = []; // 新增：第一層菜單項
  now: Date = new Date(); // 當前時間
  private timerSubscription!: Subscription; // 計時器訂閱
  @Output() topMenuClick = new EventEmitter<string | null>(); // 新增：點擊頂部菜單項時發射事件
  activeTopMenuItem: FunsrightInfo | null = null; // 新增：追蹤當前激活的頂部菜單項

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    public router: Router,
    private messageService: NotificationService,
  ) { }
  ngOnInit() {
    this.image = `assets/layout/images/${this.layoutService.config().colorScheme === 'light' ? 'toms-logo' : 'toms-logo'}.png`;
    this.items = [
      {
        label: '個人資料',
        items: [
          { label: '修改使用者密碼', icon: 'pi pi-pen-to-square', command: () => this.router.navigate(['/changepsw']) },
          { label: '登出', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
        ]
      },
    ];
    this.initFavorites(); // 初始化最愛功能
    const funRightsInfoString = sessionStorage.getItem("FunRightsInfo");
    if (funRightsInfoString) {
      try {
        this.funRightsInfo = JSON.parse(funRightsInfoString)
          .filter((item: FunsrightInfo) => item.prog_no !== '000000' && item.prog_no !== '999999')
          .map((item: FunsrightInfo) => ({
            ...item,
            label: `${item.prog_no} ${item.prog_name}` // 建立 label 屬性
          }));
        this.topLevelMenuItems = this.funRightsInfo.filter(item => item.parent_id === '0'); // 假設 parent_id 為 null 或 undefined 表示第一層

      } catch (error) {
        console.error("Failed to parse FunRightsInfo:", error);
        this.funRightsInfo = [];
        this.topLevelMenuItems = [];
      }
    } else {
      this.topLevelMenuItems = [];
    }
    try {
      const userInfo = sessionStorage.getItem('UserInfo');
      this.data = userInfo ? JSON.parse(userInfo) : null
    } catch (error) {
      console.error("Failed to parse UserInfo:", error);
    }

    this.timerSubscription = interval(500).subscribe(() => {
      this.now = new Date();
    });
  };

  initFavorites(event?: any) {
    if (this.favorite) {
      this.favorite.toggle(event);
    } // 確保 favorite 存在
    this.authService.getFavorites().subscribe({
      next: (response: { prog_no: string }[]) => { // 指明 response 的結構
        const favoritesWithDetails: FunsrightInfo[] = [];
        response.forEach(fav => {
          const matchingFunRight = this.funRightsInfo.find(item => item.prog_no === fav.prog_no);
          if (matchingFunRight) {
            favoritesWithDetails.push(matchingFunRight);
          } else {
            console.warn(`找不到 prog_no: ${fav.prog_no} 對應的功能權限資訊。`);
          }
        });
        sessionStorage.setItem('Favorites', JSON.stringify(response));
        this.Favorites = favoritesWithDetails.map(item => ({
          label: item.prog_no + ' ' + item.prog_name,
          routerLink: item.path,
        }));
      },
      error: error => { console.error('Error fetching favorites:', error); }
    });
  }

  filteredProgs: any[] = [];
  filterCountry(event: any) {
    let filtered: { label: string; value: FunsrightInfo }[] = [];
    let query = event.query;

    for (let i = 0; i < this.funRightsInfo.length; i++) {
      const country = this.funRightsInfo[i];
      if (country.path?.trim() !== "") {
        if (country.label?.toLowerCase().includes(query.toLowerCase())) { // 判斷輸入是否包含在 label 中
          filtered.push({ label: country.label, value: country }); // 將 label 和原始物件一起放入 filteredCountries
        }
      }
    }
    this.filteredProgs = filtered;
  }

  onTopMenuItemClick(item: FunsrightInfo) {
    if (this.activeTopMenuItem === item) {
      this.activeTopMenuItem = null; // 點擊已激活的項，將其取消激活
      this.topMenuClick.emit(null); // 發射 null 表示沒有激活的頂部菜單項
    } else {
      this.activeTopMenuItem = item; // 點擊未激活的項，將其激活
      this.topMenuClick.emit(item.prog_no);
    }
  }

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

  editFavorites() {
    this.editingFavorites = !this.editingFavorites; // 切換編輯狀態
    this.selectedFavorites = []; // 清空選中的最愛項目
  }

  deleteSelectedFavorites() {
    // 打刪除API
    // ...
    // 初始化最愛功能
    this.initFavorites();
  }

  onRowReorder(event: TableRowReorderEvent) {
    console.log('Row reordered:', event);
    console.log('New order:', this.selectedFavorites);

    // 初始化最愛功能
    this.initFavorites();
  }

}
