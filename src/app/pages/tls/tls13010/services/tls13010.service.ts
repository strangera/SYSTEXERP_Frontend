// tls13010.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ApiResponse,
  ContractInfo,
  ConditionData,
  CommissionType
} from '../models/tls13010.models';

@Injectable({
  providedIn: 'root'
})
export class TLS13010Service {
  private readonly API_BASE_URL = '/api/tls13010';

  constructor(private http: HttpClient) { }

  // 查詢契約資訊
  queryContractInfo(talentId: string): Observable<ApiResponse<ContractInfo>> {
    return this.http.get<ApiResponse<ContractInfo>>(`${this.API_BASE_URL}/contract/${talentId}`);
  }

  // 查詢條件設定
  queryConditionData(talentId: string, commissionType: CommissionType): Observable<ApiResponse<ConditionData>> {
    return this.http.get<ApiResponse<ConditionData>>(
      `${this.API_BASE_URL}/condition/${talentId}/${commissionType}`
    );
  }

  // 儲存條件設定
  saveConditionData(talentId: string, data: ConditionData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_BASE_URL}/condition/${talentId}`,
      data
    );
  }

  // 提交完整契約資料
  submitContractData(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.API_BASE_URL}/submit`,
      data
    );
  }
}
