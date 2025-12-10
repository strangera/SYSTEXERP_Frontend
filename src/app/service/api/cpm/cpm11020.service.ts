import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢服務台位置檔 Request 介面
export interface QueryCPM11020Request extends BaseQueryRequest {
  Device_ids?: string[];    // 設備代號
  Device_Name?: string;    // 設備名稱
}

// 查詢服務台位置檔 Response 資料結構
export interface CPM11020Data {
  ID: number;
  mid: number;
  Device_ID: string;
  Device_Name: string;
  Device_TotQty: string;
  CRT_Date: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_Name: string;
}

// 新增服務台位置檔 Request 介面
export interface InsertCPM11010Request {
  building_no?: string;     // 館別
  FLOOR_NO?: string;        // 營業樓層
  AREA_NO?: string;         // 營業區域
  Service_Name?: string;    // 服務台位置名稱
}

// 修改服務台位置檔 Request 介面
export interface UpdateCPM11010Request {
  ID: number;               // 主鍵ID
  Service_Name?: string;    // 服務台位置名稱
}

// 刪除服務台位置檔 Request 介面
export interface DeleteCPM11010Request {
  idList: number[];         // 要刪除的ID清單
}

@Injectable({
  providedIn: 'root'
})
export class CPM11010Service {

  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // // 查詢
  // queryCPM11010(req: QueryCPM11010Request): Observable<BaseQueryResponse<CPM11010Data>> {
  //   return this.http.post<BaseQueryResponse<CPM11010Data>>(`${this.apiUrl}/queryCPM11010`, req);
  // }

  // 新增
  insertCPM11010(req: InsertCPM11010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertCPM11010`, req);
  }

  // 修改
  updateCPM11010(req: UpdateCPM11010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateCPM11010`, req);
  }

  // 刪除
  deleteCPM11010(req: DeleteCPM11010Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteCPM11010`, req);
  }
}
