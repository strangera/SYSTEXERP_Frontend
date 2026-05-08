import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS17010DataWrapper,
  QueryASS17010Request,
} from '@pages/ass/ass17010/ass17010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

/** 後端回傳 Data 為巢狀 wrapper 時的原始型別 */
export type QueryASS17010ApiResponse = Omit<ApiResponse<never>, 'Data'> & {
  Data: QueryASS17010DataWrapper;
};

@Injectable({
  providedIn: 'root',
})
export class ASS17010Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  queryASS17010(payload: QueryASS17010Request): Observable<QueryASS17010ApiResponse> {
    return this.http.post<QueryASS17010ApiResponse>(`${this.apiUrl}/queryASS17010`, payload);
  }
}
