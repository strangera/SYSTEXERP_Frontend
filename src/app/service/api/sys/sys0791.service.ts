import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QuerySYS0791Request extends ApiRequest {
  DateS?: string | null;
  DateE?: string | null;
  Type?: number | null;
  UserNo?: string | null;
  RoleNo?: string | null;
  OrgId?: string | null;
  Prog1?: string | null;
  Prog2?: string | null;
  Prog3?: string | null;
}

// 欄位完全對齊後端原始欄位名稱
export interface SYS0791QueryData {
  ID?: number;
  UserNo?: string;
  UserName?: string;
  org_id?: string;
  Org_Name?: string;
  prog_no1?: string;
  prog_name1?: string;
  prog_no2?: string;
  prog_name2?: string;
  prog_no3?: string;
  prog_name3?: string;
  usetimes?: number;
  userate?: string;
  orgtimes?: number;
  orgrate?: string;
}
export interface ProgItem {
  prog_no: string;
  prog_name: string;
}

export interface GetProgRequest {
  Type: number;
  ProgNo?: string | null;
}

@Injectable({ providedIn: 'root' })
export class Sys0791Service {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.ApiUrl}/SYS0000/BAS1000`;

  querySYS0791(body: QuerySYS0791Request): Observable<ApiResponse<SYS0791QueryData[]>> {
    return this.http.post<ApiResponse<SYS0791QueryData[]>>(`${this.apiUrl}/querySYS0791`, body);
  }

  getProgList(body: GetProgRequest): Observable<ApiResponse<ProgItem[]>> {
    return this.http.post<ApiResponse<ProgItem[]>>(`${this.apiUrl}/getProgListSYS0791`, body);
  }
}
