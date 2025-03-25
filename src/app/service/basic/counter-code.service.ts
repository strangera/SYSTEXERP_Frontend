import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CounterCodeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '專櫃代碼';
  options: any[] = [
    { value: 1, label: '小騎士' },
    { value: 2, label: '霹靂布袋戲' },
    { value: 3, label: '小星星義大利麵' },
    { value: 4, label: '集品蝦仁飯' },
    { value: 5, label: '名湘園蔬食' },
    { value: 6, label: '南洋美食' },
    { value: 7, label: '斑鳩的窩' },
    { value: 8, label: 'CoCo 都可' },
    { value: 9, label: '翰林茶棧' },
    { value: 10, label: '集雅社' },
    { value: 11, label: 'Fuji按摩椅' },
    { value: 12, label: '富士按摩椅' },
    { value: 13, label: 'tokuyo' },
    { value: 14, label: 'PANASONIC 淨水器' },
    { value: 15, label: 'DAY&DAY' },
    { value: 16, label: 'HOMEWORKING' },
    { value: 17, label: '義廚寶' },
    { value: 18, label: '慎康' },
    { value: 19, label: 'HENGSTYLE 健康館' },
    { value: 20, label: 'dyson' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getCounterCodes(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getCounterCodeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createCounterCode(counterCode: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, counterCode).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateCounterCode(id: string, counterCode: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, counterCode).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
