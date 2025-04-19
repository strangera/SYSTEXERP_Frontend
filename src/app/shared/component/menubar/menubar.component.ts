import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { FunsrightInfo } from '../../../models/system/funsrightInfo';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrl: './menubar.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MenubarComponent implements OnInit {
  @Input() ProgNo: string = '';
  home: any;
  breadcrumbItems: MenuItem[] = [];
  menu: string[] = [];

  isFavorite: boolean = false;

  constructor() { }

  ngOnInit(): void {
    this.home = { icon: 'pi pi-home', routerLink: '/dashboard' };
    this.breadcrumbItems = [];
    if (localStorage.getItem("FunRightsInfo")) {
      let funs: FunsrightInfo[] = JSON.parse(localStorage.getItem("FunRightsInfo") || "");
      // console.log(this.ProgNo);
      this.getMenuName(funs, this.ProgNo);

      // 檢查是否已經加入我的最愛
      // this.isFavorite = this.checkIfFavorite(this.ProgNo);

      for (var i = this.menu.length - 1; i >= 0; i--) {
        if (this.menu[i]) {
          if (i !== 0) {
            this.breadcrumbItems.push(
              {
                label: this.menu[i],
              });
          } else {
            this.breadcrumbItems.push(
              {
                label: this.menu[i],
                icon: 'pi pi-star',
                styleClass: this.isFavorite ? 'favorite-active' : '', // 如果有加入"我的最愛"變色
                command: () => this.toggleFavorite()
              });
          }
        }
      }
    }
  }

  getMenuName(funs: any[], progNo: string) {
    var prog = funs.filter(x => x.prog_no == progNo && x.enable_fg == "1" && x.show_fg == "1");
    if (prog[0].parent_id != "0") {
      this.menu.push(prog[0].prog_name);
      this.getMenuName(funs, prog[0].parent_id)
    } else {
      this.menu.push(prog[0].prog_name);
    }
  }

  checkIfFavorite(progNo: string): boolean {
    const favorites = JSON.parse(localStorage.getItem('Favorites') || '[]');
    return favorites.includes(progNo);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    const favorites = JSON.parse(localStorage.getItem('Favorites') || '[]');

    if (this.isFavorite) {
      favorites.push(this.ProgNo);
    } else {
      const index = favorites.indexOf(this.ProgNo);
      if (index > -1) favorites.splice(index, 1);
    }

    sessionStorage.setItem('Favorites', JSON.stringify(favorites));

    // 即時更新麵包屑中的顏色變化
    this.updateBreadcrumbStyle();
  }

  updateBreadcrumbStyle() {
    this.breadcrumbItems = this.breadcrumbItems.map(item => ({
      ...item,
      styleClass: this.isFavorite ? 'favorite-active' : ''
    }));
  }
}
