import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS28030Request {
  TXN_Date_S?: string;
  TXN_Date_E?: string;
  MOD_Date_S?: string;
  MOD_Date_E?: string;
  ECR_No?: string;
  TLT_No?: string;
  ECR_Group?: string;
  ECR_LocNo?: string;
  ECR_Type?: string;
  Check_Status?: string;
  IsVirtualOnly: boolean;
}

export interface ITLS28030Data {
  ID: number;
  SYS_StoreNo: string;
  TXN_Date: string;
  ECR_No: string;
  TLT_No: string;
  BOOK_PayAmt: number;
  ACT_PayAmt: number;
  OVER_PayAmt: number;
  Check_Status: string;
  MOD_Date: string;
}

@Injectable({ providedIn: 'root' })
export class TLS28030Service {
  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  queryTLS28030(params: QueryTLS28030Request): Observable<ApiResponse<ITLS28030Data[]>> {
    return this.http.post<ApiResponse<ITLS28030Data[]>>(`${this.apiUrl}/queryTLS28030`, params);
  }
}
