// src/app/service/api/tls/tls22020.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface TLS22020Response {
  Status: string;
  Data: TLS22020Item[];
  Error?: {
    Code: string;
    Message: string;
    Details: string;
  };
  Meta?: {
    Timestamp: string;
    RequestId: string;
  };
  Message?: string;
  TotalCount: number;
  TotalPage: number;
}

export interface TLS22020Item {
  ECR_No: string;
  tlt_no: string;
  tlt_name: string;
  pay_NoDataList: PayNoData[];
}

export interface PayNoData {
  Pay_No: string;
  Pay_Name: string;
  TXN_PayAmt: number;
  SLE_PayAmt: number;
  Diff_PayAmt: number;
}

@Injectable({
  providedIn: 'root'
})
export class TLS22020Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS22020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22020`, data);
  }
  exportTLS22020(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS22020`, data,
      {
        responseType: 'blob',
        observe: 'response'
      }
    );
  }
}
