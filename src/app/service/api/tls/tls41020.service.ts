import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

export interface QueryTLS41020Request {
  ECR_No?: string[];
  EDC_BegDateStart?: Date;
  EDC_BegDateEnd?: Date;
  EDC_EndDateStart?: Date;
  EDC_EndDateEnd?: Date;
  EDC_Status1?: string;
  EDC_IP1?: string;
  EDC_TmID1?: string;
  // ...其餘欄位以此類推
  ECR_TLT_No?: string;
  building_no?: string;
  FLOOR_NO?: string[];
  AREA_NO?: string[];
  pageNumber?: number;
  pageSize?: number;
}

export interface InsertTLS41020Request {
  SYS_StoreNo: string;
  ECR_No: string;
  EDC_BegDate: Date;
  EDC_EndDate: Date;
  EDC_Status1: string;
  EDC_IP1?: string;
  EDC_TmID1?: string;
  EDC_Status2?: string;
  EDC_IP2?: string;
  EDC_TmID2?: string;
  EDC_Status3?: string;
  EDC_IP3?: string;
  EDC_TmID3?: string;
  EDC_Status4?: string;
  EDC_IP4?: string;
  EDC_TmID4?: string;
  EDC_Status5?: string;
  EDC_IP5?: string;
  EDC_TmID5?: string;
}

export interface UpdateTLS41020Request extends InsertTLS41020Request {
  id: number;
}

export interface DeleteTLS41020Request {
  idList: number[];
}

// --- 回傳介面 (Response) ---

export interface TLS41020Data extends InsertTLS41020Request {
  id: number;
  EDC_Status1Name?: string;
  EDC_Status2Name?: string;
  EDC_Status3Name?: string;
  EDC_Status4Name?: string;
  EDC_Status5Name?: string;
  ECR_Name?: string;
  ECR_TLT_No?: string;
  ECR_TLT_Name?: string;
  ECR_LocNo?: string;
  LOCATION_Name?: string;
  CRT_Date?: Date;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: Date;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}
@Injectable({ providedIn: 'root' })
export class TLS41020Service {
  private API_URL = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) { }

  queryTLS41020(payload: QueryTLS41020Request): Observable<ApiResponse<TLS41020Data[]>> {
    return this.http.post<ApiResponse<TLS41020Data[]>>(`${this.API_URL}/queryTLS41020`, payload);
  }

  insertTLS41020(payload: InsertTLS41020Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.API_URL}/insertTLS41020`, payload);
  }

  updateTLS41020(payload: UpdateTLS41020Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.API_URL}/updateTLS41020`, payload);
  }

  deleteTLS41020(body: DeleteTLS41020Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.API_URL}/deleteTLS41020`, body);
  }
}
