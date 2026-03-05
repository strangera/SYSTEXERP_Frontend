import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ApproveYearBudgetFIN41010Request,
  ExportYearBudgetFIN41010Request,
  FIN41010ApproveData,
  FIN41010ImportData,
  ImportYearBudgetFIN41010Request,
} from '../../../pages/fin/fin41010/fin41010.model';

@Injectable({
  providedIn: 'root',
})
export class FIN41010Service {
  private apiUrl = environment.ApiUrl + '/Controllers/FIN40000';

  constructor(private http: HttpClient) { }

  /** 匯出年度預算（範本下載），回傳檔案流 */
  exportYearBudget(
    request: ExportYearBudgetFIN41010Request,
  ): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportYearBudgetFIN41010`,
      request,
      {
        responseType: 'blob',
        observe: 'response',
      },
    ) as Observable<HttpResponse<Blob>>;
  }

  /** 匯入年度預算（轉檔） */
  importYearBudget(
    file: File,
    request: ImportYearBudgetFIN41010Request,
  ): Observable<ApiResponse<FIN41010ImportData>> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('BudgetYear', request.BudgetYear);
    formData.append('BudgetVersion', request.BudgetVersion);
    formData.append('OrgId', request.OrgId);

    return this.http.post<ApiResponse<FIN41010ImportData>>(
      `${this.apiUrl}/importYearBudgetFIN41010`,
      formData,
    );
  }

  /** 審核/反審核年度預算（Action: 'A'=審核, 'U'=反審核） */
  approveYearBudget(
    request: ApproveYearBudgetFIN41010Request,
  ): Observable<ApiResponse<FIN41010ApproveData>> {
    return this.http.post<ApiResponse<FIN41010ApproveData>>(
      `${this.apiUrl}/approveYearBudgetFIN41010`,
      request,
    );
  }
}
