import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FIN21010Request extends BaseQueryRequest {
  BNK_DepositAccNo?: string;        // 公司銀行科目
  AccCName?: string;                // 公司銀行科目名稱
  BNK_No?: string;                  // 全省銀行代碼
  BNK_AccNo?: string[];             // 帳號
  BNK_AccName?: string[];           // 帳戶名稱
  BNK_AccType?: string;             // 存款代號
  BNK_CheckInAccNo?: string;        // 應付票據科目
  BNK_CheckOutAccNo?: string;       // 應收票據科目
}

export interface FIN21010Response {
  id: number;
  BNK_DepositAccNo: string;
  AccCName: string;
  BNK_No: string;
  BNK_AccNo: string;
  BNK_AccName: string;
  BNK_AccType: string;
  SYS_Name: string;
  BNK_CheckInAccNo: string;
  BNK_CheckOutAccNo: string;
}

@Injectable({
  providedIn: 'root'
})
export class Fin21010Service {

  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';
  constructor(private http: HttpClient) { }
  
    // 查詢 APS1002 資料表
    queryFIN21010(data: FIN21010Request): Observable<BaseQueryResponse<FIN21010Response>> {
      return this.http.post<BaseQueryResponse<FIN21010Response>>(`${this.apiUrl}/queryFIN21010`, data);
    }
  
    // 新增 APS1002 資料
    insertFIN21010(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/insertFIN21010`, body);
    }

    // 修改 APS1002 資料
    updateFIN21010(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/updateFIN21010`, body);
    }

    // 刪除 APS1002 資料
    deleteFIN21010(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/deleteFIN21010`, body);
    }
}
