import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Sysbp00Request {
  SYS_Type: string,
  SYS_Code: string,
  SYS_Name: string
}

export interface Sysbp00Response {
  SYS_Type: string,
  Details: Sysbp00ResponseDetail[]
}

export interface Sysbp00ResponseDetail {
  ID: number,
  SYS_Code: string,
  SYS_Name: string,
  SYS_Sort: number,
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string,
  _TABLE_KEY: string
}

export interface InsertSysbp00Request {
  SYS_Type: string,
  SYS_Code: string,
  SYS_Name: string,
  SYS_Sort: number
}

export interface UpdateSysbp00Request extends InsertSysbp00Request {
  ID?: number
}

@Injectable({
  providedIn: 'root',
})
export class Sysbp00Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  // 查詢 SYS3900 資料表
  querySYSBP00(body: Sysbp00Request): Observable<ApiResponse<Sysbp00Response[]>> {
    return this.http.post<ApiResponse<Sysbp00Response[]>>(`${this.apiUrl}/querySYSBP00`, body);
  }

  // 新增 SYS3900 資料表
  insertSYSBP00(body: InsertSysbp00Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertSYSBP00`, body);
  }

  // 更新 SYS3900 資料表
  updateSYSBP00(body: UpdateSysbp00Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateSYSBP00`, body);
  }
}
