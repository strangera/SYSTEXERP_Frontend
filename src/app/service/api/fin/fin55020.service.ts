import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN55020Request {
  VOUDATE_Start: string,
  VOUDATE_End: string,
  ORG_ID: string,
  ProjectNo: string,
  vouno: string,
  DetailNo: string,
  VOUCHER_KIND: string,
  PostFlag: string
}

export interface FIN55020Data {
  VouDate: string,
  VouNo: string,
  PostFlag: string,
  AccCName: string,
  ORG_ID: string,
  Org_Name: string,
  ProjectNo: string,
  NoteDesc: string,
  D_AMT: number,
  C_AMT: number,
  PTA: string
}

@Injectable({
  providedIn: 'root'
})
export class Fin55020Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(
    private http: HttpClient
  ) { }

  queryFIN55020(data: QueryFIN55020Request): Observable<ApiResponse<FIN55020Data[]>> {
    return this.http.post<ApiResponse<FIN55020Data[]>>(`${this.apiUrl}/queryFIN55020`, data).pipe(
      map(response => ({
        ...response,
        Data: response.Data.map((item) => ({
          ...item,
          D_AMT: item.D_AMT ?? null,
          C_AMT: item.C_AMT ?? null,
        })),

      }))
    );
  }
}
