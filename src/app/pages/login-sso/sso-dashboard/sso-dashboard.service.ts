import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';

export interface ApiItem {
  name: string;
  imageUrl: string;
  url?: string;
  routerLink?: string;
  description?: string; // 可選屬性
}

@Injectable({
  providedIn: 'root'
})
export class SsoDashboardService {

  // 模擬 API 呼叫，返回一個 Observable<ApiItem[]>
  fetchUrlList(): Observable<ApiItem[]> {
    // 模擬的 API 回應資料
    const mockData: ApiItem[] = [
      {
        name: 'EIP系統', imageUrl: 'assets/layout/images/EIP.png', routerLink: '/dashboard',
        description: '這是一個 EIP 系統的描述，提供企業內部資訊的交流和管理功能。'
      },
      {
        name: '優惠券系統', imageUrl: 'assets/layout/images/coupon.png', url: 'https://angular.io/',
      },
      {
        name: '票券系統', imageUrl: 'assets/layout/images/coupon1.png', url: 'https://www.primefaces.org/primeng/',
        description: '這是一個票券系統的描述，提供票券的發放和兌換功能。'
      },
      {
        name: 'CRM系統', imageUrl: 'assets/layout/images/crm.png', url: 'https://www.typescriptlang.org/',
        description: '這是一個 CRM 系統的描述，提供客戶關係管理的功能。'
      },
    ];

    // 使用 'of' 操作符將模擬資料轉換為 Observable
    // 使用 'delay' 操作符模擬網路延遲
    return of(mockData).pipe(delay(1000)); // 模擬 1 秒的延遲
  }
}
