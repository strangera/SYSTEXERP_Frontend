import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class TLS5000Service {
  // API 主網址會被自動加上環境變數前綴
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  //自營大分類
  // 查詢 51010
  queryTLS51010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51010`, data).pipe(
      tap((data) => console.debug('TLS5000 queryTLS51010 response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  //新增 TLS51010
  insertTLS51010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51010`, data).pipe(
      tap((data) => console.debug('TLS5000 insertTLS51010 response', data)),
    );
  }


  //修改 TLS51010
  updateTLS51010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51010`, data).pipe(
      tap((data) => console.debug('TLS5000 updateTLS51010 response', data)),
    );
  }

  //刪除 TLS51010
  deleteTLS51010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51010`, data).pipe(
      tap((data) => console.debug('TLS5000 deletePOS2003 response', data)),
    );
  }

  //中分類
  // 查詢 TLS51020
  queryTLS51020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51020`, data).pipe(
      tap((data) => console.debug('TLS5000 queryTLS51020 response', data)),
    );
  }
  //新增 TLS51020
  insertTLS51020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51020`, data).pipe(
      tap((data) => console.debug('TLS5000 insertTLS51020 response', data)),
    );
  }


  //修改 POS20031
  updateTLS51020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51020`, data).pipe(
      tap((data) => console.debug('TLS5000 updateTLS51020 response', data)),
    );
  }

  //刪除 TLS51020
  deleteTLS51020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51020`, data).pipe(
      tap((data) => console.debug('TLS5000 deletePOS20031 response', data)),
    );
  }
  //小分類
  // 查詢 POS20032
  queryTLS51030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51030`, data).pipe(
      tap((data) => console.debug('TLS5000 queryTLS51030 response', data)),
    );
  }
  //新增 POS20032
  insertTLS51030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51030`, data).pipe(
      tap((data) => console.debug('TLS5000 insertTLS51030 response', data)),
    );
  }


  //修改 TLS51030
  updateTLS51030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51030`, data).pipe(
      tap((data) => console.debug('TLS5000 updateTLS51030 response', data)),
    );
  }

  //刪除 POS20032
  deleteTLS51030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51030`, data).pipe(
      tap((data) => console.debug('TLS5000 deleteTLS51030 response', data)),
    );
  }
}
