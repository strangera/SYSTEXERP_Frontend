import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryResponse } from '../../../shared/models/api/base-api.interface';

export interface TLS32030QueryRequest {
  PageSize: number;
  PageIndex: number;
  OrderBy: string;
  Offset: number;
  SortBy: { field: string; order: number }[];

  BaseDateFrom: string | null;
  BaseDateTo: string | null;
  CompareDateFrom: string | null;
  CompareDateTo: string | null;

  BudgetVersion: string | null;
  AmtTaxMode: string | null;
  ReceFilter: string | null;

  FloorList: (string | number)[];
  AreaList: (string | number)[];
  BusTypeList: (string | number)[];
  BusClassList: (string | number)[];
  TltKindList: (string | number)[];
  OrgList: (string | number)[];
  TltNoList: (string | number)[];
  TermTypeList: (string | number)[];
  BuildingList: (string | number)[];
}

export interface TLS32030Data {
  id: number;
  building: string;
  organization: string;
  counterType: string;
  counterNumber: string;
  counterName: string;

  compare_salesAmount: number;
  compare_salesCount: number;
  compare_customerCount: number;
  compare_unitPrice: number;
  compare_conversionRate: number;
  compare_averageSpend: number;
  compare_position: number;

  baseline_salesAmount: number;
  baseline_salesCount: number;
  baseline_customerCount: number;
  baseline_unitPrice: number;
  baseline_conversionRate: number;
  baseline_averageSpend: number;
  baseline_position: number;

  growth_salesAmount: number;
  growth_salesCount: number;
  growth_customerCount: number;
  growth_unitPrice: number;
  growth_conversionRate: number;
  growth_averageSpend: number;
  growth_position: number;

  diff_salesAmount: number;
  diff_salesCount: number;
  diff_customerCount: number;
  diff_unitPrice: number;
  diff_conversionRate: number;
  diff_averageSpend: number;
  diff_position: number;
}

@Injectable({ providedIn: 'root' })
export class TLS32030Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS3000';

  constructor(private http: HttpClient) { }

  queryTLS32030(request: TLS32030QueryRequest): Observable<BaseQueryResponse<TLS32030Data>> {
    return this.http.post<BaseQueryResponse<TLS32030Data>>(
      `${this.apiUrl}/queryTLS32030`,
      request
    );
  }
}
