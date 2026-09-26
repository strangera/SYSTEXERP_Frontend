import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確

/** 查詢條件介面 (queryAPS1004) */
export interface IQueryAps1004Request {
  BNK_No: string; // 銀行代號 (查詢條件)
  PageSize?: number; // 分頁筆數，明細類資料一次撈全部不分頁時帶大值
}

/** APS1004 資料表的單筆資料介面 (響應數據) */
export interface IAps1004Data {
  id: number;
  BNK_No: string; // 銀行代號
  BNK_BranchNo: string; // 分行代碼
  BNK_BranchName: string; // 分行名稱
  ACC_LEN: number; // 帳號長度
  ACC_LEN_MAX: number; // 帳號最大長度
  CRT_Date: string; // 建立日期 (ISO 格式字串)
  CRT_USR_No: string; // 建立人員編號
  CRT_USR_Name: string; // 建立人員姓名
  UPD_Date: string; // 變更日期 (ISO 格式字串)
  UPD_USR_No: string; // 變更人員編號
  UPD_USR_Name: string; // 變更人員姓名
}

/** 新增更新資料介面 (updateAPS1004) */
export interface Aps1004Request {
  id?: number; // 記錄 ID
  BNK_No?: string; // 銀行代號
  BNK_BranchNo: string; // 分行代碼
  BNK_BranchName: string; // 分行名稱
  ACC_LEN: number; // 帳號長度
  ACC_LEN_MAX: number; // 帳號最大長度
}

/** 刪除資料介面 (deleteAPS1004) */
export interface IDeleteAps1004Request {
  idList: number[]; // 要刪除的記錄 ID 列表
}

// --- 服務定義 ---

@Injectable({
  providedIn: 'root',
})
export class Sys1004Service {
  private apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 APS1004 (銀行分行基本資料) 資料表
   * @param params 查詢條件
   * @returns 包含 IAps1004Data 陣列的 API 響應
   */
  queryAPS1004(params: IQueryAps1004Request): Observable<ApiResponse<IAps1004Data[]>> {
    return this.http.post<ApiResponse<IAps1004Data[]>>(`${this.apiUrl}/queryAPS1004`, params);
  }

  /**
   * 新增 APS1004 (銀行分行基本資料) 資料
   * @param data 要新增的銀行分行基本資料
   * @returns API 響應
   */
  insertAPS1004(data: Aps1004Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertAPS1004`, data);
  }

  /**
   * 更新 APS1004 (銀行分行基本資料) 資料
   * @param data 要更新的銀行分行基本資料，包含 ID
   * @returns API 響應
   */
  updateAPS1004(data: Aps1004Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateAPS1004`, data);
  }

  /**
   * 刪除 APS1004 (銀行分行基本資料) 資料
   * @param idList 要刪除的記錄 ID 列表
   * @returns API 響應
   */
  deleteAPS1004(idList: number[]): Observable<ApiResponse<number>> {
    // 根據 Swagger 範例，請求體需要是一個包含 idList 屬性的物件
    const body: IDeleteAps1004Request = { idList: idList };
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteAPS1004`, body);
  }
}
