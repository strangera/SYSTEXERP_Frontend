import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseDeleteRequest, BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface FIN61010QueryRequest extends BaseQueryRequest {
  companyBankCode?: string;
  statusList?: string[];
}

export interface FIN61010Data {
  id: number;
  mid: number;
  companyBankCode: string;
  companyBankName: string;
  prefix: string;
  digitLength: number;
  startNumber: string;
  endNumber: string;
  usedNumber: string;
  status: string;
  startDate: string;
  stopDate: string;
}

export interface FIN61010InsertRequest {
  companyBankCode: string;
  prefix: string;
  digitLength: number;
  startNumber: string;
  endNumber: string;
  status: string;
  startDate: string;
  stopDate?: string;
}

export interface FIN61010UpdateRequest extends FIN61010InsertRequest {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class FIN61010Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/CHK1000`;

  constructor(private http: HttpClient) {}

  queryFIN61010(data: FIN61010QueryRequest): Observable<BaseQueryResponse<FIN61010Data>> {
    return this.http.post<BaseQueryResponse<FIN61010Data>>(`${this.apiUrl}/queryFIN61010`, data);
  }

  insertFIN61010(data: FIN61010InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN61010`, data);
  }

  updateFIN61010(data: FIN61010UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN61010`, data);
  }

  deleteFIN61010(data: BaseDeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN61010`, data);
  }
}
