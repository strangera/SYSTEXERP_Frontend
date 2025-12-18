import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Fin29010Request {
  ACP_YYYYMM_Start: string,
  ACP_YYYYMM_End: string,
  VEN_No: string,
  ShowIfReserveAmtZero: boolean
}

export interface Fin29010Response {
  data: Fin29010Data[],
  total: Fin29010Data;
}

export interface Fin29010Data {
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

  queryFIN29010(data: Fin29010Request): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryFIN29010`, data).pipe(
      map(response => {
        return {
          ...response,
          Data: response.Data.data,
          footerData: response.Data.total
        };
      })
    );
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
