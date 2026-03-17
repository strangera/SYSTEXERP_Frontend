import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApproveFIN41030Request,
  FIN41030ApproveData,
  FIN41030QueryRow,
  QueryFIN41030Request,
} from '../../../pages/fin/fin41030/fin41030.model';

@Injectable({
  providedIn: 'root',
})
export class FIN41030Service {
  private apiUrl = environment.ApiUrl + '/Controllers/FIN40000';

  constructor(private http: HttpClient) {}

  /** 查詢預算審核 */
  queryFIN41030(
    request: QueryFIN41030Request,
  ): Observable<ApiResponse<FIN41030QueryRow[]>> {
    return this.http.post<ApiResponse<FIN41030QueryRow[]>>(
      `${this.apiUrl}/queryYearBudgetFIN41030`,
      request,
    );
  }

  /** 審核/反審核（Action: 'A'=審核, 'U'=反審核） */
  approveFIN41030(
    request: ApproveFIN41030Request,
  ): Observable<ApiResponse<FIN41030ApproveData>> {
    return this.http.post<ApiResponse<FIN41030ApproveData>>(
      `${this.apiUrl}/approveToggleYearBudgetFIN41030`,
      request,
    );
  }
}
