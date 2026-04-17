import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface QueryTLS27040Request {
  PageSize: number;
  PageIndex: number;
  SortBy: SortMeta[];
  tableNameList: string[]; // 新增，用於指定查詢的表格
  ECR_No: string;
  TXN_No: string;
  TLT_No: string;
  TxnTypeList: string[]; // 合併了 NCML_TxnTypeList 和 CTBC_TxnTypeList
  PayCrdTypeList: string[]; // 合併了 NCML_PayCrdTypeList (原 CTBC_TxnCodeList 應更名為 TxnTypeList)
  TxnAmt_Start: number; // 從 string 改為 number (根據 Swagger 範例)
  TxnAmt_End: number; // 從 string 改為 number (根據 Swagger 範例)
  TxnDate_Start: string; // 合併了多個日期開始欄位
  TxnDate_End: string; // 合併了多個日期結束欄位
  TxnTime_Start: string;
  TxnTime_End: string;
  CrdNo: string;
  TmID: string;
  BatCloseDate_Start: string; // 用於聯合(NCML)
  BatCloseDate_End: string; // 用於聯合(NCML)
  CrdTxnFgList: string[];
  CheckList: string[];
  ApprovalCode: string;
  TermNoList: string[];
  radioBtn: string;
}

// --- 新版查詢響應數據介面 (合併後的資料結構) ---
export interface TLS27040Data {
  ID: number;
  MID: string; // 原本有 number, 現在 Swagger 範例是 string
  ECR_No: string;
  TXN_No: string; // 原本有 number, 現在 Swagger 範例是 string
  TLT_No: string;
  CRD_Type: string;
  CRD_Type_Name: string;
  PayCrdType: string;
  TxnAmt: number;
  AccTxnDate: Date; // 帳務日期
  TxnDate: Date;
  TXN_Date: Date;
  TxnTime: string;
  ReqDate: string;
  CrdNo: string;
  TmID: string;
  ApprovalCode: string;
  TxnType: string;
  CrdTxnFg: string;
  EntryFg: string;
  EntryFg_Name: string;
  CheckStatus: string; // 可能是 Check 的別名
  TermNo: string; // 原本有 number | string, 現在 Swagger 範例是 string
  acquiring_Bank: string;
  FileName: string;
  CRT_USR_No: string;
  CRT_Date: string;
  UPD_USR_No: string;
  UPD_Date: string;
  BatCloseDate: string; // 聯合(NCML) 使用
  tableName: string; // 新增，用於標識資料來源表
  isClose: string; // 已關帳=Y,未關帳=N Y時不可編輯
  Check_Status: string;
}

export interface TotalData {
  group_name: string; // 統計名稱 (通常是 "總計")
  TxnAmt: number; // 金額總和
}

// --- 新增請求介面 for 刪除 API ---
export interface DeleteItem {
  id: number;
  tableName: string;
}

export interface DeleteTLS27040Request {
  selectList: DeleteItem[]; // 根據 Swagger 範例，原 deleteTLS27040 的 body 已變更
}

export interface POS6118Insert {
  NCML_Date: string,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  NCML_PayCrdType: string,
  NCML_TxnType: string,
  NCML_TxnAmt: number,
  NCML_CrdNo: string,
  NCML_TmID: string,
  NCML_BatCloseDate: string,
  NCML_TxnDate: string,
  NCML_ApprovalCode: string,
  NCML_Check: string,
  NCML_CrdTxnFg: string,
  NCML_TermNo: number | string,
  NCML_TxnTime: string
}

export interface POS6119Insert {
  CTBC_Date: string,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  CTBC_DataType: string,
  CTBC_TxnTime: string,
  CTBC_CrdNo: string,
  CTBC_TmID: string,
  CTBC_TxnCode: string,
  CTBC_TxnAmt: number,
  CTBC_PayDate: string,
  CTBC_ApprovalCode: string,
  CTBC_Check: string,
  CTBC_TermNo: number | string,
}

export interface POS6119PInsert {
  CTBC_Date: string,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  CTBC_CrdNo: string,
  CTBC_TxnDate: string,
  CTBC_TxnAmt: number,
  CTBC_TxnType: string,
  CTBC_PayDate: string,
  CTBC_TmID: string,
  CTBC_ApprovalCode: string,
  CTBC_Check: string,
}

export interface POS6118Update {
  ID: number,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  NCML_Date: string,
  NCML_PayCrdType: string,
  NCML_TxnType: string,
  NCML_TxnAmt: number,
  NCML_CrdNo: string,
  NCML_TmID: string,
  NCML_BatCloseDate: string,
  NCML_TxnDate: string,
  NCML_ApprovalCode: string,
  NCML_Check: string,
  NCML_CrdTxnFg: string,
  NCML_TermNo: number | string,
  NCML_TxnTime: string
}

export interface POS6118HUpdate {
  ID: number,
  ECR_No: string,
}

export interface POS6119Update {
  ID: number,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  CTBC_Date: string,
  CTBC_TxnTime: string,
  CTBC_PayDate: string,
  CTBC_TermNo: number | string,
  CTBC_DataType: string,
  CTBC_CrdNo: string,
  CTBC_TmID: string,
  CTBC_TxnCode: string,
  CTBC_TxnAmt: number,
  CTBC_ApprovalCode: string,
  CTBC_Check: string
}

export interface POS6119PUpdate {
  ID: number,
  ECR_No: string,
  TXN_No: number,
  TLT_No: string,
  CTBC_CrdNo: string,
  CTBC_Date: string,
  CTBC_TxnDate: string,
  CTBC_TxnAmt: number,
  CTBC_TxnType: string,
  CTBC_PayDate: string,
  CTBC_TmID: string,
  CTBC_ApprovalCode: string,
  CTBC_Check: string
}

@Injectable({
  providedIn: 'root'
})
export class TLS27040Service {

  private readonly apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 實收信用卡調整作業 (統一查詢)
   */
  queryTLS27040(body: QueryTLS27040Request): Observable<ApiResponse<TLS27040Data[], TotalData[]>> {
    return this.http.post<ApiResponse<TLS27040Data[], TotalData[]>>(`${this.apiUrl}/queryTLS27040`, body).pipe(
      map(res => {
        // 處理 Data 陣列，添加 dataKey
        const mappedData = res.Data.length > 0 ? res.Data.map(item => ({
          ...item,
          dataKey: item.ID + item.tableName
        })) : [];

        // 返回新的響應對象，使用處理過的 Data
        return {
          ...res,
          Data: mappedData // 將處理過的 Data 重新賦值
        } as ApiResponse<TLS27040Data[], TotalData[]>; // 使用斷言確保類型匹配
      })
    );
  }

  // --- 新增 API (保持不變) ---
  /**
   * 新增 POS6118（聯合 - 實收信用卡調整作業）
   */
  insertPOS6118(body: POS6118Insert): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertPOS6118`, body);
  }

  /**
   * 新增 POS6119（中信 - 實收信用卡調整作業）
   */
  insertPOS6119(body: POS6119Insert): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertPOS6119`, body);
  }

  /**
   * 新增 POS6119P（中信停車場 - 實收信用卡調整作業）
   */
  insertPOS6119P(body: POS6119PInsert): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertPOS6119P`, body);
  }

  // --- 刪除 API (更新請求介面) ---
  /**
   * 刪除資料 (更新請求體結構)
   */
  deleteTLS27040(body: DeleteTLS27040Request): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteTLS27040`, body);
  }

  // 檢核能否新增
  queryInsCheck(body: {
    SYS_StoreNo: string,
    ECR_No: string,
    TXN_No: string,
    TXN_Date: string,
    tableName: string
  }): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/queryInsCheck`, body);
  }

  // --- 更新 API (保持不變) ---
  /**
   * 更新 POS6118
   */
  updatePOS6118(body: POS6118Update): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updatePOS6118`, body);
  }

  /**
  * 更新 POS6118H
  */
  updatePOS6118H(body: POS6118HUpdate): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updatePOS6118H`, body);
  }

  /**
   * 更新 POS6119
   */
  updatePOS6119(body: POS6119Update): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updatePOS6119`, body);
  }

  /**
   * 更新 POS6119P
   */
  updatePOS6119P(body: POS6119PUpdate): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updatePOS6119P`, body);
  }

  /**
   *  根據 Swagger 新增：實收信用卡 - 匯出 Excel
   * POST /TLS0000/TLS2000/exportTLS27040Excel
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 Excel 檔案的 Blob 物件 (HttpResponse<Blob>)
   */
  exportTLS27040Excel(
    body: QueryTLS27040Request
  ): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS27040Excel`;
    return this.http.post(
      url,
      body,
      {
        observe: 'response',
        responseType: 'blob' // 預期回傳檔案的 Blob 格式
      }
    );
  }

  /**
   *  根據 Swagger 新增：實收信用卡 - 匯出 PDF
   * POST /TLS0000/TLS2000/exportTLS27040PDF
   * @param body 包含查詢條件、分頁和排序資訊的請求主體。
   * @returns 包含 PDF 檔案的 Blob 物件 (HttpResponse<Blob>)
   */
  exportTLS27040PDF(
    body: QueryTLS27040Request
  ): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS27040PDF`;
    return this.http.post(
      url,
      body,
      {
        observe: 'response',
        responseType: 'blob' // 預期回傳檔案的 Blob 格式
      }
    );
  }
}
