import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin54025Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢傳票清單 (queryFIN54025 傳票查詢報表) */
  queryFIN54025(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN54025`, data);
  }
  updateFIN54025(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN54025`, data);
  }
}
