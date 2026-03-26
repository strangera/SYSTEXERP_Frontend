import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Tls51110Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  queryTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51110`, data);
  }

  insertTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51110`, data);
  }

  updateTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51110`, data);
  }

  deleteTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51110`, data);
  }
  approveTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/approveTLS51110`, data);
  }
  /** 匯入 Excel 檔 */
  uploadTLS51110(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uploadTLS51110`, formData);
  }


  /** 下載範例檔案 */
  downloadTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/downloadTLS51110Template`, {
      responseType: 'blob',
    });
  }
}
