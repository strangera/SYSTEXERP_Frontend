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

  getFloorOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3900_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getRegionOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3A00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getOrgOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3100_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getUsageOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3F00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  getBuildingOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3800_DropDownList`, {})
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

  buildQueryPayload(formValue: any, PageIndex = 1, PageSize = 10, SortBy: any[] = []): any {

    return {
      request: {
        PageSize: formValue.pageSize,
        PageIndex: formValue.pageIndex,
        SortBy: formValue.SortBy?.length ? formValue.SortBy : [{ field: 'LOCATION_No', order: 1 }],
        LOCATION_No: [formValue.LOCATION_No ?? ''],
        org_id: formValue.ORG_No ?? [],
        building_no: formValue.BUILDING_NO ?? '',
        FLOOR_NO: formValue.FLOOR_NO ?? [],
        AREA_NO: formValue.AREA_NO ?? [],
        GROSS_SPACE: formValue.GROSS_SPACE || null,
        NET_SPACE: formValue.NET_SPACE || null,
        LOCATION_Status: formValue.LOCATION_Status ?? null,
        Purpose_no: formValue.Location_Purpose ?? [],
      }
    };

  }


}
