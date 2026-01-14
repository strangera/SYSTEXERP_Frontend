import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryRequest, BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

export interface QueryTLS2F030Request extends BaseQueryRequest {
  sam_yyymm: string | null;
  money_type: string | null;
  floor_no: string[];
}

export interface QueryTLS2F030Response {
  tlt_no: string;
  tlt_name: string;
  sam_yyymm: string;
  money_type_desc: string;
  sam_termno: number;
  sam_ap_namt: number;
  sam_ap_tax: number;
  sam_ap_amt: number;
  balance: number;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class Tls2f030Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2F030(params: QueryTLS2F030Request): Observable<BaseQueryResponse<QueryTLS2F030Response>> {
    return this.http.post<BaseQueryResponse<QueryTLS2F030Response>>(`${this.apiUrl}/queryTLS2F030`, params);
  }
}
