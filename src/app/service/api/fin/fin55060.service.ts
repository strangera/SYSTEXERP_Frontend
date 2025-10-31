/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN55060Payload {
  TXN_BDATE: string;
  TXN_EDATE: string;
  org_idList: string[];
  ProjectNoList: string[];
  AccNoList: string[];
  DetailNoList: string[];
}

export interface FIN55060Data {
  AccNo: string;
  AccCName: string;
  DetailNo: string;
  ORG_ID: string;
  Org_Name: string;
  ProjectNo: string;
  Debit_Amt: number;
  Credit_Amt: number;
  OpeningBal: number;
}

@Injectable({ providedIn: 'root' })
export class FIN55060Service {
  private baseApi = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) {}

  queryFIN55060(body: QueryFIN55060Payload): Observable<any> {
    const url = `${this.baseApi}/queryFIN55060`;
    return this.http.post<any>(url, body);
  }
}
