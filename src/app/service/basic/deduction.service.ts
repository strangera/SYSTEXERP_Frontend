import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeductionService {
  apiUrl: string = environment.ApiUrl;
  title: string = '扣款類別';

  options: any[] = [
    { value: 'A', label: 'A - 一次扣款' },
    { value: 'B', label: 'B - 每月扣款' },
    { value: 'C', label: 'C - 平均分攤' },
    { value: 'D', label: 'D - 比率分攤' },
    { value: 'E', label: 'E - 活動扣款' },
    { value: 'Z', label: 'Z - 其他扣款' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  getDeductionCategories(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getDeductionCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createDeductionCategory(deductionCategory: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, deductionCategory).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateDeductionCategory(id: number, deductionCategory: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, deductionCategory).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  // ✅ 新增這段：查詢扣款類別對應的扣款項目(APS1003)
  getAPS1003DropDownList(payload: { cap_typeList: string[] }): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS13030_APS1003_DropDownList`, payload)
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }
}
