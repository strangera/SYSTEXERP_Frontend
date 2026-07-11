import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export interface Pos10015 {
  id: number;
  SYS_StoreNo: string;
  SYS_SrvNo: string;
  SYS_SrvIP: string;
  SYS_SrvPort: number;
  SYS_SrvStatus: string;
  SYS_SrvName?: string;
  SYS_SrvUsrID?: string;
  SYS_SrvUsrPwd?: string;
  SYS_SRVDDir?: string;
  SYS_SRVUDir?: string;
  SYS_MyPOSDDir?: string;
  SYS_MyPOSUDir?: string;
  SYS_SRVDDirClt?: string;
  SYS_SRVUDirClt?: string;
  CRT_Date?: string;            // 可用 Date 型別也可以 string，看你從後端拿到的是什麼
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}
@Injectable({
  providedIn: 'root'
})
export class Tls46010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(
    private http: HttpClient,
  ) { }

  // POS10015資料表查詢條件
  queryTLS0000(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS46010`, data);
  }

  //新增POS10015
  insertTLS0000(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS46010`, data);
  }

  // 更新POS10015資料
  updateTLS46010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS46010`, data);
  }

  // 刪除POS10015資料
  deleteTLS46010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS46010`, data);
  }
}
