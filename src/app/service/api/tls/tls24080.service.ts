import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

export interface TLS24080Request {
  TXN_Date_Start: string; // e.g. '2025-08-06T09:32:54.534Z'
  TXN_Date_End: string;
  UPD_Date_Start: string;
  UPD_Date_End: string;
  ECR_No: string[];
  TXN_No_Start: number;
  TXN_No_End: number;
  EditType: string;
}
export interface TLS24080Data {
  TLTNoEdit: TLTNoEditItem[];
  DiscCodeEdit: DiscCodeEditItem[];
  TLTIdEdit: TLTIdEditItem[];
  PayNoEdit: PayNoEditItem[];
  PreOrderEdit: PreOrderEditItem[];
  VoidEdit: VoidEditItem[];
}
export interface TLTNoEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  PRM_TLT_No: string;
  PRM_TLT_Name: string;
  TLT_No: string;
  TLT_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface DiscCodeEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  tlt_id: string;
  TXN_Qty: number;
  TXN_SaleAmt: number;
  PRM_DiscCode: string;
  DiscCode: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface TLTIdEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  TXN_Qty: number;
  TXN_SaleAmt: number;
  PRM_TLT_Id: string;
  tlt_id: string;
  TXN_DiscCode: string;
  TXN_DiscCodeName: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface PayNoEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  PRM_PAY_No: string;
  PAY_No: string;
  TXN_PayAmt: number;
  PRM_TERM_No: number;
  TERM_No: number;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface PreOrderEditItem {
  ID: number;
  TXN_Date: string;
  ECR_No: string;
  TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  PRM_TXN_PreOrder: string;
  TXN_PreOrder: string;
  PRM_POD_No: string;
  POD_No: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

export interface VoidEditItem {
  ID: number;
  ORG_TXN_Date: string;
  ORG_ECR_No: string;
  ORG_TXN_No: number;
  TLT_No: string;
  TLT_Name: string;
  TXN_GUITrack: string;
  TXN_GUIBegNo: string;
  TXN_GUIEndNo: string;
  TXN_TotGUI: number;
  Void_Date: string;
  Void_USR_No: string;
  Void_USR_Name: string;
  TXN_Status: string;
}

export type TLS24080ResultData = TLTNoEditItem | DiscCodeEditItem | TLTIdEditItem | PayNoEditItem | PreOrderEditItem | VoidEditItem;

@Injectable({
  providedIn: 'root',
})
export class Tls24080Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS5006 資料表，並根據 EditType 過濾結果
   * @param params 查詢條件
   * @returns 包含特定 EditType 資料陣列的 Observable
   */
  queryTLS24080(params: TLS24080Request): Observable<ApiResponse<TLS24080ResultData[]>> {
    return this.http.post<ApiResponse<TLS24080Data[]>>(`${this.apiUrl}/queryTLS24080`, params).pipe(
      map(res => {
        // 檢查 Data 陣列是否存在且非空
        if (!res.Data || res.Data.length === 0) {
          return { ...res, Data: [] }; // 如果沒有資料，回傳空的陣列
        }

        const dataContainer = res.Data[0];
        let filteredData: TLS24080ResultData[] = [];

        // 根據 EditType 提取對應的資料陣列
        switch (params.EditType) {
          case 'TLTNoEdit':
            filteredData = dataContainer.TLTNoEdit;
            break;
          case 'DiscCodeEdit':
            filteredData = dataContainer.DiscCodeEdit;
            break;
          case 'TLTIdEdit':
            filteredData = dataContainer.TLTIdEdit;
            break;
          case 'PayNoEdit':
            filteredData = dataContainer.PayNoEdit;
            break;
          case 'PreOrderEdit':
            filteredData = dataContainer.PreOrderEdit;
            break;
          case 'VoidEdit':
            filteredData = dataContainer.VoidEdit;
            break;
          default:
            filteredData = [];
            break;
        }

        // 回傳修改後的 ApiResponse 結構，Data 欄位現在是我們需要的陣列
        return {
          ...res,
          Data: filteredData as TLS24080ResultData[],
          TotalCount: filteredData.length > 0 ? res.TotalCount : 0 // 總數保持不變，或如果沒有資料則設為 0
        };
      })
    );
  }
}
