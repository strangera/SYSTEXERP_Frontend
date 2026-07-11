import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export interface CPM10010Data {
  ID: number;
  mid: number;
  SYS_StoreNo: string;
  Service_Id: string;
  Service_Name: string;
  building_no: string;
  FLOOR_NO: string;
  AREA_NO: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string | null;
  UPD_USR_No: string | null;
  UPD_USR_Name: string | null;
}

// --- API 2: 查詢 CSS2001 設備列表 ---

// Response Data (對應 CSS2001 Device_id 和 Device_Name)
export interface DeviceListItem {
  Device_id: string;
  Device_Name: string;
}

// 查詢服務台位置檔 Request 介面
export interface QueryCPM11020Request extends ApiRequest {
  Device_id?: string;    // 設備代號
  Device_Name?: string;    // 設備名稱
}

// 查詢服務台位置檔 Response 資料結構
export interface CPM11020Data {
  ID: number;
  mid: number;
  Device_ID: string;
  Device_Name: string;
  Device_TotQty: string;
  CRT_Date: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_Name: string;
}

export interface QueryCPM11020DetailRequest {
  ID: number;
}

// 查詢明細 Response 資料結構
export interface CPM11020DetailData {
  MainData: CPM11020MainData;
  Details: CPM11020DetailItem[];
}

// 主檔資料
export interface CPM11020MainData {
  ID: number;
  Device_ID: string;
  Device_Name: string;
  Device_TotQty: number;
  CRT_Date: string;
  CRT_USR_Name: string;
  UPD_Date: string | null;
  UPD_USR_Name: string | null;
}

// 明細資料
export interface CPM11020DetailItem {
  ID: number;
  mid: number;
  SYS_StoreNo: number;
  Device_ID: string;
  Service_Id: string;
  Device_Qty: number;
  CRT_Date: string;
  CRT_USR_Name: string;
  _dataStatus?: 'original' | 'new' | 'modified' | 'deleted';  // TableEdit 自動添加的狀態欄位
}

// 新增客服設備 Request 介面
export interface InsertCPM11020Request {
  Device_ID: string;        // 設備代號
  Device_Name: string;      // 設備名稱
  Device_TotQty: number;    // 設備總量
  Details: InsertCPM11020DetailItem[];  // 明細資料
}

export interface InsertCPM11020DetailItem {
  Service_Id: string;       // 服務台位置
  Device_Qty: number;       // 分配設備數量
}

// 修改客服設備 Request 介面
export interface UpdateCPM11020Request {
  ID: number;               // 主鍵ID
  Device_ID: string;        // 設備代號
  Device_Name: string;      // 設備名稱
  Device_TotQty: number;    // 設備總量
  Details: UpdateCPM11020DetailItem[];  // 明細資料
}

export interface UpdateCPM11020DetailItem {
  ID?: number;              // 明細ID (新增時不需要，修改/刪除時需要)
  Service_Id: string;       // 服務台位置
  Device_Qty: number;       // 分配設備數量
  _dataStatus?: string;     // 資料狀態: 'original' | 'new' | 'modified' | 'deleted'
}

// 刪除客服設備 Request 介面
export interface DeleteCPM11020Request {
  IdList: number[];         // 要刪除的ID清單 (注意大小寫要跟後端一致)
}

@Injectable({
  providedIn: 'root'
})
export class CPM11010Service {

  private apiUrl = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryCPM11010(req: QueryCPM11020Request): Observable<ApiResponse<CPM11020Data[]>> {
    return this.http.post<ApiResponse<CPM11020Data[]>>(`${this.apiUrl}/queryCPM11020`, req);
  }

  // 查詢明細 (注意：Data 是物件而非陣列)
  queryCPM11020Detail(req: QueryCPM11020DetailRequest): Observable<{
    Status: string;
    Data: CPM11020DetailData;
    Error: unknown;
    Meta: {
      Timestamp: string;
      RequestId: string;
    };
    Message: string;
    TotalCount: number;
    TotalPage: number;
  }> {
    return this.http.post<{
      Status: string;
      Data: CPM11020DetailData;
      Error: unknown;
      Meta: {
        Timestamp: string;
        RequestId: string;
      };
      Message: string;
      TotalCount: number;
      TotalPage: number;
    }>(`${this.apiUrl}/queryDetailCPM11020`, req);
  }

  /**
   *  新增 API 1: 查詢 CSS1001 客戶服務資料 (對應後端 queryCPM10010)
   * POST /queryCPM10010
   * 注意: ApiResponse<T[]> 的 Data 已經是 T[]，所以 T 不需要再是陣列
   */
  queryCPM10010(): Observable<ApiResponse<CPM10010Data[]>> {
    return this.http.post<ApiResponse<CPM10010Data[]>>(`${this.apiUrl}/queryCPM10010`, {});
  }

  /**
   *  新增 API 2: 查詢 CSS2001 設備列表 (對應後端 queryDeviceListCPM11020)
   * POST /queryDeviceListCPM11020
   * 注意: ApiResponse<T[]> 的 Data 已經是 T[]，所以 T 不需要再是陣列
   */
  queryDeviceListCPM11020(): Observable<ApiResponse<DeviceListItem[]>> {
    return this.http.post<ApiResponse<DeviceListItem[]>>(`${this.apiUrl}/queryDeviceListCPM11020`, {});
  }

  // 新增
  insertCPM11020(req: InsertCPM11020Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertCPM11020`, req);
  }

  // 修改
  updateCPM11020(req: UpdateCPM11020Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateCPM11020`, req);
  }

  // 刪除
  deleteCPM11020(req: DeleteCPM11020Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteCPM11020`, req);
  }
}
