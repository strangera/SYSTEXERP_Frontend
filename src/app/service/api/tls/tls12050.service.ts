import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QueryTLS12050Request extends BaseQueryRequest {
  pageSize?: number;
  pageIndex?: number;
  building_no?: string;
  FLOOR_NO?: string;
}

export interface TLS12050Detail {
  LOCATION_No: string;
  LOCATION_Status_Desc: string;
  tlt_no: string;
  tlt_name: string;
  ven_no: string;
  VEN_Name: string;
  tlt_bdate: string;
  tlt_edate: string;
  contract_no: string;
  contract_subno: number;
}

export interface TLS12050Summary {
  Idle: number;
  Under_Negotiation: number;
  In_Operation: number;
  Outof_Service: number;
  All_Count: number;
  Image_Url: string;
  Details: TLS12050Detail[];
}

export type QueryTLS12050DetailsResponse = BaseQueryResponse<TLS12050Detail> & {
  Summary?: TLS12050Summary;
};

@Injectable({
  providedIn: 'root',
})
export class TLS12050Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) { }

  queryTLS12050(data: QueryTLS12050Request): Observable<BaseQueryResponse<TLS12050Summary>> {
    return this.http.post<BaseQueryResponse<TLS12050Summary>>(`${this.apiUrl}/queryTLS12050`, data);
  }

  queryTLS12050Details(data: QueryTLS12050Request): Observable<QueryTLS12050DetailsResponse> {
    return this.queryTLS12050(data).pipe(
      map(response => {
        const summary = response.Data?.[0];
        const details = Array.isArray(summary?.Details) ? summary.Details : [];

        return {
          ...response,
          Data: details,
          TotalCount: details.length,
          TotalPage: details.length > 0 ? 1 : 0,
          Summary: summary
        };
      })
    );
  }
}
