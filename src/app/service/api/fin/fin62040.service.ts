import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryFIN62040Request extends BaseQueryRequest {
  StartDate?: string;
  EndDate?: string;
}

export interface FIN62040Data {
  AccNo?: string;
  AccCName?: string;
  BNK_AccNo?: string;
  BNK_NAME?: string;
  BNK_AccName?: string;
  BegAmt?: number;
  DebitAmt?: number;
  CreditAmt?: number;
  EndAmt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FIN62040Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/NTS1000';

  constructor(private http: HttpClient) { }

  queryFIN62040(req: QueryFIN62040Request): Observable<BaseQueryResponse<FIN62040Data>> {
    return this.http.post<BaseQueryResponse<FIN62040Data>>(`${this.apiUrl}/queryFIN62040`, req);
  }
}