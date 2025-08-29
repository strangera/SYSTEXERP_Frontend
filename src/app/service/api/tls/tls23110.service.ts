import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';
// 如果你真的需要在這支檔案裡用到 SortMeta，就從 primeng 直匯：
// import { SortMeta } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class TLS23110Service {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  // 保持寬鬆的 any，避免型別卡住你的開發
  queryTLS23110(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS2000/queryTLS23110`, query)
      .pipe(
        tap(res => console.log('查詢結果:', res)),
        catchError((error) => this.errorHandler.handleError(error))
      );
  }
}
