import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin21030Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/APS1000`;

  constructor(private http: HttpClient) {}

  // 查詢 FIN21030 (POS2013 資料表)
  queryFIN21030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN21030`, data);
  }

  // 更新 FIN21030 (POS2013 資料表)
  updateFIN21030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN21030`, data);
  }
}
