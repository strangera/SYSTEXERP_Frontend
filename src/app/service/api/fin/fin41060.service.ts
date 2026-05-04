import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  FIN41060QueryRow,
  FIN41060UpdateData,
  QueryFIN41060Request,
  UpdateFIN41060Request,
} from '../../../pages/fin/fin41060/fin41060.model';

@Injectable({
  providedIn: 'root',
})
export class FIN41060Service {
  private apiUrl = environment.ApiUrl + '/Controllers/FIN40000';

  constructor(private http: HttpClient) {}

  /** 查詢部門預算審核 */
  queryFIN41060(
    request: QueryFIN41060Request,
  ): Observable<ApiResponse<FIN41060QueryRow[]>> {
    return this.http.post<ApiResponse<FIN41060QueryRow[]>>(
      `${this.apiUrl}/queryFIN41060`,
      request,
    );
  }

  /** 審核/反審核部門預算 (Action: 'Y'=審核, 'N'=反審核) */
  updateFIN41060(
    request: UpdateFIN41060Request,
  ): Observable<ApiResponse<FIN41060UpdateData>> {
    return this.http.post<ApiResponse<FIN41060UpdateData>>(
      `${this.apiUrl}/updateFIN41060`,
      request,
    );
  }
}
