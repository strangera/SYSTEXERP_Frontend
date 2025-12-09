import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// 引入所需的工具函式 (請確保這些函式在該檔案中或已匯入)

export const dateToISOStringInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  // 1. 請求序列化 (將 Date 物件轉為 ISO 字串)
  // 注意：需要將 serializeDates, deserializeDates, formatDateToISO, isDateString
  // 這些輔助方法定義在外部（或本檔案的底部）。
  const clonedReq = req.body instanceof FormData
    ? req
    : req.clone({ body: serializeDates(req.body) }); // 呼叫外部函式

  // 2. 響應反序列化 (將 ISO 字串轉回 Date 物件)
  return next(clonedReq).pipe( //  使用 next(clonedReq)
    map((event: HttpEvent<any>) => { // 由於 body 類型複雜，使用 any 減少 TS 複雜度
      if (event instanceof HttpResponse && event.body) {
        const body = event.body;
        // 假設 body 結構為 { Code: number, Data: T, ... }
        if (body?.Data) { // 使用可選鏈操作符 (Optional Chaining)
          body.Data = deserializeDates(body.Data); // 呼叫外部函式
        }
        return event.clone({ body });
      }
      return event;
    })
  );
};

// -------------------------------------------------------------
// 輔助函式定義 (保持您的原始邏輯，但從 private 方法轉為獨立函式)
// -------------------------------------------------------------

/**
 * 檢查是否為 ISO 8601 日期格式
 */
function isDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/.test(value);
}

/**
 * 將 Date 物件格式化為 "yyyy-MM-dd'T'HH:mm:ss" 字串。
 */
function formatDateToISO(date: Date): string {
  // 保持您的原始邏輯
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * 序列化請求數據中的 Date
 */
function serializeDates<T>(data: T): T {
  // 保持您的原始邏輯...
  // 由於程式碼太長，這裡省略。將您的 serializeDates 邏輯複製貼上，但作為一個獨立的 function。
  // 🚨 記得移除所有 'this.' 的引用
  if (Array.isArray(data)) {
    return (data as unknown[]).map(item => serializeDates(item)) as T;
  } else if (data !== null && typeof data === 'object' && !('getDate' in data)) {
    const dataObject = data as Record<string, unknown>;
    return Object.keys(dataObject).reduce((acc, key) => {
      const value = dataObject[key];
      if (typeof value === 'string' && isDateString(value)) {
        const date = new Date(value);
        acc[key] = formatDateToISO(date); // 🚨 移除 this.
      } else if (value instanceof Date) {
        acc[key] = formatDateToISO(value); // 🚨 移除 this.
      } else {
        acc[key] = serializeDates(value);
      }
      return acc;
    }, {} as Record<string, unknown>) as T;
  }
  return data;
}

/**
 * 反序列化響應中的日期
 */
function deserializeDates<T>(data: T): T {
  // 保持您的原始邏輯...
  // 🚨 記得移除所有 'this.' 的引用
  if (Array.isArray(data)) {
    return (data as unknown[]).map(item => deserializeDates(item)) as T;
  } else if (data !== null && typeof data === 'object' && !('getDate' in data)) {
    const dataObject = data as Record<string, unknown>;
    return Object.keys(dataObject).reduce((acc, key) => {
      const value = dataObject[key];
      acc[key] = typeof value === 'string' && isDateString(value)
        ? (() => {
          let dateString = value;

          if (dateString.length === 19 && dateString.charAt(10) === 'T') {
            // 假設它是本地時間，將 T 替換為空格以確保一致的本地解析
            dateString = dateString.replace('T', ' ');
          }
          return new Date(dateString);
        })()
        : deserializeDates(value);
      return acc;
    }, {} as Record<string, unknown>) as T;
  }
  return data;
}
