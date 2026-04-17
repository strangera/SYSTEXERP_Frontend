import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from './../../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})

@Injectable({
  providedIn: 'root'
})
export class Ass17050Service {
  // 使用統計月報表
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  // 查詢 使用統計月報表
  queryASS17050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryASS17050`, body);
  }

  // 匯出 使用統計月報表 PDF
  exportPDFASS17050(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFASS17050`, body, { responseType: 'blob' });
  }
}
