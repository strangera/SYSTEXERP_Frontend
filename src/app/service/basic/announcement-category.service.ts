import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AnnouncementCategoryService {
  apiUrl: string = environment.ApiUrl;
  title: string = '公告類別';
  options: any[] = [
    { value: '1', label: '一般公告' },
    { value: '2', label: '緊急公告' },
    { value: '3', label: '自動公告' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) { }

  Pub_TypeOptions(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) =>
        this.errorHandler.handleError(error),
      ),
    );
  }
}
