import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

// 針對 queryTLS21030 的請求介面
export interface TLS21030QueryRequest {
  money_type?: string; // 結帳方式 10=十日結、15=半月結、30=月結
  term_no?: number; // 帳次
  rece_yn?: string; // 是否使用業主發票 (Y=是、N=否)
  bill_remark?: string; // 說明 存為html格式
  tlt_noList?: string[]; // 專櫃編號列表
}

// 針對 queryTLS21030_Detail 的請求介面
export interface TLS21030DetailQueryRequest {
  BILL_NOTES_id?: number; // 對帳單備註主鍵 ID
}

// 針對 queryTLTTALENT_By_money_type 的請求介面
export interface TLS21030TalentByMoneyTypeRequest {
  money_type?: string; // 結帳方式 10=十日結、15=半月結、30=月結
  rece_yn?: string; // 是否使用業主發票 (Y=是、N=否)
  tlt_no?: string; // 專櫃編號
}

// 針對 insertTLS21030 的請求介面
export interface TLS21030InsertRequest {
  money_type: string; // 結帳方式 10=十日結、15=半月結、30=月結
  term_no: number; // 帳次
  rece_yn: string; // 是否使用業主發票 (Y=是、N=否)
  bill_remark1?: string; // 說明1 存為html格式
  bill_remark2?: string; // 說明2 存為html格式
  bill_remark3?: string; // 說明3 存為html格式
  TALTALENT_BILL_NOTES_DETAILDetails?: {
    talent_id: number;
    tlt_no: string;
    tlt_name: string;
  }[];
}

// 針對 updateTLS21030 的請求介面
export interface TLS21030UpdateRequest {
  ID: number; // 主鍵 ID
  money_type: string; // 結帳方式 10=十日結、15=半月結、30=月結
  term_no: number; // 帳次
  rece_yn: string; // 是否使用業主發票 (Y=是、N=否)
  bill_remark1?: string; // 說明1 存為html格式
  bill_remark2?: string; // 說明2 存為html格式
  bill_remark3?: string; // 說明3 存為html格式
  TALTALENT_BILL_NOTES_DETAILDetails?: {
    talent_id: number;
    tlt_no: string;
    tlt_name: string;
    ID?: number; // 明細 ID (更新時使用)
    BILL_NOTES_id?: number; // 對帳單備註主鍵 ID (更新時使用)
  }[];
}

// 針對 deleteTLS21030 的請求介面
export interface TLS21030DeleteRequest {
  idList: number[];
}


export interface TLS21030Data {
  id: number; // 主鍵 ID
  mid: number;
  money_type: string; // 結帳方式 10=十日結、15=半月結、30=月結
  term_no: number; // 帳次 Default: 1
  rece_yn: string; // 是否使用業主發票 (Y=是、N=否)
  bill_remark1: string; // 說明1 存為html格式
  bill_remark2: string; // 說明2 存為html格式
  bill_remark3: string; // 說明3 存為html格式
  CRT_Date: string; // 建立日期
  CRT_USR_No: string; // 建立人員
  CRT_USR_Name: string; // 建立人員名稱
  UPD_Date: string; // 更新日期
  UPD_USR_No: string; // 更新人員
  UPD_USR_Name: string; // 更新人員名稱
  CanDel: boolean; // 是否可以刪除
}

export interface TLS21030DetailData {
  id: number;
  mid: number;
  BILL_NOTES_id: number;
  talent_id: number;
  tlt_no: string;
  tlt_name: string;
}

export interface TLS21030TalentData {
  id?: number;
  talent_id: number;
  tlt_no: string;
  tlt_name: string;
}

@Injectable({
  providedIn: 'root',
})
export class Tls21030Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢對帳單備註資料
   * 查詢 TALTALENT_BILL_NOTES 資料表
   * @param params 查詢條件
   * @returns 包含 TLS21030Data 陣列的 API 響應
   */
  queryTLS21030(params: TLS21030QueryRequest): Observable<ApiResponse<TLS21030Data[]>> {
    return this.http.post<ApiResponse<TLS21030Data[]>>(`${this.apiUrl}/queryTLS21030`, params);
  }

  /**
   * 查詢對帳單備註明細資料
   * 查詢 TALTALENT_BILL_NOTES 資料表
   * @param params 查詢條件，包含 BILL_NOTES_id
   * @returns 包含 TLS21030DetailData 陣列的 API 響應
   */
  queryTLS21030Detail(params: TLS21030DetailQueryRequest): Observable<ApiResponse<TLS21030DetailData[]>> {
    return this.http.post<ApiResponse<TLS21030DetailData[]>>(`${this.apiUrl}/queryTLS21030_Detail`, params);
  }

  /**
   * 依結帳方式取得專櫃編號
   * @param params 查詢條件
   * @returns 包含 TLS21030TalentData 陣列的 API 響應
   */
  queryTLTTALENT_By_money_type(params: TLS21030TalentByMoneyTypeRequest): Observable<ApiResponse<TLS21030TalentData[]>> {
    return this.http.post<ApiResponse<TLS21030TalentData[]>>(`${this.apiUrl}/queryTLTTALENT_By_money_type`, params);
  }

  /**
   * 新增對帳單備註資料
   * @param data 包含對帳單備註資料
   * @returns API 響應
   */
  insertTLS21030(data: TLS21030InsertRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertTLS21030`, data);
  }

  /**
   * 更新對帳單備註資料
   * @param data 包含對帳單備註資料
   * @returns API 響應
   */
  updateTLS21030(data: TLS21030UpdateRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateTLS21030`, data);
  }

  /**
   * 刪除對帳單備註資料
   * @param ids 要刪除的 ID 陣列
   * @returns API 響應
   */
  deleteTLS21030(ids: number[]): Observable<ApiResponse<any>> {
    const body: TLS21030DeleteRequest = { idList: ids };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteTLS21030`, body);
  }
}
