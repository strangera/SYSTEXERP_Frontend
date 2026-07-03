/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ExportFileResponse = HttpResponse<Blob>;

export interface ReprintTLS2H010Item {
  GuiNo: string;
  SamYyyymm: string;
  TltNo: string;
}

export interface AutoMailTLS2H010Item extends ReprintTLS2H010Item {
  VEN_Name?: string;
  email?: string;
}

export interface AutoMailTLS2H010Request {
  SMTP_No: string;
  selectList: AutoMailTLS2H010Item[];
}

@Injectable({
  providedIn: 'root'
})
export class Tls2h010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2H010(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2H010`, params);
  }
  generateTLS2H010(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generateTLS2H010`, params);
  }
  RePrintTLS2H010(params: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/RePrintTLS2H010`, params, { observe: 'response', responseType: 'blob' }) as Observable<HttpResponse<Blob>>;
  }
  autoMailTLS2H010(data: AutoMailTLS2H010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/autoMailTLS2H010`, data);
  }
}
