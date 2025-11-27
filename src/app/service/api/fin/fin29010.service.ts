import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Fin29010Request {
  ACP_YYYYMM_Start: string,
  ACP_YYYYMM_End: string,
  VEN_No: string,
  ShowIfReserveAmtZero: boolean
}

export interface Fin29010Response {
  VEN_No: string,
  VEN_Name: string,
  ACP_YYYYMM: string,
  acp_termno: string,
  ACP_Amt: number,
  ACP_ReserveAmt: number,
  RET_Amt: number,
  Current_ReserveAmt: number
}

@Injectable({
  providedIn: 'root'
})
export class Fin29010Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/APS1000`;

  constructor(private http: HttpClient) { }

  queryFIN29010(data: Fin29010Request): Observable<ApiResponse<Fin29010Response[]>> {
    return this.http.post<ApiResponse<Fin29010Response[]>>(`${this.apiUrl}/queryFIN29010`, data);
  }

  exportFIN29010PDF(
    body: Fin29010Request
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportFIN29010PDF`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  exportFIN29010Excel(
    body: Fin29010Request
  ): Observable<HttpResponse<Blob>> { // 將回傳類型改為 HttpResponse<Blob>
    return this.http.post(
      `${this.apiUrl}/exportFIN29010Excel`,
      body,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }
}
