import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MenuItem } from 'primeng/api';

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
    const funs = sessionStorage.getItem("FunRightsInfo");
    if (funs) {
      this.getMenuName(JSON.parse(funs), this.ProgNo);
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
    const favorites: { prog_no: string }[] = JSON.parse(sessionStorage.getItem('Favorites') || '[]');
    return favorites.some(favorite => favorite.prog_no === progNo);
  }

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
    const favorites: { prog_no: string }[] = JSON.parse(sessionStorage.getItem('Favorites') || '[]');
    const currentFavorite = { prog_no: this.ProgNo };
    if (this.isFavorite) {
      if (!favorites.some(fav => fav.prog_no === this.ProgNo)) {
        favorites.push(currentFavorite);
      } else {
        this.isFavorite = true;
      }
    } else {
      // 從收藏夾移除
      const index = favorites.findIndex(fav => fav.prog_no === this.ProgNo);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }

    sessionStorage.setItem('Favorites', JSON.stringify(favorites));
    this.updateBreadcrumbStyle();
  }

  updateBreadcrumbStyle() {
    this.breadcrumbItems = this.breadcrumbItems.map(item => ({
      ...item,
    }));
  }
}
