import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './fin26010.service';

export interface QueryFIN64050Request {
  PageSize?: number;
  PageIndex?: number;
  BackDateFrom?: string;
  BackDateTo?: string;
  ChkNo: string | null;
}

export interface QueryFIN64050Row {
  SEQ_NO: number;
  ID: number;
  CHK_No: string;
  VEN_No: string;
  VEN_Name: string;
  BNK_No: string;
  BNK_Name: string;
  CHK_ExpireDate: string;
  CHK_Amt: number;
  CHK_BNK_No: string;
  CHK_BackDate: string;
  Bounce_Tran_Status: string;
  Bounce_VouNo: string;
  Bounce_Comment: string;
  Bounce_RCV_No: string;
  CHK_Status: string;
  CHK_Status_Name: string;
  IsSelectable: string;
}

export interface Fin64050UpdateRequest {
  IdList: number[];
  BackDate: string;
  CHK_Comment?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Fin64050Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) { }

  queryFIN64050(body: QueryFIN64050Request): Observable<ApiResponse<QueryFIN64050Row[]>> {
    return this.http.post<ApiResponse<QueryFIN64050Row[]>>(`${this.apiUrl}/queryFIN64050`, body);
  }

  updateFIN64050(body: Fin64050UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN64050`, body);
  }
}