import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';

// 查詢參數介面
export interface TLS2C040QueryParams extends BaseQueryRequest {
  subpoenaType?: any[]; // 傳票總類
  startdate?: Date | null; // 傳票開始日期
  enddate?: Date | null; // 傳票結束日期
  subpoenaStatus?: any[]; // 傳票狀態
  serialnumber?: string | null; // 結帳單號
}

// 查詢結果項目介面
export interface TLS2C040Data {
  contactPerson: string; // 應收(付)明細暫存資料
  contactDate: string; // 傳票編號
  UID: string; // 傳票種類
  industryType: string; // 傳票日期
  category: string; // 傳票狀態
  version: string; // 傳票摘要
  rentNumber: string; // 結帳單號
}

@Injectable({
  providedIn: 'root'
})
export class TLS2C040Service {
  private apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  queryTLS2C040(data: TLS2C040QueryParams): Observable<BaseQueryResponse<TLS2C040Data>> {
    // return this.http.post<BaseQueryResponse<TLS2C040Data>>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS2C040`, data);

    // 回傳模擬資料
    return of({
      Status: '0000',
      Message: '查詢成功',
      Data: [
        {
          contactPerson: '張三',
          contactDate: '2024-01-15',
          UID: 'UID001',
          industryType: '製造業',
          category: '收入',
          version: 'V1.0',
          rentNumber: 'RN202401001'
        },
        {
          contactPerson: '李四',
          contactDate: '2024-01-16',
          UID: 'UID002',
          industryType: '服務業',
          category: '支出',
          version: 'V1.1',
          rentNumber: 'RN202401002'
        }
      ],
      TotalCount: 2,
      TotalPage: 1
    })
  }
}
