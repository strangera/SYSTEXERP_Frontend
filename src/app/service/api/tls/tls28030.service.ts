import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS28030Request {
  TXN_Date_S?: string;
  TXN_Date_E?: string;
  Bak_Date_S?: string;
  Bak_Date_E?: string;
  ECR_No?: string;
  TLT_No?: string;
  ECR_Group?: string;
  ECR_LocNo?: string;
  ECR_Type?: string;
  BAG_Type?: string;
  Status?: string;
  IsVirtualOnly: boolean;
}

export interface ITLS28030Data {
  BAG_TYPE_Name: string;   // 表別 (現金袋/帳務袋/零用金袋)
  ECR_Group: string;       // 館別(代碼)
  BUILDING_DESC: string;   // 館別(名稱)
  ECR_LocNo: string;       // 樓層(代碼)
  FLOOR_DESC: string;      // 樓層(名稱)
  ECR_AreaNo: string;      // 區域(代碼)
  AREA_DESC: string;       // 區域(名稱)
  ECR_No: string;          // 收銀機代號
  ECR_Name: string;        // 收銀機名稱
  TLT_No: string;          // 專櫃編號
  ECR_TLT_Name: string;    // 專櫃名稱
  TXN_Date: string;        // 入帳日期
  Get_Date: string;        // 領袋日期
  Get_TimeOnly: string;    // 領袋時間
  Bak_Date: string;        // 繳袋日期
  Bak_TimeOnly: string;    // 繳袋時間
  Power_On_Time: string;   // 開機時間
  Clear_Time: string;      // 清機時間
}

@Injectable({ providedIn: 'root' })
export class TLS28030Service {
  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  queryTLS28030(params: QueryTLS28030Request): Observable<ApiResponse<ITLS28030Data[]>> {
    return this.http.post<ApiResponse<ITLS28030Data[]>>(`${this.apiUrl}/queryTLS28030`, params);
  }
}
