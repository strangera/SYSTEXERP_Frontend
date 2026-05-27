import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

export interface QueryTLS46030Request {
  ECR_SchNo?: string;
  ECR_SchDate_Start?: Date | string;
  ECR_SchDate_End?: Date | string;
  ECR_SchStatus?: string;
  ECR_No?: string;
  ECR_SchFinTime_Start?: Date | string;
  ECR_SchFinTime_End?: Date | string;
  ECR_FLD_ID?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface InsertTLS46030Request {
  ECR_No: string;
  ECR_SchStatus: string;
  ECR_SchDate: Date | string;
  ECR_SchFinTime?: Date | string;
  ECR_FLD_ID?: string;
  ECR_FLD_OrgVal: string;
  ECR_FLD_NewVal: string;
}

export interface UpdateTLS46030Request {
  ID?: number;
  ECR_SchNo: string;
  ECR_No: string;
  ECR_SchStatus: string;
  ECR_SchDate: Date | string;
  ECR_FLD_ID?: string;
  ECR_FLD_NewVal: string;
}

export interface QueryTLS46030Response {
  ID: number;
  ECR_SchNo: string;
  ECR_SchDate: Date | string;
  ECR_SchStatus: string;
  ECR_No: string;
  ECR_FLD_ID: string;
  ECR_FLD_OrgVal: string;
  ECR_FLD_NewVal: string;
  ECR_SchFinTime?: string;
}

@Injectable({ providedIn: 'root' })
export class Tls46030Service {
  private readonly apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;
  private readonly http = inject(HttpClient);

  // 查詢 TLS46030
  queryTLS46030(data: QueryTLS46030Request): Observable<ApiResponse<QueryTLS46030Response[]>> {
    return this.http.post<ApiResponse<QueryTLS46030Response[]>>(`${this.apiUrl}/queryTLS46030`, data);
  }

  // 新增 TLS46030
  insertTLS46030(data: InsertTLS46030Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertTLS46030`, data);
  }

  // 更新 TLS46030
  updateTLS46030(data: UpdateTLS46030Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateTLS46030`, data);
  }
}
