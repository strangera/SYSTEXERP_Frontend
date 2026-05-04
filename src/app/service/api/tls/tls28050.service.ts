import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS28050Request {
  TXN_Date_S: string;
  TXN_Date_E: string;
  BAG_TYPE?: string;
  SYS_StoreNo?: string;
  ECR_No?: string;
  TLT_No?: string;
  Status: string;
}

export interface ITLS28050Data {
  RowNo: number;
  TXN_Date: string;
  SYS_StoreNo: string;
  ECR_No: string;
  TLT_No: string;
  BAG_TYPE: string;
  BAG_TYPE_Name: string;
  Get_Status: string;
  Bak_Status: string;
  Status: string; // 綜合狀態文字
  Get_Time: string;
  Bak_Time: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CRT_Date: string;
  UPD_Date: string;
}

@Injectable({ providedIn: 'root' })
export class TLS28050Service {
  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  queryTLS28050(params: QueryTLS28050Request): Observable<ApiResponse<ITLS28050Data[]>> {
    return this.http.post<ApiResponse<ITLS28050Data[]>>(`${this.apiUrl}/queryTLS28050`, params);
  }
}