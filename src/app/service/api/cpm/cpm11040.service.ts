import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢客服設備出借/歸還記錄 Request 介面
export interface QueryCPM11040Request extends ApiRequest {
  LoanNo?: string;            // 借記/歸還編號
  ServiceId?: string;         // 服務中心位置編號
  LoanDateStart?: string;     // 出借日期 - 起
  LoanDateEnd?: string;       // 出借日期 - 迄
  ReturnDateStart?: string;   // 歸還日期 - 起
  ReturnDateEnd?: string;     // 歸還日期 - 迄
  UserName?: string;          // 借用人姓名
  LoanPhone?: string;         // 連絡電話
  CertNo?: string;            // 證件編號
  DeviceID?: string;          // 設備編號
  DeviceName?: string;        // 設備名稱
  CertType?: string;          // 證件類型
  LoanUserName?: string;      // 出借處理人員
  OnlyUnreturned?: boolean;   // 只查未歸還記錄
}

// 查詢客服設備出借/歸還記錄 Response 資料結構
export interface CPM11040Data {
  ID: number;                 // 主鍵ID
  LoanNo: string;             // 記錄編號
  ReturnNo: string;           // 歸還編號
  LoanDate: string;           // 出借日期
  LoanTime: string;           // 出借時間
  ReturnDate: string | null;  // 歸還日期
  ReturnTime: string | null;  // 歸還時間
  UserName: string;           // 借用人姓名
  LoanPhone: string | null;   // 連絡電話
  CertType: string;           // 證件類型
  CertTypeName: string;       // 證件名稱
  CertNo: string;             // 證件編號
  LoanUserName: string | null; // 出借處理人員姓名
  DeviceNames: string | null; // 出借設備清單（聚合，格式: "設備A x1, 設備B x2"）
  ServiceID: string | null;   // 服務中心編號
  ServiceName: string | null; // 服務中心名稱
  LoanStatus: string;         // 出借狀態 (1:已出借, 2:已歸還)
}

// 刪除客服設備出借記錄 Request 介面
export interface DeleteCPM11040Request {
  IdList: number[];           // 要刪除的ID清單
}

// 歸還設備 Request 介面
export interface ReturnDeviceRequest {
  LoanNo: string;             // 借記編號 (必填)
  ReturnDate: string;         // 歸還日期 (必填)
  ReturnTime: string;         // 歸還時間 HH:mm (必填)
}

// 歸還設備 Response 介面
export interface ReturnDeviceResponse {
  Message: string;            // 訊息
  RowsAffected: number;       // 影響的記錄數
}

@Injectable({
  providedIn: 'root'
})
export class CPM11040Service {

  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢客服設備出借/歸還記錄
  queryCPM11040(req: QueryCPM11040Request): Observable<ApiResponse<CPM11040Data[]>> {
    return this.http.post<ApiResponse<CPM11040Data[]>>(`${this.apiUrl}/queryCPM11040`, req);
  }

  // 刪除客服設備出借記錄
  deleteCPM11040(req: DeleteCPM11040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteCPM11040`, req);
  }

  // 歸還設備
  returnDevice(req: ReturnDeviceRequest): Observable<ApiResponse<ReturnDeviceResponse[]>> {
    return this.http.post<ApiResponse<ReturnDeviceResponse[]>>(`${this.apiUrl}/returnDevice`, req);
  }
}
