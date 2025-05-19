import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FloorService {
  apiUrl: string = environment.ApiUrl;
  title: string = '樓層';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getFloors(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryYS3900_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
      );
  }

  getFloorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      tap(data => console.debug('get by id response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  createFloor(floor: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, floor).pipe(
      tap(data => console.debug('post response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }

  updateFloor(id: number, floor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, floor).pipe(
      tap(data => console.debug('put response', data)),
      catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
    );
  }
    // ✅ 新增：查詢 APS1003 的下拉資料
  getAPS1003DropDownList(cap_typeList: string[]): Observable<any[]> {
    return this.http.post<any>(
      `${this.apiUrl}/queryTLS13030_APS1003_DropDownList`,
      { cap_typeList }
    ).pipe(
      map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
      tap((data) => console.log('APS1003 下拉資料:', data)),
      catchError(this.errorHandler.handleError)
    );
  }
}
