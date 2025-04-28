import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, delay, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ApiItem {
  name: string;
  imageUrl: string;
  url?: string;
  routerLink?: string;
  description?: string; // 可選屬性
}

@Injectable({
  providedIn: 'root',
})
export class SsoDashboardService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  private apiUrl: string = environment.ApiUrl;

  // 模擬 API 呼叫，返回一個 Observable<ApiItem[]>
  fetchUrlList(): Observable<ApiItem[]> {
    // 模擬的 API 回應資料
    const mockData: ApiItem[] = [
      {
        name: 'EIP系統',
        imageUrl: 'assets/layout/images/EIP.png',
        routerLink: '/dashboard',
        description:
          '這是一個 EIP 系統的描述，提供企業內部資訊的交流和管理功能。',
      },
      {
        name: '優惠券系統',
        imageUrl: 'assets/layout/images/coupon.png',
        url: 'https://angular.io/',
      },
      {
        name: '票券系統',
        imageUrl: 'assets/layout/images/coupon1.png',
        url: 'https://www.primefaces.org/primeng/',
        description: '這是一個票券系統的描述，提供票券的發放和兌換功能。',
      },
      {
        name: 'CRM系統',
        imageUrl: 'assets/layout/images/crm.png',
        url: 'https://www.typescriptlang.org/',
        description: '這是一個 CRM 系統的描述，提供客戶關係管理的功能。',
      },
    ];

    console.log('模擬SSO資料:', this.checkAndNavigate());

    // 使用 'of' 操作符將模擬資料轉換為 Observable
    // 使用 'delay' 操作符模擬網路延遲
    return of(mockData).pipe(delay(1000)); // 模擬 1 秒的延遲
  }

  // 測試SSO connn 呼叫
  checkAndNavigate() {
    const url = `${this.apiUrl}/User/GetUserDashboard`;

    this.http
      .request<any>('POST', url, { body: {} })
      .pipe(
        map((response) => {
          if (response.Status === '0000') {
            //在此寫入 將Menu權限資料寫入 sessionStorage
            // sessionStorage.setItem(
            //   'UserSSOInfo',
            //   JSON.stringify(response.Data),
            // );

            console.log('SSO回應:', response.Data);
            return true;
          } else {
            throw new Error('API Status not 0000');
          }
        }),
        catchError((error) => {
          console.error('API錯誤:', error);
          return throwError(() => new Error('使用者無訪問權限'));
        }),
      )
      .subscribe({
        next: () => {
          // window.location.href = targetUrl;
        },
        error: (err) => {
          alert('無法取得使用者資訊，請稍後再試。');
        },
      });
  }
}
