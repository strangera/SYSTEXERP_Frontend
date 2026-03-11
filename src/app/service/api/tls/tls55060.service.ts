import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS55060Request extends BaseQueryRequest {
  id?: number;
  SrcSheetTypeList?: string[];
  VouDate_Start?: string;
  VouDate_End?: string;
  PostFlagList?: string[];
  No?: string;
}

export interface TLS55060GLS6001 {
  id: number;
  mid: number;
  CompNo: string;
  VouNo: string;
  VouType: string;
  VouDate: string;
  SrcSheetType: string;
  SrcSheetNo: string;
  PostFlag: string;
  INV_YN: string;
  Remark: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  Trans_Status: string;
  No: string;
  Trans_Status_Name: string;
}

export interface TLS55060GLS6002 {
  id: number;
  mid: number;
  gls6001_id: number;
  SerNo: number;
  AccDC: string;
  AccNo: string;
  AccAmt: number;
  ORG_ID: string;
  DetailNo: string;
  SubDetailNo: string;
  ProjectNo: string;
  NoteDesc: string;
  PTA: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  AccNotes: string;
}

export interface QueryTLS55060RawItem {
  _GLS6001: TLS55060GLS6001;
  _GLS6002List: TLS55060GLS6002[];
  TotalDAmt: number;
  TotalCAmt: number;
}

export type TLS55060QueryItem = TLS55060GLS6001 & {
  _GLS6002List: TLS55060GLS6002[];
  TotalDAmt: number;
  TotalCAmt: number;
};

@Injectable({
  providedIn: 'root'
})
export class TLS55060Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  queryTLS55060(req: QueryTLS55060Request): Observable<BaseQueryResponse<TLS55060QueryItem>> {
    return this.http.post<BaseQueryResponse<QueryTLS55060RawItem>>(`${this.apiUrl}/queryTLS55060`, req).pipe(
      map(response => {
        const data = Array.isArray(response.Data)
          ? response.Data.map(item => ({
            ...item._GLS6001,
            _GLS6002List: this.sortGLS6002(item._GLS6002List),
            TotalDAmt: Number(item.TotalDAmt) || 0,
            TotalCAmt: Number(item.TotalCAmt) || 0
          }))
          : [];

        return {
          ...response,
          Data: data
        };
      })
    );
  }

  private sortGLS6002(list: TLS55060GLS6002[] | null | undefined): TLS55060GLS6002[] {
    if (!Array.isArray(list)) {
      return [];
    }

    return [...list].sort((left, right) => {
      if (left.AccDC !== right.AccDC) {
        return left.AccDC === 'D' ? -1 : 1;
      }

      return (left.AccNo || '').localeCompare(right.AccNo || '');
    });
  }
}
