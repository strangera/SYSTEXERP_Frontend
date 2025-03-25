import { animate, state, style, transition, trigger } from '@angular/animations';
import { ElementRef, EventEmitter, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-menulist',
  templateUrl: './app.menulist.component.html',
  styleUrls: ['./app.menulist.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('children', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*'
      })),
      transition('collapsed <=> expanded',
        animate('400ms cubic-bezier(0.86, 0, 0.07, 1)'))
    ])
  ]
})
export class AppMenulistComponent implements OnInit {
  @Output() menuaddTab: EventEmitter<any> = new EventEmitter<any>();
  model: MenuItem[] = [];
  activeItem: any; // 新增：用於追蹤當前激活的選單項目

  constructor(
    public el: ElementRef,
    private router: Router) { }

  ngOnInit() {
    if (localStorage.getItem("FunRightsInfo")) {
      const funs = JSON.parse(localStorage.getItem("FunRightsInfo") || "");
      this.getFunctinLists(funs);
    }

    // 新增：監聽路由變化並設置選單激活狀態
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.setActiveItem(this.model, this.router.url);
      }
    });
  }

  // 新增：設置激活選單項目
  setActiveItem(items: MenuItem[], url: string) {
    items.forEach(item => {
      if (url.includes("CRU") && this.activeItem && this.activeItem.routerLink && this.activeItem.routerLink[0] !== url) {
        // 如果 URL 包含 "CRU"，且不是直接匹配 activeItem，保持當前展開狀態
        item.expanded = item.expanded || (item.routerLink && item.routerLink[0] === this.activeItem.routerLink[0]);
      } else {
        item.expanded = false;
      }
  
      if (item.routerLink && item.routerLink[0] === url) {
        this.activeItem = item;
        item.expanded = true;
      }
  
      if (item.items) {
        this.setActiveItem(item.items, url);
        // 若子項目展開，則父項目也展開
        item.expanded = item.expanded || item.items.some(subItem => subItem.expanded);
      }
    });
  }

  getFunctinLists(lists: any[], parent_id: string = "0"): any {
    var items: any[] = [];
    if (lists.length > 0) {
      var filterItems = this.filterItemsByParentId(lists, parent_id);
      if (filterItems) {
        if (parent_id == "0") {
          filterItems.forEach(async (element: any) => {
            var progNo = element.prog_no;
            var f_items = (await this.getFunctinLists(lists, progNo));
            if (f_items.length > 0)
              element.items = f_items;
            if (!this.checkExists(this.model, element)) {
              this.model.push(element);
            }
          });
        } else {
          filterItems.forEach(async (element: any) => {
            var progNo = element.prog_no;
            var f_items = (await this.getFunctinLists(lists, progNo));
            if (f_items.length > 0)
              element.items = f_items;
          });

          return filterItems;
        }

        lists.forEach((element, index) => {
          if (element.parent_id == parent_id) delete lists[index];
        });
      } else {
        var item = lists[0];
        var label = item.prog_name;
        var parentid = item.parent_id;
        var group_no = item.group_no;
        var path = item.path;
        var progNo = item.prog_no;
        items.push({ label: label, routerLink: [path] });
        return items;
      }
    }
  }

  filterItemsByParentId(lists: any[], parent_id: string): any {
    var tmp = lists.filter(item => item.parent_id == parent_id && item.enable_fg == 1 && item.show_fg == 1);
    var items: any[] = [];
    tmp.forEach((element: any) => {
      var item = element;
      var label = item.prog_name;
      var parentid = item.parent_id;
      var group_no = item.group_no;
      var progNo = item.prog_no;
      var path = item.path;

      if (!this.checkExists(items, item)) {
        if (path) {
          items.push({
            label: label,
            icon: 'pi pi-fw pi-bookmark',
            routerLink: [path],
            prog_no: progNo,
          });
        } else {
          items.push({ label: label, icon: 'pi pi-fw pi-home', prog_no: progNo });
        }
      }
    });
    return items;
  }

  checkExists(arr: any[], element: any): boolean {
    if (!Array.isArray(arr)) {
      return false;
    }

    if (arr.find(e => e.prog_no == element.prog_no)) {
      return true;
    }

    return false;
  }

  toggleActive(item: MenuItem) {
    item.expanded = !item.expanded;
  }

  onAddTab(item: any) {
    this.menuaddTab.emit(item);
  }
}
