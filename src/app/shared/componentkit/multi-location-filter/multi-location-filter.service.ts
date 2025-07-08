import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ErrorHandlerService } from '../../../service/system/error-handler.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MultiLocationFilterService {
  apiUrl: string = environment.ApiUrl;

  constructor(private http: HttpClient, private errorHandler: ErrorHandlerService) { }

  /** 取得館別選項 */
  getBuildingOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3800_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }

  /** ✅ 獨立取得樓層選項（不依館別） */
  getFloors(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3900_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError((error: HttpErrorResponse) => this.errorHandler.handleError(error))
      );
  }

  /** ✅ 獨立取得區域選項（不依館別與樓層） */
  getRegionOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/querySYS3A00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }
}
