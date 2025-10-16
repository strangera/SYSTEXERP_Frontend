import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Observable, Subject, takeUntil } from 'rxjs';

@Injectable()
export class HTTPRequestInterceptorService implements HttpInterceptor {

  private readonly cancelRequests$ = new Subject<void>();

  // API例外清單
  private readonly excludedUrls: string[] = [
  ];

  // 路由例外清單
  private readonly excludedRoutes: string[] = [
  ];

  constructor(
    private readonly router: Router,
  ) {
    // 監聽路由改變事件
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // 檢查是否為排除的路由
      const shouldExclude = this.excludedRoutes.some(excludedRoute =>
        event.url.startsWith(excludedRoute)
      );

      if (!shouldExclude) {
        // 路由改變時，發送中斷信號
        this.cancelRequests$.next();
      }
    });
  }

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 檢查是否為排除的API路徑
    const shouldExcludeRequest = this.excludedUrls.some(excludedUrl =>
      req.url.includes(excludedUrl)
    );

    // 如果是排除的API請求，則不受路由變更影響
    if (shouldExcludeRequest) {
      return next.handle(req);
    }

    // 在路由改變時自動中斷請求
    return next.handle(req).pipe(
      takeUntil(this.cancelRequests$)
    );
  }

  /**
   * 加入排除的API路徑
   * @param url - 要排除的API路徑
   */
  addExcludedUrl(url: string): void {
    if (!this.excludedUrls.includes(url)) {
      this.excludedUrls.push(url);
    }
  }

  /**
   * 移除排除的API路徑
   * @param url - 要移除的API路徑
   */
  removeExcludedUrl(url: string): void {
    const index = this.excludedUrls.indexOf(url);
    if (index > -1) {
      this.excludedUrls.splice(index, 1);
    }
  }

  /**
   * 加入排除的路由路徑
   * @param route - 要排除的路由路徑
   */
  addExcludedRoute(route: string): void {
    if (!this.excludedRoutes.includes(route)) {
      this.excludedRoutes.push(route);
    }
  }

  /**
   * 移除排除的路由路徑
   * @param route - 要移除的路由路徑
   */
  removeExcludedRoute(route: string): void {
    const index = this.excludedRoutes.indexOf(route);
    if (index > -1) {
      this.excludedRoutes.splice(index, 1);
    }
  }
}
