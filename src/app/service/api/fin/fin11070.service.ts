import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';

// Query request interface for FIN11070
export interface FIN11070QueryRequest extends BaseQueryRequest {
  DeclareYearMonth?: string;        // 申報年月
}

// Data result interface for FIN11070 (二聯式電子發票筆數核對表)
export interface FIN11070Data {
  UploadProcessTime: string;        // 上傳處理時間
  ProcessResultDescription: string; // 處理結果說明
}

@Injectable({
  providedIn: 'root'
})
export class FIN11070Service {
  private apiUrl = environment.ApiUrl + '/FIN1000/FIN11070';

  constructor(private http: HttpClient) { }

  // 查詢二聯式電子發票筆數核對表
  queryFIN11070(data: FIN11070QueryRequest): Observable<BaseQueryResponse<FIN11070Data>> {
    // return this.http.post<BaseQueryResponse<FIN11070Data>>(`${this.apiUrl}/queryFIN11070`, data);
    // 回傳假資料
    return of({
      Status: '0000',
      Data: [
        {
          UploadProcessTime: '2023-01-01T00:00:00Z',
          ProcessResultDescription: '處理成功'
        }
      ],
      Message: '',
      TotalCount: 1,
      TotalPage: 1
    });
  }
}
