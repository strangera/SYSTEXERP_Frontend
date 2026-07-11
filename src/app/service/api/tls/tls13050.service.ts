import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryTLS13050Request extends ApiRequest {
  tlt_floorList?: string[];
  tlt_bdate_start?: string;
  tlt_bdate_end?: string;
  tlt_edate_start?: string;
  tlt_edate_end?: string;
  cag_bdate_start?: string;
  cag_bdate_end?: string;
  cag_edate_start?: string;
  cag_edate_end?: string;
  check_day_start?: number | null;
  check_day_end?: number | null;
  org_idList?: string[];
  Building_No?: string[];
  perf_edate?: string;
}

export interface TLS13050QueryItem {
  apply_no: string;
  talent_id: string;
  tlt_building: string;
  FloorText: string;
  org_name: string;
  tlt_no: string;
  LocationText: string;
  tlt_name: string;
  tlt_bdate: string;
  tlt_edate: string;
  cag_bdate: string;
  cag_edate: string;
  sad_sale_amt_sum: number;
  limit_amt: number;
  accumulated_diff: number;
  limit_charge_rate: number;
  limit_charge_amt: number;
  finishedrate: number;
  check_day: number;
}

@Injectable({
  providedIn: 'root'
})
export class Tls13050Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(
    private http: HttpClient,
  ) { }

  queryTLS13050(data: QueryTLS13050Request): Observable<ApiResponse<TLS13050QueryItem[]>> {
    return this.http.post<ApiResponse<TLS13050QueryItem[]>>(`${this.apiUrl}/queryTLS13050`, data);
  }
}
