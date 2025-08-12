import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';
import { SortMeta } from 'primeng/api';

const API_URL = `${environment.ApiUrl}/SYS0000/BAS1000`;
export interface UpdateStatusSYSB200Request {
  id: number;              // 後端指定的鍵值
  VEN_Status: '0' | '1';   // 0=未審核, 1=已審核
}
/**
 * 查詢 request model
 */
export interface QuerySYSB200Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortMeta[];
  OrderBy?: string;
  Offset?: number;
  VEN_NoList?: string[];
  VEN_Status?: string;
  VEN_Uniform?: string;
  VEN_Name?: string;
  VEN_EngName?: string;
  VEN_ShortName?: string;
  VEN_BNK_No?: string;
  VEN_GUIAddr?: string;
  VEN_Boss?: string;
  VEN_BossTitle?: string;
  VEN_BossEmail?: string;
  VEN_BossTel?: string;
  VEN_BossID?: string;
  VEN_BossAddr?: string;
  VEN_Tel?: string;
  VEN_Fax?: string;
  VEN_Address?: string;
  VEN_PayConditionDay?: number | null;
  VEN_Remark?: string;
}


export interface SYSB200DetailRequest {
  pos2013_id: number;

}

@Injectable({
  providedIn: 'root',
})
export class Sysb200Service {
  constructor(private http: HttpClient) { }

  querySYSB200(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/querySYSB200`, params);
  }


  querySYSB200Detail(params: { pos2013_id: number }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/querySYSB200Detail`, params);
  }


  insertSYSB200(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/insertSYSB200`, data);
  }


  updateSYSB200(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/updateSYSB200`, data);
  }
updateStatusSYSB200(body: UpdateStatusSYSB200Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/updateStatusSYSB200`, body);
  }
}
