import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface QuerySYS0620Request extends ApiRequest {
  StartDate: string;
  EndDate: string;
  UserNo?: string | null;
  RoleCode?: string | null;
}

// 欄位對照後端 QuerySYS0620Response 輸出
export interface SYS0620QueryData {
  ID: number;
  UserName?: string;
  RoleName?: string;
  ActionStatus?: string;
  LogTime?: string;
  CreateUserName?: string;
}

@Injectable({ providedIn: 'root' })
export class Sys0620Service {
  private readonly http = inject(HttpClient);
  // 指向對應的系統模組路由
  private readonly apiUrl = `${environment.ApiUrl}/SYS0000/BAS1000`;

  querySYS0620(body: QuerySYS0620Request): Observable<ApiResponse<SYS0620QueryData[]>> {
    return this.http.post<ApiResponse<SYS0620QueryData[]>>(`${this.apiUrl}/querySYS0620`, body);
  }
}
