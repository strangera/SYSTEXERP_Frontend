import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// --- 1.2 預付帳款系統(費率對照維護作業-FIN21020) ---

/** 查詢 BankServiceRate 資料表條件介面 (queryFIN21020) */
export interface IQueryFin21020Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  BNK_No?: string | null;
  Remit_BAmount_Start?: number | null;
  Remit_BAmount_End?: number | null;
  Remit_UAmount_Start?: number | null;
  Remit_UAmount_End?: number | null;
  Remit_Fee?: number | null;
  Comp_Remit_Fee?: number | null;
  Cash_Back_Amt?: number | null;
}

/** BankServiceRate 資料表的單筆資料介面 */
export interface IFin21020Data {
  id: number;
  mid: number;
  BNK_No: string;
  Remit_BAmount: number;
  Remit_UAmount?: number;
  Remit_Fee?: number;
  Finance_Fee?: number;
  Fax_Fee?: number;
  Comp_Remit_Fee?: number;
  Cash_Back_Amt?: number;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
}

export interface IFin21020Detail {
  id?: number;
  mid?: number;
  BNK_No?: string;
  Remit_BAmount: number;
  Remit_UAmount: number;
  Remit_Fee: number;
  Comp_Remit_Fee: number;
  Cash_Back_Amt: number;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string;
  UPD_USR_No?: string;
  UPD_USR_Name?: string;
  [key: string]: any;
}

export interface InsertFIN21020Request {
  BNK_No: string,
  Details: {
    Remit_BAmount: number,
    Remit_UAmount: number,
    Remit_Fee: number,
    Comp_Remit_Fee: number,
    Cash_Back_Amt: number,
  }[],
}

// 新增介面：用於更新操作的請求主體
export interface UpdateFIN21020Request {
  id?: number
  BNK_No: string,
  Details: {
    id?: number
    Remit_BAmount: number,
    Remit_UAmount: number,
    Remit_Fee: number,
    Comp_Remit_Fee: number,
    Cash_Back_Amt: number,
  }[],
}

export interface ICopyFin21020Request {
  sourceBnkNo: string;
  targetBnkNos: string[];
}

@Injectable({
  providedIn: 'root',
})
export class Fin21020Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/FIN2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 BankServiceRate 資料表
   * @param params 查詢條件
   * @returns 包含 IFin21020Data 陣列的 API 響應
   */
  queryFIN21020(params: IQueryFin21020Request): Observable<ApiResponse<IFin21020Data[]>> {
    return this.http.post<ApiResponse<IFin21020Data[]>>(`${this.apiUrl}/queryFIN21020`, params);
  }

  insertFIN21020(params: InsertFIN21020Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertFIN21020`, params);
  }

  /**
   * 新增 API 方法：根據 BNK_No 查詢資料
   * @param bnkNo 銀行科目代號
   * @returns 包含 IFin21020Detail 陣列的 API 響應
   */
  queryByBnkNo(bnkNo: string): Observable<ApiResponse<IFin21020Detail[]>> {
    // 依照後端 API 的格式，將 bnkNo 封裝成 JSON 物件傳送
    return this.http.post<ApiResponse<IFin21020Detail[]>>(`${this.apiUrl}/queryByBnkNo`, { BNK_No: bnkNo });
  }

  /**
   * 新增 API 方法：更新 BankServiceRate 資料表
   * @param params 包含要新增、更新和刪除的資料
   * @returns 包含更新是否成功的 API 響應
   */
  updateFIN21020(params: UpdateFIN21020Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateFIN21020`, params);
  }

  /**
   * 刪除 API 方法：根據 BNK_No 刪除資料
   * @param bnkNos 銀行科目代號
   * @returns 包含刪除是否成功的 API 響應
   */
  deleteFIN21020(bnkNos: string[]): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/deleteFIN21020`, { BnkNos: bnkNos });
  }

  /**
    * 複製費率資料
    * @param request 包含來源和目標BNK_No的請求物件
    * @returns 包含操作是否成功的 API 響應
    */
  copyFIN21020(request: ICopyFin21020Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/copyFIN21020`, request);
  }
}
