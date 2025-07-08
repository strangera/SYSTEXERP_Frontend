import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PayMachineAttributeService {
  apiUrl: string = environment.ApiUrl;
  title: string = '機台屬性';

  // 本地數據的機台屬性選項，使用數字作為 value
  options: any[] = [
    { value: 1, label: '清機未繳袋狀況表' },
    { value: 2, label: '未清機繳袋狀況表' },
    { value: 3, label: '有開機未清機機台' },
    { value: 4, label: '有開機未繳袋機台' },
    { value: 5, label: '專櫃自打未繳袋機台' },

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
