import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class Tls11010Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }
//floor
  getFloorOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryTLS11010_SYS3900_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getRegionOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryTLS11010_SYS3A00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getOrgOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryTLS11010_SYS3100_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getUsageOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryTLS11010_SYS3F00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getBuildingOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryTLS11010_SYS3800_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  insertData(payload: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/TLS0000/TLS1000/insertTLS11010`, payload)
      .pipe(catchError(this.errorHandler.handleError));
  }

  updateData(payload: any): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/TLS0000/TLS1000/updateTLS11010`, payload)
      .pipe(catchError(this.errorHandler.handleError));
  }

  deleteData(idList: number[]): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/TLS0000/TLS1000/deleteTLS11010`, { idList })
      .pipe(catchError(this.errorHandler.handleError));
  }

  queryData(payload: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11010`, payload)
      .pipe(catchError(this.errorHandler.handleError));
  }






}
