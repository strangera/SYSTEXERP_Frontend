import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../shared/service/error-handler.service';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegionService {
  apiUrl: string = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  getRegionOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/TLS0000/TLS1000/queryTLS11010_SYS3A00_DropDownList`, {})
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? []),
        catchError(this.errorHandler.handleError)
      );
  }
}
