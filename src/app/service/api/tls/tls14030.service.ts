import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// 保證票
export interface Garantee_Ticket {
  "id": number,
  "talent_id": number,
  "tlt_no": string,
  "tlt_name": string,
  "VEN_No": string,
  "VEN_Name": string,
  "ticket_type": string,
  "ticket_no": string,
  "ticket_kind": string,
  "ticket_amount": number,
  "expiry_date": string,
  "get_ticket_status": string,
  "get_date": string,
  "return_date": string,
  "close_date": string,
  "ticket_remarks": string,
  "remark": string,
  "CRT_Date": string,
  "CRT_USR_No": string,
  "CRT_USR_Name": string,
  "UPD_Date": string,
  "UPD_USR_No": string,
  "UPD_USR_Name": string,

  "CanDel": boolean //能否刪除(僅顯示)
}
@Injectable({
  providedIn: 'root'
})
export class Tls14030Service {
  // 保證票 Garantee_Ticket
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';
  constructor(private http: HttpClient) { }

  // 查詢 Garantee_Ticket 資料表
  queryTLS14030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS14030`, body);
  }
  // 新增 Garantee_Ticket 資料表
  insertTLS14030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS14030`, body);
  }

  // 更新 Garantee_Ticket 資料表
  updateTLS14030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS14030`, body);
  }

  // 刪除 Garantee_Ticket 資料表
  deleteTLS14030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS14030`, body);
  }

  // 匯出 Garantee_Ticket 資料表
  exportTLS14030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportTLS14030`, body);
  }

  // 查詢 TLTTalent 資料表
  getTLTTALENT(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getTLTTALENT`, body);
  }

  // 查詢 位置 下拉
  queryPOS2002_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2002_DropDownList`, body);
  }

  //查詢 區域 下拉
  querySYS3A00_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3A00_DropDownList`, body);
  }

  //查詢 樓層 下拉
  querySYS3900_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3900_DropDownList`, body);
  }

  //查詢 大分類 下拉
  queryTLTBUSTYPE_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`, body);
  }

  //查詢 組織代碼 下拉
  querySYS3100_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS3100_DropDownList`, body);
  }

  //查詢 專櫃主檔 編號
  queryTLTTALENT_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`, body);
  }

  //查詢 專櫃主檔 下拉 (會變更對應的狀態並寫入欄位)
  queryTLTTALENT_Status_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_Status_DropDownList`, body);
  }

  //查詢 專櫃主檔 編號(新版，含分頁，路由在 TLS14030Controller)
  queryTalentDropDown(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTalentDropDown`, body);
  }
}
