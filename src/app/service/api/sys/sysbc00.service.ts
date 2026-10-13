import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { IAps1004Data } from './sys1004.service';

/** 查詢條件介面 (querySYSBC00) */
export interface IQuerySysbc00Request {
  PageSize?: number;
  PageIndex?: number;
  OrderBy?: string; // 可選
  Offset?: number; // 可選
  SortBy?: SortMeta[]; // 可選
  BNK_No?: string; // 銀行代號
  BNK_Name?: string; // 銀行名稱
  BNK_ShortName?: string; // 銀行簡稱
}

/** APS1001 資料表的單筆資料介面 */
export interface ISysbc00Data {
  id: number;
  BNK_No: string;
  BNK_Name: string;
  BNK_ShortName: string;
  CRT_Date: string; // 日期時間字串
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string; // 日期時間字串
  UPD_USR_No: string;
  UPD_USR_Name: string;
  CanDel: boolean; // 是否可刪除
  details?: IAps1004Data[];
}

/** 新增資料介面 (insertSYSBC00) */
export interface IInsertSysbc00Request {
  BNK_No: string; // 銀行代號
  BNK_Name: string; // 銀行名稱
  BNK_ShortName: string; // 銀行簡稱
}

/** 更新資料介面 (updateSYSBC00) */
export interface IUpdateSysbc00Request {
  id: number; // 記錄 ID (用於識別要更新的記錄)
  BNK_No: string; // 銀行代號
  BNK_Name: string; // 銀行名稱
  BNK_ShortName: string; // 銀行簡稱
}

/** 刪除資料介面 (deleteSYSBC00) */
export interface IDeleteSysbc00Request {
  idList: number[]; // 要刪除的記錄 ID 列表
}

/** 匯入銀行資料預覽:新增銀行 */
export interface IImportBankItem {
  BNK_No: string;
  BNK_Name: string;
}

/** 匯入銀行資料預覽:分行明細 (Action: 新增/更新/無變更) */
export interface IImportBranchItem {
  BNK_No: string;
  BNK_BranchNo: string;
  BNK_BranchName: string;
  Action: '新增' | '更新' | '無變更';
  OldName: string | null;
}

/** 匯入銀行資料預覽:異常明細 */
export interface IImportAnomalyItem {
  LineNo: number;
  Type: string;
  Code: string;
  Name: string;
  Reason: string;
}

/** 匯入銀行資料預覽結果 (Success=false 時只看 Message) */
export interface IPreviewImportSysbc00 {
  Success: boolean;
  Message: string | null;
  FileName: string;
  PreviewId: string | null;
  Expired: boolean;
  TotalRows: number;
  SkippedRows: number;
  BankRows: number;
  BankExisting: number;
  BankNew: number;
  BankAnomalies: number;
  BranchRows: number;
  BranchNew: number;
  BranchUpdate: number;
  BranchUnchanged: number;
  BranchAnomalies: number;
  AnomalyCount: number;
  NewBanks: IImportBankItem[];
  Branches: IImportBranchItem[];
  Anomalies: IImportAnomalyItem[];
}

@Injectable({
  providedIn: 'root',
})
export class Sysbc00Service {
  private apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 APS1001 (銀行基本資料) 資料表
   * @param params 查詢條件
   * @returns 包含 ISysbc00Data 陣列的 API 響應
   */
  querySYSBC00(params: IQuerySysbc00Request): Observable<ApiResponse<ISysbc00Data[]>> {
    return this.http.post<ApiResponse<ISysbc00Data[]>>(`${this.apiUrl}/querySYSBC00`, params);
  }

  /**
   * 新增 APS1001 (銀行基本資料) 資料
   * @param data 要新增的銀行基本資料
   * @returns API 響應
   */
  insertSYSBC00(data: IInsertSysbc00Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertSYSBC00`, data);
  }

  /**
   * 更新 APS1001 (銀行基本資料) 資料
   * @param data 要更新的銀行基本資料，包含 ID
   * @returns API 響應
   */
  updateSYSBC00(data: IUpdateSysbc00Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateSYSBC00`, data);
  }

  /**
   * 刪除 APS1001 (銀行基本資料) 資料
   * @param idList 要刪除的記錄 ID 列表
   * @returns API 響應
   */
  deleteSYSBC00(idList: number[]): Observable<ApiResponse<any>> {
    // 根據 Swagger 範例，請求體需要是一個包含 idList 屬性的物件
    const body: IDeleteSysbc00Request = { idList: idList };
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/deleteSYSBC00`, body);
  }

  /**
   * 上傳金管會機構代號檔並預覽匯入結果 (不寫入 DB)
   * @param file 金管會下載的機構代號檔
   */
  previewImportSYSBC00(file: File): Observable<ApiResponse<IPreviewImportSysbc00>> {
    const formData = new FormData();
    formData.append('InputFile', file, file.name);
    return this.http.post<ApiResponse<IPreviewImportSysbc00>>(`${this.apiUrl}/previewImportSYSBC00`, formData);
  }

  /**
   * 由後端向金管會取得最新機構代號檔並預覽匯入結果 (網址由後端設定檔決定，不寫入 DB)
   */
  previewFscSYSBC00(): Observable<ApiResponse<IPreviewImportSysbc00>> {
    return this.http.post<ApiResponse<IPreviewImportSysbc00>>(`${this.apiUrl}/previewFscSYSBC00`, {});
  }

  /**
   * 以預覽時後端暫存的金管會檔案確認匯入 (逾時/不存在時 Expired=true)
   * @param previewId 預覽回傳的暫存識別碼
   */
  confirmFscSYSBC00(previewId: string): Observable<ApiResponse<IPreviewImportSysbc00>> {
    return this.http.post<ApiResponse<IPreviewImportSysbc00>>(`${this.apiUrl}/confirmFscSYSBC00`, { PreviewId: previewId });
  }

  /**
   * 捨棄金管會預覽暫存檔
   * @param previewId 預覽回傳的暫存識別碼
   */
  discardFscSYSBC00(previewId: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/discardFscSYSBC00`, { PreviewId: previewId });
  }

  /**
   * 重新上傳同一份檔案並確認匯入 (後端重新解析後單一交易寫入；Branches 不回傳)
   * @param file 金管會下載的機構代號檔
   */
  confirmImportSYSBC00(file: File): Observable<ApiResponse<IPreviewImportSysbc00>> {
    const formData = new FormData();
    formData.append('InputFile', file, file.name);
    return this.http.post<ApiResponse<IPreviewImportSysbc00>>(`${this.apiUrl}/confirmImportSYSBC00`, formData);
  }
}
