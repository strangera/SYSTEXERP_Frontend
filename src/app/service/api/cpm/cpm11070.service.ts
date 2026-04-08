import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// 查詢遺失物清單 Request
export interface QueryCPM11070Request extends BaseQueryRequest {
  OrderBy?: string;
  Offset?: number;
  SeqId?: string;
  RecDateFrom?: string;
  RecDateTo?: string;
  LostDateFrom?: string;
  LostDateTo?: string;
  FindDateFrom?: string;
  FindDateTo?: string;
  MsgDateFrom?: string;
  MsgDateTo?: string;
  ReceiveDateFrom?: string;
  ReceiveDateTo?: string;
  TransDateFrom?: string;
  TransDateTo?: string;
  DocType?: string;
  Goods?: string;
  SeqType?: string;
  Notes?: string;
  LocationKeyword?: string;
  ServiceUser?: string;
  KEY_USER?: string;
  BroadcastFilter?: string;
  BroadcastSituation?: string;
  RecaptionName?: string;
  RecaptionPhone?: string;
  RegistrantKeyword?: string;
  ProcessingUser?: string;
  IdentityKind?: string;
  Tel?: string;
  MobilePhone?: string;
  IdNo?: string;
}

// 查詢遺失物清單 Response 資料結構
export interface CPM11070Data {
  GoodsType?: string;
  GoodsDesc?: string;
  SeqId?: string;
  RecDate?: string;
  MsgDate?: string;
  ReceiveDate?: string;
  OffDate?: string;
  DocTypeName?: string;
  SeqStatusName?: string;
  Location?: string;
  ServiceUser?: string;
  Registrant?: string;
  Tel?: string;
  Mobile?: string;
}

// 單筆遺失物明細 Response 結構
export interface CPM11070DetailData {
  ID: number;
  MID: number;
  STO_NO: string;
  SEQ_ID: string;
  REC_DATE: string;
  DocType: string;
  SEQ_TYPE: string;
  LOST_DATE: string;
  FIND_DATE: string;
  LOCATION: string;
  KEY_USER: string;
  GOODS: string;
  OTHER_GOODS: string;
  SERVICE_USER: string;
  MSG_DATE: string;
  BROADCAST_YN: string;
  BROADCAST_SITUAATION: string;
  BROADCAST_DATE: string;
  NOTES: string;
  RECEIVE_DATE: string;
  RECAPTION_NAME: string;
  RECAPTION_PHONE: string;
  PROCESSING_USER: string;
  OFF_DATE: string;
  REGISTRANT: string;
  Identity_KIND: string;
  SEX: string;
  TEL: string;
  MOBILE_PHONE: string;
  ADDRESS: string;
  ID_NO: string;
  GetLocation: string;
  RELATED_SEQ_ID: number;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
  GoodsTypeName: string;
  DocTypeName: string;
  SeqStatusName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CPM11070Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) { }

  // 查詢
  queryCPM11070(req: QueryCPM11070Request): Observable<BaseQueryResponse<CPM11070Data>> {
    const url = `${this.apiUrl}/queryCPM11070`;
    return this.http.post<BaseQueryResponse<CPM11070Data>>(url, req);
  }
  // 明細查詢（單筆）
  queryCPM11070Detail(req: { SeqId: string }): Observable<ApiResponse<CPM11070DetailData>> {
    const url = `${this.apiUrl}/queryCPM11070Detail`;
    return this.http.post<ApiResponse<CPM11070DetailData>>(url, req);
  }
  createCPM11070(req: any): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/createCPM11070`;
    return this.http.post<ApiResponse<null>>(url, req);
  }
  updateCPM11070(req: any): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/updateCPM11070`;
    return this.http.post<ApiResponse<null>>(url, req);
  }
  finishedCPM11070(req: any): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/finishedCPM11070`;
    return this.http.post<ApiResponse<null>>(url, req);
  }
  broadcastCPM11070(req: any): Observable<ApiResponse<null>> {
    const url = `${this.apiUrl}/broadcastCPM11070`;
    return this.http.post<ApiResponse<null>>(url, req);
  }
  exportCPM11070Excel(req: QueryCPM11070Request): Observable<Blob> {
    const url = `${this.apiUrl}/exportCPM11070Excel`;
    return this.http.post(url, req, { responseType: 'blob' });
  }
}
