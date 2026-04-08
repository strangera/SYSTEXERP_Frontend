import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type ExportFileResponse = HttpResponse<Blob>;

@Injectable({
  providedIn: 'root'
})
export class Tls2d010Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D010`, data);
  }
  insertTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2D010`, data);
  }
  deleteTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS2D010`, data);
  }
  updateTLS2D010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2D010`, data);
  }
  /** 匯入 Excel 檔 */
  uploadExcel(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uploadExcel`, formData);
  }
  downloadTLS2D010Template(): Observable<ExportFileResponse> {
    return this.http.post(`${this.apiUrl}/downloadTLS2D010Template`, {}, {
      observe: 'response',
      responseType: 'blob'
    });
  }
  queryMaxClsMonth(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryMaxClsMonth`, {});
  }
}
