import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FIN15110Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) { }

  QueryFIN15110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15110`, data);
  }

  printFIN15110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/printFIN15110`, data);
  }
/** 下載檔案（第二段打 blob） */
  downloadFile(url: string): Observable<Blob> {
    const token = localStorage.getItem('token');
    return this.http.get(url, {
      headers: { Authorization: `Bearer ${token || ''}` },
      responseType: 'blob',
      withCredentials: false,
    });
  }
}
