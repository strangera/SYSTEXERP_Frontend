import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 路徑是否正確
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

// --- 1.1.2 發票作業(電子式發票各系統配號維護-11220-FIN12010) ---

/** 查詢 APS2001 資料表條件介面 (queryFIN12010) */
export interface IQueryFin12010Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  SAL_GUIYYYYMM_start?: string; // 發票期別 (起始)
  SAL_GUIYYYYMM_end?: string;   // 發票期別 (結束)
  SAL_GUITrack?: string;        // 發票字軌
  SAL_GUINo_start?: string;     // 發票號碼 (起始)
  SAL_GUINo_end?: string;       // 發票號碼 (結束)
  SAL_Type?: string[];      // 發票類別 (字串陣列)
}

/** APS2001 資料表的單筆資料介面 */
export interface IFin12010Data {
  id: number;
  SAL_GUIYYYYMM: any;  // 發票期別 (YYYYMM)
  SAL_GUIBegMM: string;   // 發票開始月份 (MM)
  SAL_GUIEndMM: string;   // 發票結束月份 (MM)
  SAL_GUITrack: string;   // 發票字軌
  SAL_GUIBegNo: string;   // 發票起始號碼
  SAL_GUIEndNo: string;   // 發票結束號碼
  SAL_GUIPaper: string;   // 發票類別
  SAL_LastUsedGUINo: string; // 最後使用發票號碼
  SAL_VoidGUICnt: number; // 作廢發票數量
  SAL_BlankCnt: number;   // 空白發票數量
  SAL_SAmt: number;       // 銷售金額
  SAL_TaxAmt: number;     // 稅額
  SAL_NoTaxAmt: number;   // 未稅金額
  SAL_ZeroTaxAmt: number; // 零稅率金額
  STR_Uniform: string;    // 店別統一編號
  STO_No: string;         // 店號
  SAL_Type: string;       // 銷售類型
  GUI_DingType: string;   // 發票性質
  CRT_Date: string;       // 建立日期
  CRT_USR_No: string;     // 建立人員編號
  CRT_USR_Name: string;   // 建立人員姓名
  UPD_Date: string;       // 更新日期
  UPD_USR_No: string;     // 更新人員編號
  UPD_USR_Name: string;   // 更新人員姓名
}

/** 新增 APS2001 資料介面 (insertFIN12010) */
export interface IInsertFin12010Request {
  SAL_GUIYYYYMM: string;  // 發票期別 (YYYYMM)
  SAL_GUITrack: string;   // 發票字軌
  SAL_GUIBegNo: string;   // 發票起始號碼
  SAL_GUIEndNo: string;   // 發票結束號碼
  SAL_Type: string;       // 銷售類型
}

/** 更新 APS2001 資料表介面 (updateFIN12010) */
export interface IUpdateFin12010Request {
  id?: number;       // 記錄 ID (主鍵)
  SAL_Type: string; // 銷售類型 (Swagger 中唯一可更新的欄位)
}

/** 刪除 APS2001 資料介面 (deleteFIN12010) */
export interface IDeleteFin12010Request {
  idList: number[]; // 要刪除的記錄 ID 列表
}

@Injectable({
  providedIn: 'root',
})
export class Fin12010Service {
  // 請根據您的實際環境調整 apiUrl 的基礎路徑
  // 根據 Swagger，Base Path 似乎是 /FIN0000/INV1000
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 APS2001 資料表
   * @param params 查詢條件
   * @returns 包含 IFin12010Data 陣列的 API 響應
   */
  queryFIN12010(params: IQueryFin12010Request): Observable<ApiResponse<IFin12010Data[]>> {
    return this.http.post<ApiResponse<IFin12010Data[]>>(`${this.apiUrl}/queryFIN12010`, params).pipe(
      map(response => {
        return {
          ...response,
          data: response.Data.map(item => ({
            ...item,
            SAL_GUIYYYYMM: item.SAL_GUIYYYYMM
              ? new Date(+item.SAL_GUIYYYYMM.substring(0, 4), +item.SAL_GUIYYYYMM.substring(4, 6) - 1, 1)
              : null,
          }))
        }
      })
    );
  }

  /**
   * 新增 APS2001 資料
   * @param data 要新增的發票配號資料
   * @returns API 響應
   */
  insertFIN12010(data: IInsertFin12010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertFIN12010`, data);
  }

  /**
   * 更新 APS2001 資料表
   * @param data 要更新的發票配號資料，包含 ID
   * @returns API 響應
   */
  updateFIN12010(data: IUpdateFin12010Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateFIN12010`, data);
  }

  /**
   * 刪除 APS2001 資料
   * @param idList 要刪除的記錄 ID 列表
   * @returns API 響應
   */
  deleteFIN12010(idList: number[]): Observable<ApiResponse<any>> {
    const body: IDeleteFin12010Request = { idList: idList };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteFIN12010`, body);
  }
  /**
 * 查詢 POS1017 資料表 (GUI_Track)
 * @param params 查詢條件 { GUI_YYMM: string }
 * @returns 包含字軌字串陣列的 API 響應
 */
  queryPOS1017GUITrack(params: { GUI_YYMM: string }): Observable<ApiResponse<{ GUI_Track: string, MAX_GUINO: string; UnassignedQty: number }[]>> {
    return this.http.post<ApiResponse<{ GUI_Track: string, MAX_GUINO: string; UnassignedQty: number }[]>>(`${this.apiUrl}/queryPOS1017GUITrack`, params);
  }

  /**
   * 查詢 POS1017 資料表 (GUI_BegNo, GUI_EndNo)
   * @param params 查詢條件 { GUI_YYMM: string, GUI_Track: string, AddRolls: number }
   * @returns 包含 New_GUI_BegNo 和 New_GUI_EndNo 的 API 響應
   */
  queryPOS1017GUIBegNo_GUIEndNo(params: { GUI_YYMM: string; GUI_Track: string; AddRolls: number; }): Observable<ApiResponse<{ New_GUI_BegNo: string; New_GUI_EndNo: string; }>> {
    return this.http.post<ApiResponse<{ New_GUI_BegNo: string; New_GUI_EndNo: string; }>>(`${this.apiUrl}/queryPOS1017GUIBegNo_GUIEndNo`, params);
  }
}
