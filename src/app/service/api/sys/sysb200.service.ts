import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

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
  VEN_Flag?: string;
  VEN_Name?: string;
  VEN_EngName?: string;
  VEN_ShortName?: string;
  VEN_Address?: string;
  VEN_GUIAddr?: string;
  VEN_Boss?: string;
  VEN_BossTitle?: string;
  VEN_BossEmail?: string;
  VEN_BossTel?: string;
  VEN_Tel?: string;
  VEN_Fax?: string;
  VEN_Email?: string;
  VEN_PayConditionDay?: number | null;
  VEN_PayType?: string;
  VEN_BNK_No?: string;
  VEN_BNK_BranchNo?: string;
  VEN_BankAccountNo?: string;
  VEN_AccountName?: string;
  VEN_Remark?: string;
}



export interface SYSB200DetailRequest {
  pos2013_id: number;
}

export interface BankBranchItem {
  BNK_No?: string | null;
  BNK_Name?: string | null;
  BNK_BranchNo?: string | null;
  BNK_BranchName?: string | null;
}
export interface DeleteSYSB200Request {
  idList: number[];
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

  queryBankBranchDropdown(): Observable<ApiResponse<BankBranchItem[]>> {
    return this.http.post<ApiResponse<BankBranchItem[]>>(`${environment.ApiUrl}/FIN0000/ARS1000/queryBankBranchDropdown`, {});
  }
  /**
   * 批次刪除廠商資料
   */
  deleteSYSB200(body: DeleteSYSB200Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${API_URL}/deleteSYSB200`, body);
  }
}
