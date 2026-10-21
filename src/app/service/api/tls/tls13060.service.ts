import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TLS13060QueryRequest {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  apply_no?: string;
  ven_uniform?: string;
  tlt_no?: string;
  tlt_name?: string;
  location_no?: string;
  tlt_openflagList?: string[];
  tlt_bdate_start?: string;
  tlt_bdate_end?: string;
  tlt_edate_start?: string;
  tlt_edate_end?: string;
  tlt_contract_bdate_start?: string;
  tlt_contract_bdate_end?: string;
  tlt_contract_edate_start?: string;
  tlt_contract_edate_end?: string;
  tlt_term_typeList?: string[];
  paytype?: string;
  rece_yn?: string;
  pos_yn?: string;
  cash_yn?: string;
}

export interface TLS13060ResponseItem {
  upd_date: string;
  tlt_bdate: string;
  tlt_edate: string;
  contract_subno: string;
  building_desc: string;
  tlt_building: string;
  org_id: string;
  org_name: string;
  location_no: string;
  VEN_Name: string;
  tlt_name: string;
  tlt_no: string;
  pos_yn: string;
  rece_yn: string;
  cap_saletype2: string;
  cash_yn: string;
  invoice_type: string;
  pay_no_62: string;
  pay_no_24: string;
  pay_no_25: string;
  pay_no_20: string;
  pay_no_71: string;
  pay_no_72: string;
  pay_no_73: string;
  pay_no_74: string;
  pay_no_75: string;
  pay_no_76: string;
  pay_no_77: string;
  pay_no_78: string;
}

@Injectable({
  providedIn: 'root',
})
export class TLS13060Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000/queryTLS13060`;

  constructor(private http: HttpClient) { }

  queryTLS13060(body: TLS13060QueryRequest): Observable<ApiResponse<TLS13060ResponseItem[]>> {
    return this.http.post<ApiResponse<TLS13060ResponseItem[]>>(this.apiUrl, body);
  }
}
