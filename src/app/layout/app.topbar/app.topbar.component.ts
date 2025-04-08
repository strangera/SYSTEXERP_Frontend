import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from '../../shared/service/layout.service';
import { AuthService } from '../../service/system/auth.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserInfo } from '../../models/system/userInfo';
import { TranslateService } from '@ngx-translate/core';
import { ClickTopMenuService } from '../../shared/service/click-top-menu.service';

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrl: './app.topbar.component.scss',
    encapsulation: ViewEncapsulation.None,
})
export class AppTopbarComponent implements OnInit {
  title: string = 'management-platform-title';
  logo: string = 'assets/layout/images/logo.png';
  items!: MenuItem[];
  user!: string;
  // Dialog
  // ----------------------------------------------------------------
  visible: boolean = false;
  syscode = [
    {
        "key": "4101",
        "value": "公司基本資料維護作業 (4101)"
    },
    {
        "key": "4102",
        "value": "廠商基本資料維護作業 (4102)"
    },
    {
        "key": "4103",
        "value": "組織階層設定作業 (4103)"
    },
    {
        "key": "4104",
        "value": "組織碼設定作業 (4104)"
    },
    {
        "key": "4105",
        "value": "區域基本資料維護作業 (4105)"
    },
    {
        "key": "4106",
        "value": "樓層基本資料維護作業 (4106)"
    },
    {
        "key": "4107",
        "value": "業種基本資料維護作業 (4107)"
    },
    {
        "key": "4108",
        "value": "商品類別維護作業 (4108)"
    },
    {
        "key": "4109",
        "value": "小分類維護作業 (4109)"
    },
    {
        "key": "4110",
        "value": "銀行基本資料維護作業 (4110)"
    },
    {
        "key": "4111",
        "value": "參數資料設定維護 (4111)"
    },
    {
        "key": "4112",
        "value": "簽核權限設定維護 (4112)"
    },
    {
        "key": "4113",
        "value": "縣市區域資料維護作業 (4113)"
    }
];
  menuItems = [
    { label: '人資財會', icon: 'pi pi-sitemap', prog_no: '100000'},
    { label: '商場管理', icon: 'pi pi-shopping-bag' , prog_no: '200000'},
    { label: '物業管理', icon: 'pi pi-box' , prog_no: '300000'},
    { label: '權限及基本資料', icon: 'pi pi-users' , prog_no: '400000'},
    { label: '行銷管理', icon: 'pi pi-chart-pie' , prog_no: '500000'}
  ];
  // ----------------------------------------------------------------
  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  queryForm = this.formBuilder.nonNullable.group({
    query_data: ['']
  });

  constructor(
    public layoutService: LayoutService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private clickTopMenuService: ClickTopMenuService,
  ) {
    this.loadTranslatedTitle();
  }

  ngOnInit() {
    this.items = [
        {
          label: 'profile',
          icon: 'pi pi-refresh',
          command: () => {
            // this.profile();
        }},
        {label: 'Logout', icon: 'pi pi-times', command: () => {
            this.logout();
        }},
        //{label: 'Angular.io', icon: 'pi pi-info', url: 'http://angular.io'},
        {separator: true},
        //{label: 'Setup', icon: 'pi pi-cog', routerLink: ['/setup']}
    ];

    let data =JSON.parse(localStorage.getItem('UserInfo') || '') as UserInfo
    this.user = data.user_id || '';
  };

  loadTranslatedTitle() {
    this.translate.get('management-platform-title').subscribe((translatedTitle: string) => {
      this.title = translatedTitle;
    });
  }

  logout() {
    this.authService.logout();
  }

  get f() { return this.queryForm.controls; }

  submitQuery(frm: FormGroup) {
    this.onSubmit(frm)
  }

  onSubmit(frm: FormGroup) {
  //console.log(frm.controls["query_data"].value);
  if (localStorage.getItem("FunRightsInfo") && (frm.controls["query_data"] && frm.controls["query_data"].value != ""))
  {
      const funs = JSON.parse(localStorage.getItem("FunRightsInfo") || "");
      console.log('funs:', funs);
      //先check 名稱(prog_name)
      let findFuns = funs.filter((x: any) => x.prog_name.includes(frm.controls["query_data"].value))
      console.log(findFuns);
      //console.log(findFuns);
      if (findFuns.length >= 1) {
        for (var i = 0; i < findFuns.length; i++) {
          if (findFuns[i].path != '') {
            this.router.navigate([findFuns[i].path]);
            this.queryForm.reset();
            break;
          }
        }
      } else {
        //再check 編號(prog_id)
        let findFuns = funs.filter((x: any) => x.prog_id == frm.controls["query_data"].value)
        if (findFuns.length >= 1) {
          for (var i = 0; i < findFuns.length; i++) {
            if (findFuns[i].path != '') {
              this.router.navigate([findFuns[i].path]);
              this.queryForm.reset();
              break;
            }
          }
        }
      }
    }
  }

  switchLanguage(event: any) {
    this.translate.use(event.target.value);
  }

  // ----------------------------------------------------------------    showDialog() {
  showDialog() {
      this.visible = true;
  }

  //----resetMenuList----
  resetMenuList(value: any){
    // console.log('topBar切換為',value);
    this.clickTopMenuService.setMenuValue(value);
  }
}
