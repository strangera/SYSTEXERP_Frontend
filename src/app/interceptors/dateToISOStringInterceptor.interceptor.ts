import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 注意這裡要從 'rxjs/operators' 引入 map

@Injectable() // 必須添加此裝飾器，以便 Angular 可以注入此服務
export class DateToISOStringInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 如果請求體是 FormData，則跳過日期轉換
    const clonedReq = req.body instanceof FormData ? req : req.clone({ body: this.serializeDates(req.body) });

    return next.handle(clonedReq).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse && event.body) {
          const body = event.body;
          // 假設你的日期數據在響應的 'Data' 屬性中
          if (body.Data) {
            body.Data = this.deserializeDates(body.Data);
          }
          return event.clone({ body });
        }
        return event;
      })
    );
  }

  /**
   * **序列化請求數據中的 Date（到秒，無時區）**
   * 將 Date 物件或符合日期字串格式的值轉換為 "yyyy-MM-dd'T'HH:mm:ss" 格式。
   * @param data 要序列化的數據。
   * @returns 序列化後的數據。
   */
  private serializeDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.serializeDates(item));
    } else if (data !== null && typeof data === 'object') {
      return Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        if (typeof value === 'string' && this.isDateString(value)) {
          // 如果是字串且符合日期格式，先轉為 Date 物件再格式化，確保一致性
          const date = new Date(value);
          acc[key] = this.formatDateToISO(date);
        } else if (value instanceof Date) {
          // 如果是 Date 物件，直接格式化
          acc[key] = this.formatDateToISO(value);
        } else {
          // 遞歸處理嵌套對象
          acc[key] = this.serializeDates(value);
        }
        return acc;
      }, {} as any);
    }
    return data;
  }

  /**
   * **反序列化響應中的日期**
   * 將符合 ISO 8601 日期格式的字串轉換為 Date 物件。
   * @param data 要反序列化的數據。
   * @returns 反序列化後的數據。
   */
  private deserializeDates(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.deserializeDates(item));
    } else if (data !== null && typeof data === 'object') {
      return Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        acc[key] = typeof value === 'string' && this.isDateString(value)
          ? new Date(value) // 將日期字串轉換為 Date 物件
          : this.deserializeDates(value); // 遞歸處理嵌套對象
        return acc;
      }, {} as any);
    }
    return data;
  }

  /**
   * **檢查是否為 ISO 8601 日期格式**
   * 支援 "YYYY-MM-DDTHH:mm:ss.sssZ" 格式（可選毫秒與時區）。
   * @param value 要檢查的字串。
   * @returns 如果是有效的 ISO 8601 日期字串則返回 true，否則返回 false。
   */
  private isDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(value);
  }

  /**
   * **將 Date 物件格式化為 "yyyy-MM-dd'T'HH:mm:ss" 字串。**
   * 此方法用於內部統一日期輸出格式。
   * @param date Date 物件。
   * @returns 格式化後的日期字串。
   */
  private formatDateToISO(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
