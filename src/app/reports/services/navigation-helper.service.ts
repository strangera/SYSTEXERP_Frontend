import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationHelperService {
  constructor(private router: Router) { }

  /**
   * 共通方法：帶參數開啟新分頁
   * @param path 目標路徑，如 '/reports/fin/fin55080'
   * @param params 物件形式的參數，如 { AccNo: '1101', DateFrom: '2026-01' }
   */
  openInNewTab(path: string, params: Record<string, any>) {
    // 過濾掉 null 或 undefined 的參數
    const queryParams = Object.keys(params)
      .reduce((acc: Record<string, any>, key) => {
        if (params[key] !== null && params[key] !== undefined) {
          acc[key] = params[key];
        }
        return acc;
      }, {});

    const urlTree = this.router.createUrlTree([path], { queryParams });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank', 'noopener');
  }
}
