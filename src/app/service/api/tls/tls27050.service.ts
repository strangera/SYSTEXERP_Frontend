import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS27050Request {
  TXN_Date: string;
  PAY_NO: string[];
}

export interface ITLS27050Data {

}

@Injectable({
  providedIn: 'root'
})
export class TLS27050Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS2008M (商品促銷主檔) 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS52050Data 陣列的 API 響應
   */
  queryTLS52050(params: QueryTLS27050Request): Observable<ApiResponse<ITLS27050Data[]>> {
    return this.http.post<ApiResponse<ITLS27050Data[]>>(`${this.apiUrl}/queryTLS27050`, params);
  }
}
