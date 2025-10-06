import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleCodeService {

  apiUrl: string = environment.ApiUrl;
  roleCodes: any[] = [
    { value: 1, label: '公司人員' },
    { value: 2, label: '專櫃人員' },
    { value: 3, label: '其他' },
    { value: 4, label: '經營企劃部' },
    { value: 5, label: '資材' },
    { value: 6, label: '資材臨時' },
    { value: 7, label: '財務部主管' },
    { value: 8, label: '財務部人員' },
    { value: 9, label: '人資-1' },
    { value: 10, label: '人資-2' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getRoleCodes(): Observable<any[]> {
    return of(this.roleCodes).pipe(
      tap(data => console.debug('get role codes response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getRoleCodeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get role code by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createRoleCode(roleCode: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, roleCode).pipe(
      tap(data => console.debug('post role code response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateRoleCode(id: number, roleCode: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, roleCode).pipe(
      tap(data => console.debug('put role code response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
