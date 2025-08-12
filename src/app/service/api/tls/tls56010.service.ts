import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/** ===== 單筆資料 ===== */
export interface TLS56010Item {
  id: number;
  MID: string;
  SYS_StoreNo: string;
  HOS_No: string;
  PLU_MagNo: string;
  STK_CurrentQty: number;
  PLU_No: string;
  PLU_Name: string;
  PLU_Unit: string;
  PLU_UNITNAME: string;
  PLU_SalePrc: number;
  LOGO_No: string;
  PLU_CreateDate: string | null;
  UNIT_NAME: string;
  LOGO_CH_NAME: string;
  PLULOGOName: string;
  Calc_SafeQty: number;
  SaleQty_30Days: number;
  SaleQty_60Days: number;
  SaleQty_90Days: number;
  Unreceived_Qty: number;
}

/** ===== 回應包裝 ===== */
export interface TLS56010ListResponse {
  Status: string;
  Data: TLS56010Item[];
  Error?: { Code: string; Message: string; Details: string } | null;
  Meta?: { Timestamp: string; RequestId: string } | null;
  Message: string;
  TotalCount: number;
  TotalPage: number;
}


export interface TLS56010QueryRequest {

  SYS_StoreNo?: string;
  HOS_NoList?: string[];
  LOGO_NoList?: string[];
  PLU_MagNo?: string;
  PLU_No?: string;
  PLU_Name?: string;
}



@Injectable({ providedIn: 'root' })
export class TLS56010Service {

  private apiBase = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢商品庫存查詢作業資料 */
  queryTLS56010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiBase}/queryTLS56010`, data);
  }
}
