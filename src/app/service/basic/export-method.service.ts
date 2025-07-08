import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../system/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExportMethodService {
  apiUrl: string = environment.ApiUrl;
  title: string = '外銷方式';
  options: any[] = [
    { value: 1, label: '外銷貨物' },
    { value: 2, label: '與外銷有關之勞務，或在他國提供而在國內使用之勞務' },
    { value: 3, label: '依法設立之免稅商店銷售與過境旅客之貨物' },
    { value: 4, label: '出口區、科學工業園區、保稅工廠或保稅倉庫之計氣設備原料、物料、燃料、半製品' },
    { value: 5, label: '國際運輸' },
    { value: 6, label: '國際運輸用之船舶、航空器，及遠洋漁船' },
    { value: 7, label: '銷售與國際運輸用之船舶、航空器及遠洋漁船所使用之貨物或修繕勞務' },
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getExportMethods(): Observable<any[]> {
    return of(this.options).pipe(
      tap(data => console.debug('get options response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getExportMethodById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createExportMethod(floor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, floor).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateExportMethod(id: number, floor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, floor).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
