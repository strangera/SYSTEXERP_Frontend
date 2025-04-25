import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TLS5000Service {
  // API 主網址會被自動加上環境變數前綴
  apiUrl: string = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  //自營大分類
  // 查詢 POS2003
  queryPOS2003(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryPOS2003`, data).pipe(
      tap((data) => console.debug('TLS5000 queryPOS2003 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  //新增 POS2003
  insertPOS2003(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertPOS2003`, data).pipe(
      tap((data) => console.debug('TLS5000 insertPOS2003 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }


  //修改 POS20031
  updatePOS2003(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updatePOS2003`, data).pipe(
      tap((data) => console.debug('TLS5000 updatePOS2003 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  //刪除 POS2003
  deletePOS2003(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deletePOS2003`, data).pipe(
      tap((data) => console.debug('TLS5000 deletePOS2003 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  //中分類
  // 查詢 POS20031
  queryPOS20031(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryPOS20031`, data).pipe(
      tap((data) => console.debug('TLS5000 queryPOS20031 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
  //新增 POS20031
  insertPOS20031(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertPOS20031`, data).pipe(
      tap((data) => console.debug('TLS5000 insertPOS20031 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }


  //修改 POS20031
  updatePOS20031(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updatePOS20031`, data).pipe(
      tap((data) => console.debug('TLS5000 updatePOS20031 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  //刪除 POS20031
  deletePOS20031(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deletePOS20031`, data).pipe(
      tap((data) => console.debug('TLS5000 deletePOS20031 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
