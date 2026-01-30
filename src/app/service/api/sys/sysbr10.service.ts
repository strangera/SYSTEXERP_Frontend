import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

/** 查詢主表 Request (POS5101) */
export interface QuerySYSBR10Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string;
  Offset?: number;
  SortBy?: { field: string; order: number }[];
  Pub_StartDate_Start?: string | Date;
  Pub_StartDate_End?: string | Date;
  Pub_EndDate_Start?: string | Date;
  Pub_EndDate_End?: string | Date;
  Role_No?: string[];
  User_No?: string[];
  Org_ID?: string[];
  Pub_Type?: string[];
  pub_enable?: string;
  Pub_Event?: string;
}

/** 查詢主表 Response (POS5101) */
export interface QuerySYSBR10Response {
  id: number;
  Pub_StartDate: string;
  Pub_EndDate: string;
  pub_enable: string;
  Pub_Type: string;
  Pub_Event: string;
  Pub_Description: string;
}

/** 查詢明細 Response (POS5102) */
export interface QuerySYSBR10DetailResponse {
  id: number;
  pos5101_id: number;
  SEQ_No: number;
  User_No: string;
  User_Name: string;
  Org_ID: string;
  Org_Name: string;
  Role_No: string;
  Role_Name: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;

  _dataStatus?: 'original' | 'new' | 'modified' | 'deleted';
}

/** 新增/更新 Request */
export interface MaintainSYSBR10Request {
  id?: number; // 更新時必填
  Pub_StartDate: string | Date;
  Pub_EndDate: string | Date;
  pub_enable?: string;
  Pub_Type: string;
  Pub_Event: string;
  Pub_Description: string;
  DetailList: {
    id?: number;
    User_No?: string;
    Org_ID?: string;
    Role_No?: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class SYSBR10Service {
  private apiUrl = `${environment.ApiUrl}/SYS0000/BAS1000`;

  constructor(private http: HttpClient) { }

  /** 1. 查詢佈告欄主表資料 (POS5101) */
  querySYSBR10(body: QuerySYSBR10Request): Observable<ApiResponse<QuerySYSBR10Response[]>> {
    return this.http.post<ApiResponse<QuerySYSBR10Response[]>>(
      `${this.apiUrl}/querySYSBR10`,
      body
    );
  }

  /** 2. 查詢佈告欄明細資料 (POS5102) */
  querySYSBR10Detail(body: { pos5101_id: number }): Observable<ApiResponse<QuerySYSBR10DetailResponse[]>> {
    return this.http.post<ApiResponse<QuerySYSBR10DetailResponse[]>>(
      `${this.apiUrl}/querySYSBR10_Detail`,
      body
    );
  }

  /** 3. 新增佈告欄資料 */
  insertSYSBR10(body: MaintainSYSBR10Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/insertSYSBR10`,
      body
    );
  }

  /** 4. 更新佈告欄資料 */
  updateSYSBR10(body: MaintainSYSBR10Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateSYSBR10`,
      body
    );
  }

  /** 5. 更新啟用狀態 (pub_enable) */
  updateSYSBR10PubEable(body: { id: number; pub_enable: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/updateSYSBR10_PubEable`,
      body
    );
  }

  /** 6. 刪除佈告欄資料 */
  deleteSYSBR10(body: { idList: number[] }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/deleteSYSBR10`,
      body
    );
  }
}
