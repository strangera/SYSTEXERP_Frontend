import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// --- FIN11050 Model 定義 ---
export interface FIN11050 {
  format_code?: string;      // 格式代號
  format_name?: string;      // 格式名稱
}

@Injectable({
  providedIn: 'root'
})
export class Fin11050Service {

  constructor() { }

  // 查詢
  queryFIN11050(params: any): Observable<any> {
    // 回傳假資料
    return new Observable((observer) => {
      observer.next({
        Data: [
          {
            format_code: 'A1',
            format_name: '薪資格式'
          },
          {
            format_code: 'B2',
            format_name: '獎金格式'
          }
        ],
        Status: '0000',
        TotalCount: 2
      });
      observer.complete();
    });
  }

  // 新增
  insertFIN11050(body: any): Observable<any> {
    return new Observable((observer) => {
      observer.next({ Status: '0000', Message: '新增成功' });
      observer.complete();
    });
  }

  // 修改
  updateFIN11050(body: any): Observable<any> {
    return new Observable((observer) => {
      observer.next({ Status: '0000', Message: '修改成功' });
      observer.complete();
    });
  }
}
