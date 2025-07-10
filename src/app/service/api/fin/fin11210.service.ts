import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

export interface FIN11210Data {
  code: string;      // 參數代碼
  description: string; // 參數說明
  content: string; // 參數內容
}

export interface FIN11210QueryRequest extends BaseQueryRequest {
  code?: string;      // 參數代碼
}

@Injectable({
  providedIn: 'root'
})
export class FIN11210Service {

  constructor() { }

  // 查詢
  queryFIN11210(params: FIN11210QueryRequest): Observable<BaseQueryResponse<FIN11210Data>> {
    // 回傳假資料
    return new Observable((r) => {
      r.next({
        Status: '0000',
        Data: [{
          code: 'EcrGUIAutoCnfgDayBeforeMonEnd',
          description: '本期發票年月結束前幾天自動分配下期發票',
          content: 'test'
        }],
        Message: '查詢成功',
        TotalCount: 1,
        TotalPage: 1,
      } as BaseQueryResponse<FIN11210Data>);
      r.complete();
    });
  }
}
