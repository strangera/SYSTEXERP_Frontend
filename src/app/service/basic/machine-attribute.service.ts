import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MachineAttributeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '機台屬性';

  // 本地數據的機台屬性選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '全部' },
    { value: 2, label: '自收' },
    { value: 3, label: '統收' },
    // 可以繼續添加其他選項
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 獲取所有機台屬性（本地數據）
  getMachineAttributes(): Observable<any[]> {
    return of(this.options).pipe(
      tap((data) => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
