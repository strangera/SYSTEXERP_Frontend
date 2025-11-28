import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// -----------------------------------------------------
// 1. Request Body Models
// -----------------------------------------------------

// 查詢 Request
// 註：您的後端 QueryFIN62010Request 可能繼承了分頁排序的基底類別 (QueryBase)，這裡僅列出查詢特定欄位
export interface QueryFIN62010Request {
  Tran_No: string;
  Tran_Date_Start: string | Date | null;
  Tran_Date_End: string | Date | null;
  CRT_Date_Start: string | Date | null;
  CRT_Date_End: string | Date | null;
  BNK_No_In: string;
  BNK_No_Out: string;
  // 假定還有分頁和排序欄位，例如:
  // PageIndex: number;
  // PageSize: number;
  // SortBy: { field: string, order: number }[];
}

// 新增/修改 Request (根據 Swagger Schema)
export interface UpsertFIN62010Request {
  ID: number;
  Tran_No: string; // 新增時可為空或由後端產生，修改時必填
  BNK_No_In: string;
  BNK_No_Out: string;
  Tran_Amt: number;
  Fee_Amt: number;
  Remark: string;
  Tran_Date: string | Date; // 使用 ISO 格式字串或 Date 物件
  // mid/VouNo/Tran_Status 等欄位通常由後端處理，前端只需傳入必要資料
}

// 刪除 Request
export interface DeleteFIN62010Request {
  IdList: number[];
}

// 獲取手續費 Request
export interface GetRemitFeeRequest {
  BNK_No: string;
  Remit_Amount: number;
}

// -----------------------------------------------------
// 2. Response Data Models
// -----------------------------------------------------

// 查詢 Response (單筆資料結構)
export interface QueryFIN62010Response {
  ID: number;
  mid: number; // 修正大小寫以符合後端 Model
  Tran_No: string;
  BNK_No_In: string;
  BNK_No_In_AccName: string; // 來自 JOIN APS1002
  BNK_No_Out: string;
  BNK_No_Out_AccName: string; // 來自 JOIN APS1002
  Tran_Amt: number;
  Fee_Amt: number;
  Remark: string;
  VouNo: string;
  Tran_Date: string;
  Tran_Status: string;
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// 獲取手續費 Response.Data 結構
export interface GetRemitFeeData {
  Remit_Fee: number;
}

// -----------------------------------------------------
// 3. Service Implementation
// -----------------------------------------------------

@Injectable({
  providedIn: 'root'
})
export class Fin62010Service {
  // 後端 API 的基礎路徑
  private readonly baseUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(
    private readonly http: HttpClient
  ) { }

  /**
   * 1. 查詢 APS4001 銀行調撥資料 (包含分頁總數)
   * @param data 查詢條件 (QueryFIN62010Request + QueryBase)
   * @returns 包含資料列表和總筆數的結果 (ApiResponse<QueryFIN62010Response[]>)
   */
  queryFIN62010(data: QueryFIN62010Request): Observable<ApiResponse<QueryFIN62010Response[]>> {
    // 傳入的 data 應該包含 QueryBase 的分頁與排序參數
    return this.http.post<ApiResponse<QueryFIN62010Response[]>>(`${this.baseUrl}/queryFIN62010`, data);
  }

  /**
   * 2. 新增 APS4001 銀行調撥資料
   * @param data 新增資料 (UpsertFIN62010Request)
   * @returns 成功或錯誤訊息 (ApiResponse<string>)
   */
  insertFIN62010(data: UpsertFIN62010Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/insertFIN62010`, data);
  }

  /**
   * 3. 修改 APS4001 銀行調撥資料
   * @param data 修改資料 (UpsertFIN62010Request，ID 必填)
   * @returns 成功或錯誤訊息 (ApiResponse<string>)
   */
  updateFIN62010(data: UpsertFIN62010Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/updateFIN62010`, data);
  }

  /**
   * 4. 刪除 APS4001 銀行調撥資料
   * @param data 欲刪除的 ID 列表 (DeleteFIN62010Request)
   * @returns 成功或錯誤訊息 (ApiResponse<string>)
   */
  deleteFIN62010(data: DeleteFIN62010Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/deleteFIN62010`, data);
  }

  /**
   * 5. 讀取 BankServiceRate 取得 Remit_Fee (轉帳手續費)
   * @param data 轉出銀行代碼與轉帳金額 (GetRemitFeeRequest)
   * @returns 包含 Remit_Fee 的結果 (ApiResponse<GetRemitFeeData>)
   */
  getRemitFee(data: GetRemitFeeRequest): Observable<ApiResponse<GetRemitFeeData>> {
    return this.http.post<ApiResponse<GetRemitFeeData>>(`${this.baseUrl}/getRemitFee`, data);
  }
}
