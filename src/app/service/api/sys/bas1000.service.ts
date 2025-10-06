import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { catchError, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Bas1000Service {
  apiUrl: string = `${environment.ApiUrl}/SYS0000/BAS1000`;
  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }


  //4.1.1基本資料維護作業
  //大分類-查詢
  querySYSB800(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYSB800`, data).pipe(
      tap((data) => console.debug('querySYSB800 response', data)),
    );
  }

  //大分類-新增
  insertSYSB800(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYSB800`, data).pipe(
      tap((data) => console.debug('insertSYSB800 response', data)),
    );
  }


  //大分類-修改
  updateSYSB800(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYSB800`, data).pipe(
      tap((data) => console.debug('updateSYSB800 response', data)),
    );
  }

  //大分類-刪除
  deleteSYSB800(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteSYSB800`, data).pipe(
      tap((data) => console.debug('deleteSYSB800 response', data)),
    );
  }

  // 中分類-查詢
  querySYSB900(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYSB900`, data).pipe(
      tap((data) => console.debug('querySYSB900 response', data)),
    );
  }

  //中分類-新增
  insertSYSB900(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYSB900`, data).pipe(
      tap((data) => console.debug('insertSYSB900 response', data)),
    );
  }


  //中分類-修改
  updateSYSB900(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYSB900`, data).pipe(
      tap((data) => console.debug('updateSYSB900 response', data)),
    );
  }

  //中分類-刪除
  deleteSYSB900(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteSYSB900`, data).pipe(
      tap((data) => console.debug('deleteSYSB900 response', data)),
    );
  }

  // 小分類-查詢
  querySYSB920(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/querySYSB920`, data).pipe(
      tap((data) => console.debug('querySYSB920 response', data)),
    );
  }

  //小分類-新增
  insertSYSB920(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertSYSB920`, data).pipe(
      tap((data) => console.debug('insertSYSB920 response', data)),
    );
  }


  //小分類-修改
  updateSYSB920(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateSYSB920`, data).pipe(
      tap((data) => console.debug('updateSYSB920 response', data)),
    );
  }

  //小分類-刪除
  deleteSYSB920(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteSYSB920`, data).pipe(
      tap((data) => console.debug('deleteSYSB920 response', data)),
    );
  }
}
