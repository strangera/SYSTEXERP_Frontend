// 零用金拋轉作業 (FIN72030) API Service

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../shared/utils/rxjs-operators/validate-api-response';
import {
  FIN72030QueryRequest,
  FIN72030QueryResult,
  FIN72030PostingRequest,
  FIN72030PostingResult,
  PCS_RqstNoDropdownItem,
} from '../../../shared/models/fin/fin72030.model';

@Injectable({ providedIn: 'root' })
export class Fin72030Service {
  // 查詢 / 拋轉 endpoint 位於 /FIN70000/FIN70000，下拉位於 /FIN0000/FIN70000
  private readonly apiUrl = environment.ApiUrl + '/FIN70000/FIN70000';
  private readonly dropdownUrl = environment.ApiUrl + '/FIN0000/FIN70000';

  constructor(private http: HttpClient) {}

  queryFIN72030(payload: FIN72030QueryRequest): Observable<ApiResponse<FIN72030QueryResult>> {
    return this.http.post<ApiResponse<FIN72030QueryResult>>(
      `${this.apiUrl}/queryFIN72030`,
      payload
    );
  }

  postingFIN72030(payload: FIN72030PostingRequest): Observable<ApiResponse<FIN72030PostingResult>> {
    return this.http.post<ApiResponse<FIN72030PostingResult>>(
      `${this.apiUrl}/postingFIN72030`,
      payload
    );
  }

  getPCS_RqstNoDropDownList(): Observable<ApiResponse<PCS_RqstNoDropdownItem[]>> {
    return this.http.post<ApiResponse<PCS_RqstNoDropdownItem[]>>(
      `${this.dropdownUrl}/POS2064MPCS_RqstNoDropDownList`,
      {}
    );
  }
}
