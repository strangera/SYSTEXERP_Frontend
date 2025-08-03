import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TLS2A020Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) {}

  // 查詢未審核收銀機台報表資料
  queryTLS2A020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2A020`, data);
  }
}
