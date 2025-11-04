import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin54020Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;

  constructor(private http: HttpClient) {}

  /** 查詢傳票清單 (FIN54020 傳票查詢報表) */
  queryFIN54020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN54020`, data);
  }
}
