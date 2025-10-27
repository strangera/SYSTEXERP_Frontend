import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FIN15100Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/FIN15000`;

  constructor(private http: HttpClient) {}

  QueryFIN15100(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15100`, body);
  }

  /** 取得報表產出 URL */
  PrintFIN15110(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/printFIN15110`, body);
  }

  /** 直接用後端 URL 下載檔案 */
  downloadFile(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }
}
