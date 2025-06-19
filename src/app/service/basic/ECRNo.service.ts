import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, Observable, tap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ECRNoService {
  apiUrl: string = environment.ApiUrl + '/queryPOS1002_DropDownList';
  title: string = '收銀機號下拉選單';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getECRNo(): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      tap(response => console.debug('ECRNo response', response)),
      map(response =>
        (response?.Data ?? []).map((item: any) => ({
          value: item.No,
          label: item.Name
        }))
      ),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
  /**
* 查詢電子發票配號作業下拉選單 (POS1002)
*/
  getPOS1002BillDropDownList(): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS1002_Bill_DropDownList`, {})
  }
}
