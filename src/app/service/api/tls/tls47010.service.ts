import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TLS47010Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // ✅ 查詢收銀機資料
 ECROptions(query: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/queryPOS1002_Status_DropDownList`, query).pipe(
    tap(res => console.log('查詢結果:', res)),
    
  );
}

  // ✅ 新增（若有）
  insertTLS47010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TLS0000/TLS4000/insertTLS47010`, data).pipe(
      tap(res => console.log('新增結果:', res)),
      
    );
  }


}
