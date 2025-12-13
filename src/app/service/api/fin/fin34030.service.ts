import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Fin34030Request {
  PartyNoList: string[];
  DocDateFrom: string | null;
  DocDateTo: string | null;
  PayDateFrom: string | null;
  PayDateTo: string | null;
  AdjDateFrom: string | null;
  AdjDateTo: string | null;
  ShowAPAmount: string;
  ShowZeroBalance: string;
  OnlyTLT: string;
  PageSize?: number;
  PageIndex?: number;
  SortBy?: { field: string; order: number }[];
}

export interface Fin34030Response {
  PartyNo: string;
  PartyName: string;
  SystemName: string;
  RP_Flag: string;
  ARAP_DocNo: string;
  VoucherNo: string;
  AccNo: string;
  AccName: string;
  DocDate: string;
  DueDate: string;
  DocAmount: number;
  PayAmount: number;
  AdjAmount: number;
  BalanceAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class Fin34030Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) { }

  queryFIN34030(data: Fin34030Request): Observable<ApiResponse<Fin34030Response[]>> {
    return this.http.post<ApiResponse<Fin34030Response[]>>(`${this.apiUrl}/queryFIN34030`, data);
  }

  exportFIN34030PDF(
    body: Fin34030Request
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportFIN34030PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
