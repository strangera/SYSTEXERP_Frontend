import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Tls2f010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }
  queryTLS2F010(params: any): Observable<any> {
    // Defensive: ensure DEC_YM is at most 6 digits (YYYYMM). Accept YYYYMMDD and trim.
    try {
      if (params && params.DEC_YM !== undefined && params.DEC_YM !== null) {
        const s = String(params.DEC_YM).trim();
        const m = s.match(/^(\d{6})/);
        params.DEC_YM = m ? m[1] : '';
      }
    } catch (e) {
      // ignore
    }
    return this.http.post<any>(`${this.apiUrl}/QueryTLS2F010`, params);
  }
  queryTLS2F010_TLT_No(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryTLS2F010_TLT_No`, params);
  }
  queryTLS2F010InsertData(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryTLS2F010InsertData`, params);
  }
  insertTLS2F010(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/InsertTLS2F010`, params);
  }
  updateTLS2F010(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UpdateTLS2F010`, params);
  }
  deleteTLS2F010(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/DeleteTLS2F010`, params);
  }
  uploadTLS2F010(params: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uploadTLS2F010`, params);
  }
  downloadTLS2F010Template(): Observable<ExportFileResponse> {
    return this.http.get(`${this.apiUrl}/DownloadTLS2F010Template`, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  exportTLS2F010(params: any): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/ExportTLS2F010`, params, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  exportTLS2F010PDF(params: any): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/ExportTLS2F010PDF`, params, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
