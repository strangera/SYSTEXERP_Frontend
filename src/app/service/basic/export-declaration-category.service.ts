import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportDeclarationCategoryService {
  apiUrl: string = environment.ApiUrl;
  title: string = '出口報單類別';
  options: any[] = [
    { value: 1, label: '國內廠售與保稅廠原料' },
    { value: 2, label: '保稅廠原料與他保稅區再加工出口' },
    { value: 3, label: '保稅廠原料復出口' },
    { value: 4, label: '科學園區成品出口' },
    { value: 5, label: '出口快遞文件(簡易申報單)' },
    { value: 6, label: '出口低價快遞貨物(簡易申報單)' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getExportDeclarationCategory(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getExportDeclarationCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createExportDeclarationCategory(floor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, floor).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateExportDeclarationCategory(id: number, floor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, floor).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
