import { LocationStrategy } from '@angular/common';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationHelperService {
  constructor(private router: Router,
    private location: LocationStrategy) { }

  /**
   * 共通方法：帶參數開啟新分頁
   * @param path 目標路徑，如 '/reports/fin/fin55080'
   * @param params 物件形式的參數，如 { AccNo: '1101', DateFrom: '2026-01' }
   */
  openInNewTab(path: string, params: Record<string, any>) {
    // 1. 移除開頭斜線，將路徑轉為陣列
    const pathArray = path.split('/').filter(s => s !== '');

    // 2. 建立 URL Tree
    const urlTree = this.router.createUrlTree(pathArray, {
      queryParams: params
    });

    // 3. 序列化 (這通常拿到的是 /reports/sys/...)
    const serializedUrl = this.router.serializeUrl(urlTree);

    // 4. 關鍵修正：手動補上 Base Href
    // getBaseHref() 會回傳你在 index.html 看到的 "/tsrdwebdev/"
    const baseHref = this.location.getBaseHref();

    // 組合最終網址：BaseHref + 序列化網址 (並處理可能重疊的斜線)
    const finalUrl = (baseHref + serializedUrl).replace(/\/+/g, '/');

    // 5. 使用 globalThis.open
    globalThis.open(finalUrl, '_blank', 'noopener');
  }
}
