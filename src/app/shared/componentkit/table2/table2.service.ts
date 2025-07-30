import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Table2Service {
  apiUrl = `${environment.ApiUrl}`;

  constructor(private http: HttpClient) {}

  exportPDF(data: any): Observable<HttpResponse<Blob>> {
    const headers = new HttpHeaders({
      'Accept': 'application/pdf',       // ✅ 向後端表示我要 PDF
      'Content-Type': 'application/json' // ✅ 如果你是傳送 JSON 給後端
    });

    return this.http.post(
      `${this.apiUrl}/exportPDF`,
      data,
      {
        headers,
        responseType: 'blob' as 'json',  // ✅ 強制轉型避免 TS 錯
        observe: 'response'
      }
    ) as Observable<HttpResponse<Blob>>; // ✅ 最終轉型成你要的回傳型別
  }
}
