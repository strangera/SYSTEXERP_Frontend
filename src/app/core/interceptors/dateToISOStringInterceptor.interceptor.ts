import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 注意這裡要從 'rxjs/operators' 引入 map

@Injectable() // 必須添加此裝飾器，以便 Angular 可以注入此服務
export class DateToISOStringInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 如果請求體是 FormData，則跳過日期轉換
    const clonedReq = req.body instanceof FormData ? req : req.clone({ body: this.serializeDates(req.body) });

    return next.handle(clonedReq).pipe(
      map((event: HttpEvent<ApiResponse<unknown>>) => {
        if (event instanceof HttpResponse && event.body) {
          const body = event.body;
          if (body.Data) {
            // 這裡的 body.Data 應當使用泛型 T 的類型，但由於是攔截器，使用 unknown
            body.Data = this.deserializeDates(body.Data);
          }
          return event.clone({ body });
        }
        return event;
      })
    );
  }

  /**
   * **序列化請求數據中的 Date**
   * @param data 要序列化的數據。
   * @returns 序列化後的數據。
   */
  private serializeDates<T>(data: T): T { // 使用泛型 <T>
    if (Array.isArray(data)) {
      // 這裡需要將 data 斷言為陣列類型，以讓 TypeScript 知道 map 的結果
      return (data as unknown[]).map(item => this.serializeDates(item)) as T;
    } else if (data !== null && typeof data === 'object' && !('getDate' in data)) {
      // 關鍵修正：將 data 斷言為 Record<string, unknown>，告訴 TypeScript 它的索引是 string
      const dataObject = data as Record<string, unknown>;
      return Object.keys(dataObject).reduce((acc, key) => {
        // 現在 dataObject[key] 是安全的 (類型為 unknown)
        const value = dataObject[key];
        if (typeof value === 'string' && this.isDateString(value)) {
          const date = new Date(value);
          acc[key] = this.formatDateToISO(date);
        } else if (value instanceof Date) {
          acc[key] = this.formatDateToISO(value);
        } else {
          // 遞歸處理嵌套對象
          acc[key] = this.serializeDates(value);
        }
        return acc;
      }, {} as Record<string, unknown>) as T; // 替換 as any 為 as Record<string, unknown>
    }
    return data;
  }

  /**
   * **反序列化響應中的日期**
   * @param data 要反序列化的數據。
   * @returns 反序列化後的數據。
   */
  private deserializeDates<T>(data: T): T { // 使用泛型 <T>
    if (Array.isArray(data)) {
      return (data as unknown[]).map(item => this.deserializeDates(item)) as T;
    } else if (data !== null && typeof data === 'object' && !('getDate' in data)) {
      // 關鍵修正：將 data 斷言為 Record<string, unknown>，告訴 TypeScript 它的索引是 string
      const dataObject = data as Record<string, unknown>;
      return Object.keys(dataObject).reduce((acc, key) => {
        // 現在 dataObject[key] 是安全的 (類型為 unknown)
        const value = dataObject[key];
        acc[key] = typeof value === 'string' && this.isDateString(value)
          ? (() => {
            // 關鍵修正點：確保解析行為一致
            let dateString = value;

            // 檢查字串是否結尾有時區 (Z 或 +HH:MM)。
            // 如果沒有，我們假設它應該是本地時間 (例如，台灣時間+08:00)，
            // 但為了讓瀏覽器正確解析，最簡單的方法是讓 JS 把它當作本地時間
            if (dateString.length === 19 && dateString.charAt(10) === 'T') {
              // YYYY-MM-DDTHH:mm:ss 格式，後面沒有 Z
              // 解決方式：插入一個空格，讓 JS 將其當作本地時間解析 (舊版 Chrome/Firefox 行為)
              // 或者更安全：手動將 T 替換為空格，這是跨環境解析本地日期的標準 HACK
              dateString = dateString.replace('T', ' ');
            }

            // 註：如果後端數據永遠是本地時間，這是最簡單的處理方式。
            return new Date(dateString);

          })()
          : this.deserializeDates(value);
        return acc;
      }, {} as Record<string, unknown>) as T;
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
