import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

export interface ContractItem {
  id: string;
  talent_id: string;            // 合約id
  contract_no: string;          // 合約編號
  tlt_no: string;               // 專櫃編號
  tlt_name: string;             // 專櫃名稱
  // ven_no: string;            // 廠商編號 (DB漏開欄位)
  ven_uniform: string;          // 廠商統編
  VEN_Name: string;             // 廠商名稱
  contract_subno: number;       // 版本編號
  tlt_bdate: string;            // 契約起始日
  tlt_edate: string;            // 契約截止日
  tlt_contract_bdate: string;   // 營運起始日
  tlt_contract_edate: string;   // 營運截止日
  bus_type: string;             // 大分類代碼
  bus_type_name: string;        // 大分類名稱
  deco_type: string;            // 裝潢方式
  money_type: string;           // 結帳方式
  check_type: string;           // 對帳方式
  tlt_term_type: string;        // 抽成別
  store_way: string;            // 配合方式
  rece_yn: string;              // 開立業主發票
  pos_yn: string;               // 使用業主收銀機
  cash_yn: string;              // 業主收現
  contract_type: string;        // 合約種類
  approve_status: string;       // 合約狀態
  tlt_openflag: string;         // 營運狀態
}

export interface DialogItem {
  id: string;
  talent_id: string;
  contract_no: string;
  contract_subno: string;
  contract_version: string;
  contract_filename: string;
}

@Injectable({
  providedIn: 'root',
})
export class TLS14020Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  queryTLS14020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS14020`, data).pipe(
      tap(response => console.log('查詢結果:', response)),
    );
  }
  exportTLS14020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportTLS14020`, data).pipe(
      tap(response => console.log('查詢結果:', response)),
    );
  }
  queryContractLog(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryContractLog`, data).pipe(
      tap(response => console.log('查詢結果:', response)),
    );
  }
  downloadContractLog(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/downloadContractLog`, data).pipe(
      tap(response => console.log('查詢結果:', response)),
    );
  }
  downloadRule(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/downloadRule`, {}).pipe(
      tap(response => console.log('查詢結果:', response)),
    );
  }
}
