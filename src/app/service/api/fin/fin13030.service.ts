import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
export interface BaseDeleteRequest {
  idList: number[];                 // 要刪除的資料ID清單
}
// --- FIN13030 查詢參數 Model 定義 ---
export interface FIN13030QueryRequest extends ApiRequest {
  INV_GUINo_B?: string;                // 發票號碼_起
  INV_GUINo_E?: string;                // 發票號碼_迄
  INV_GUIDate_B?: string;              // 發票日期_起
  INV_GUIDate_E?: string;              // 發票日期_迄
  INV_YM_B?: string;                   // 資料所屬年月_起
  INV_YM_E?: string;                   // 資料所屬年月_迄
  INV_DeclareYM_B?: string;            // 申報年月_起
  INV_DeclareYM_E?: string;            // 申報年月_迄
  INV_Uniform?: string;                // 買受人統一編號
  GoodsOrServicesName?: string;        // 貨物或勞務名稱
  GoodsQtyStart?: number;              // 貨物或勞務數量_起
  GoodsQtyEnd?: number;                // 貨物或勞務數量_迄
  ExportMethod?: string[];             // 外銷方式
  INV_DocName?: string;                // 證明文件名稱
  INV_DocNo?: string;                  // 證明文件編號
  NonCustomsExportAmt_B?: number;      // 非經海關出口金額_起
  NonCustomsExportAmt_E?: number;      // 非經海關出口金額_迄
  INV_ExportType?: string[];           // 出口報單類別
  INV_ExportNo?: string;               // 出口報單號碼
  CustomsExportAmt_B?: number;         // 經海關出口金額_起
  CustomsExportAmt_E?: number;         // 經海關出口金額_迄
  ExportDate_B?: string;               // 輸出或結匯日期_起
  ExportDate_E?: string;               // 輸出或結匯日期_迄
  INV_Remark?: string;                 // 備註
}

// --- FIN13030 回應資料 Model 定義 ---
export interface FIN13030Data {
  ID: number;                         // 資料識別碼
  INV_GUITrack: string;               // 發票字軌
  INV_GUINo: string;                  // 發票號碼
  INV_GUIDate: string;                // 發票日期 (ISO字串)
  INV_YM: string;                     // 資料所屬年月
  INV_DeclareYM: string;              // 申報年月
  INV_SAL_Uniform: string;            // 銷售方統一編號
  INV_Uniform: string;                // 買受人統一編號
  GoodsOrServicesName: string;        // 貨物或勞務名稱
  GoodsQty: number;                   // 貨物或勞務數量
  ExportMethod: string;               // 外銷方式
  INV_DocName: string;                // 證明文件名稱
  INV_DocNo: string;                  // 證明文件編號
  NonCustomsExportAmt: number;        // 非經海關出口金額
  INV_ExportType: string;             // 出口報單類別
  INV_ExportNo: string;               // 出口報單號碼
  CustomsExportAmt: number;           // 經海關出口金額
  ExportDate: string;                 // 輸出或結匯日期 (ISO字串)
  INV_Remark: string;                 // 備註
  INV_PassType: string;               // 通關方式註記
  INV_Name: string;                   // 買受人名稱
  CRT_Date: string;                   // 建立日期 (ISO字串)
  CRT_USR_No: string;                 // 建立人員編號
  CRT_USR_Name: string;               // 建立人員姓名
  UPD_Date: string;                   // 更新日期 (ISO字串)
  UPD_USR_No: string;                 // 更新人員編號
  UPD_USR_Name: string;               // 更新人員姓名
}

// 取得零稅率發票 - 查詢參數
export interface FIN13030GetZeroTaxGUIRequest {
  INV_GUINo_B?: string;             // 發票號碼_起
  INV_GUINo_E?: string;             // 發票號碼_迄
  INV_GUIDate_B?: string;           // 發票日期_起 (ISO字串)
  INV_GUIDate_E?: string;           // 發票日期_迄 (ISO字串)
  INV_YM_B?: string;                // 資料所屬年月_起
  INV_YM_E?: string;                // 資料所屬年月_迄
  INV_DeclareYM_B?: string;         // 申報年月_起
  INV_DeclareYM_E?: string;         // 申報年月_迄
}

// 取得零稅率發票 - 回應資料
export interface FIN13030GetZeroTaxGUIResponse {
  ID: number;                  // 資料識別碼
  INV_GUITrack: string;        // 發票字軌
  INV_GUINo: string;           // 發票號碼
  INV_GUIDate: string;         // 發票日期 (ISO字串)
  INV_YM: string;              // 資料所屬年月
  INV_DeclareYM: string;       // 申報年月
  INV_Uniform: string;         // 買受人統一編號
  INV_Amt: number;             // 發票金額
  INV_GUIType: string;         // 發票類別
  INV_ZeroTax: string;         // 零稅率註記
  INV_SeqNo: number;           // 序號
  TXN_REMARK?: string;         // 備註(即TDS1001.TXN_REMARK，已同步POS4023.INV_Remark)，供自動帶入證明文件號碼
}


// 新增TDS10012資料 - 請求資料
export interface FIN13030InsertRequest {
  INV_GUINo: string;                // 發票號碼
  INV_YM: string;                   // 資料所屬年月
  INV_DeclareYM: string;            // 申報年月
  INV_Name: string;                 // 買受人名稱
  INV_PassType: string;             // 通關方式註記
  GoodsOrServicesName: string;      // 貨物或勞務名稱
  GoodsQty: number;                 // 貨物或勞務數量
  ExportMethod: string;             // 外銷方式
  INV_DocName: string;              // 證明文件名稱
  INV_DocNo: string;                // 證明文件編號
  NonCustomsExportAmt: number;      // 非經海關出口金額
  INV_ExportType: string;           // 出口報單類別
  INV_ExportNo: string;             // 出口報單號碼
  CustomsExportAmt: number;         // 經海關出口金額
  ExportDate: string;               // 輸出或結匯日期 (ISO字串)
  INV_Remark: string;               // 備註
  INV_GUITrack: string;             // 發票字軌
  INV_GUIType: string;              // 發票類別
  INV_ZeroTax: string;              // 零稅率註記
  INV_SeqNo: number;                // 序號
}

// 更新TDS10012資料 - 請求資料
export interface FIN13030UpdateRequest {
  ID: number;                       // 資料識別碼
  INV_GUINo: string;                // 發票號碼
  INV_YM: string;                   // 資料所屬年月
  INV_DeclareYM: string;            // 申報年月
  INV_Name: string;                 // 買受人名稱
  GoodsOrServicesName: string;      // 貨物或勞務名稱
  GoodsQty: number;                 // 貨物或勞務數量
  ExportMethod: string;             // 外銷方式
  INV_DocName: string;              // 證明文件名稱
  INV_DocNo: string;                // 證明文件編號
  NonCustomsExportAmt: number;      // 非經海關出口金額
  INV_ExportType: string;           // 出口報單類別
  INV_ExportNo: string;             // 出口報單號碼
  CustomsExportAmt: number;         // 經海關出口金額
  ExportDate: string;               // 輸出或結匯日期 (ISO字串)
  INV_Remark: string;               // 備註
  INV_PassType: string;             // 通關方式註記
  INV_GUITrack: string;             // 發票字軌
  INV_GUIType: string;              // 發票類別
  INV_ZeroTax: string;              // 零稅率註記
  INV_SeqNo: number;                // 序號
}

@Injectable({
  providedIn: 'root'
})
export class FIN13030Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 查詢
  queryFIN13030(data: FIN13030QueryRequest): Observable<ApiResponse<FIN13030Data[]>> {
    return this.http.post<ApiResponse<FIN13030Data[]>>(`${this.apiUrl}/queryFIN13030`, data);
  }

  // 取得零稅率發票
  queryFIN13030_GetZeroTaxGUI(data: FIN13030GetZeroTaxGUIRequest): Observable<ApiResponse<FIN13030GetZeroTaxGUIResponse[]>> {
    return this.http.post<ApiResponse<FIN13030GetZeroTaxGUIResponse[]>>(`${this.apiUrl}/queryFIN13030_GetZeroTaxGUI`, data);
  }

  // 新增TDS10012資料
  insertFIN13030(data: FIN13030InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN13030`, data);
  }

  // 更新TDS10012資料表
  updateFIN13030(data: FIN13030UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN13030`, data);
  }

  // 刪除TDS10012資料
  deleteFIN13030(data: BaseDeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN13030`, data);
  }

  // 匯出 Excel
  exportExcelFIN13030(data: FIN13030QueryRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportExcelFIN13030`, data, { responseType: 'blob' });
  }

  // 匯出 PDF
  exportPDFFIN13030(data: FIN13030QueryRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportPDFFIN13030`, data, { responseType: 'blob' });
  }
}
