import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SortMeta } from 'primeng/api';
import { ApiResponse } from '../../system/auth.service';

// --- 1.2 預付帳款系統(費率對照維護作業-FIN21020) ---

/** 查詢 BankServiceRate 資料表條件介面 (queryFIN21020) */
export interface IQueryFin21020Request {
  PageSize?: number;
  PageIndex?: number;
  SortBy?: SortMeta[];
  BNK_No?: string;
  Remit_BAmount_Start?: number;
  Remit_BAmount_End?: number;
  Remit_UAmount_Start?: number;
  Remit_UAmount_End?: number;
  Remit_Fee?: number;
  Comp_Remit_Fee?: number;
  Cash_Back_Amt?: number;
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
  Remit_BAmount?: number;
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
}
