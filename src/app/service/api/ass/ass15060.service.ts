import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class Ass15060Service {
  // 財產變更記錄查詢
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  // 查詢資產維護作業
  queryASS15060(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryASS15060`, body);
  }

  // 匯出移轉交接明細Excel
  exportExcelASS15060(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelASS15060`, body, { responseType: 'blob' });
  }
}
