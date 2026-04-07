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
    // 1. 處理 path：移除開頭的 '/'，避免指向網域根目錄
    // 例如：'/reports/fin' -> ['reports', 'fin']
    const pathArray = path.split('/').filter(segment => segment !== '');

    // 2. 過濾參數
    const queryParams = Object.keys(params).reduce((acc: Record<string, any>, key) => {
      if (params[key] !== null && params[key] !== undefined) {
        acc[key] = params[key];
      }
      return acc;
    }, {});

    // 3. 關鍵修正：使用 pathArray (陣列形式)
    // Angular Router 會自動根據 base-href 拼接正確的 URL
    const urlTree = this.router.createUrlTree(pathArray, { queryParams });

    // 序列化成字串 (這會包含 base-href，例如 /tsrdwebdev/reports/fin...)
    const url = this.router.serializeUrl(urlTree);

    // 4. 使用 window.open
    window.open(url, '_blank', 'noopener');
  }
}
