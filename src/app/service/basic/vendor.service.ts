import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  apiUrl: string = environment.ApiUrl;
  title: string = '廠商';
  vendors: any[] = [
    { value: 1, label: '00000000_停車管理' },
    { value: 2, label: '00000000_南紡流通服務台' },
    { value: 3, label: '03090407_方舒股份有限公司' },
    { value: 4, label: '04222671_奇哥股份有限公司' },
    { value: 5, label: '04376540_亞商聯業有限公司' },
    { value: 6, label: '04377371_麗嬰房股份有限公司' },
    { value: 7, label: '04377371_麗嬰房股份有限公司' },
    { value: 8, label: '04489185_日新不銹鋼工業股份有限公司' },
    { value: 9, label: '04839140_兆星國際有限公司' },
    { value: 10, label: '04839140_兆星國際有限公司' }
  ];

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getVendors(): Observable<any[]> {
    return of(this.vendors).pipe(
      tap(data => console.debug('get vendors response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  getVendorById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createVendor(vendor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, vendor).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateVendor(id: string, vendor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, vendor).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
}
