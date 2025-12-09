import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Query request interface for TLS53010
export interface TLS53010QueryRequest extends BaseQueryRequest {
  PST_No?: string;              // 盤點單編號:C+倉別+YYYYMM+SSSS
  HOS_No?: string[];             // 倉別代碼 (陣列)
  LOGO_No?: string[];           // 品牌代碼 (陣列)
  PST_DateStart: string;        // 盤點基準日期(起) - ISO 8601 格式 - 必填
  PST_DateEnd: string;          // 盤點基準日期(迄) - ISO 8601 格式 - 必填
  PST_Status?: string[];        // 盤點狀態 (陣列)
}

// Detail query request interface for TLS53010
export interface TLS53010DetailQueryRequest {
  MID: number;                  // 商戶編號 - 必填
  PST_No: string;               // 盤點編號:C+倉別+YYYYMM+SSSS - 必填
  SYS_StoreNo: string;          // 公司編號/店號 - 必填
  HOS_No: string;               // 倉別代碼 - 必填
}

// Insert request interface for TLS53010 (新增全品項)
export interface TLS53010InsertRequest {
  HOS_No: string;               // 倉別代碼 - 必填
  LOGO_No: string;              // 品牌代碼 - 必填
  PST_Date: string;             // 盤點基準日期 - 必填
  PST_Remark?: string;          // 盤點備註
}

// POS2004 商品資料介面
export interface POS2004Info {
  id?: number;                  // id
  PLU_MagNo?: string;      // 商品管理編號
  PLU_No?: string;         // 國際條碼
  PLU_Unit?: string;       // 單位代碼
  UNIT_NAME?: string;      // 單位名稱
  PLU_BoxQty?: number;     // 包裝入數
  PLU_Name?: string;       // 商品名稱
  PLU_PageNum?: string;    // 棚割編號
  PLU_LocNo?: number;      // 棚割序號
}

// Insert manual request interface for TLS53010 (手動新增品項)
export interface TLS53010InsertManualRequest {
  HOS_No: string;               // 倉別代碼 - 必填
  LOGO_No: string;              // 品牌代碼 - 必填
  PST_Date: string;             // 盤點基準日期 - 必填
  PST_Remark?: string;          // 盤點備註
  POS2004List: POS2004Info[];   // 商品管理編號清單 - 必填
}

// Data result interface for TLS53010 (盤點單資料)
export interface TLS53010Data {
  id: number;                   // id
  MID: number;                  // 商戶編號
  PST_No: string;               // 盤點單編號:C+倉別+YYYYMM+SSSS
  SYS_StoreNo: string;          // 公司編號/店號
  HOS_No: string;               // 倉別代碼
  HOS_NAME: string;             // 倉庫名稱
  LOGO_No: string;              // 品牌代碼
  LOGO_CH_NAME: string;         // 品牌中文名稱
  PST_Date: string;             // 盤點基準日期
  PST_Status: string;           // 盤點狀態:0盤點單開立,待盤點，1初盤,盤點中 2複盤,盤點完成 3抽盤,小盤結案 4已結案 9作廢
  PST_Remark: string;           // 盤點備註
  CRT_Date: string;             // 建立日期
  CRT_USR_No: string;           // 建立人
  CRT_USR_Name: string;         // 建立人員名稱
  UPD_Date: string;             // 變更日期
  UPD_USR_No: string;           // 變更人員
  UPD_USR_Name: string;         // 變更人員名稱
}

// Detail data result interface for TLS53010 (盤點單明細資料)
export interface TLS53010DetailData {
  id: number;
  LOGO_No: string;
  LOGO_CH_NAME: string;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Name: string;
  CAT_LNo: string;
  CAT_LName: string;
  CAT_MNo: string;
  CAT_MName: string;
  CAT_SNo: string;
  CAT_SName: string;
  PLU_Attribute: string;
  PLU_AttributeName: string;
  PLU_SalePrc: number;      // 修正型別
  HOS_No: string;
  HOS_NAME: string;
  PLU_Unit: string;         // 新增
  PLU_BoxQty: number;       // 新增
  PLU_PageNum: string;      // 新增
  PLU_LocNo: number;        // 新增
}

// Update request interface for TLS53010 (更新盤點單)
export interface TLS53010UpdateRequest {
  POS2033M_ID: number;          // POS2033M ID - 必填
  PST_No: string;               // 盤點單編號 - 必填
  PST_Date: string;             // 盤點基準日期 - ISO 8601 格式 - 必填
  PST_Remark?: string;          // 盤點備註
  POS2004List: {
    PLU_MagNo: string;              // 商品管理編號 - 必填
    PLU_No: string;                 // 國際條碼 - 必填
    PLU_Unit?: string;              // 單位代碼
    PLU_BoxQty?: number;            // 包裝入數
    PLU_Name?: string;              // 商品名稱
    PLU_PageNum?: string;           // 棚割編號
    PLU_LocNo?: number;             // 棚割序號
    POS2033_ID?: number;            // POS2033_ID
    Action: "I" | "U" | "D";        // "I"=新增, "U"=更新, "D"=刪除
  }[];
}

// 查詢POS2004資料表 Request
export interface QueryTLS53010POS2004Request extends BaseQueryRequest {
  LOGO_No: string;         // 品牌代碼 (必填)
  PLU_MagNo?: string;      // 商品管理編號
  PLU_Name?: string;       // 商品名稱
  CAT_LNo?: string;        // 大分類代碼
  CAT_MNo?: string;        // 中分類代碼
  CAT_SNo?: string;        // 小分類代碼
}

@Injectable({
  providedIn: 'root'
})
export class TLS53010Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS5000';

  constructor(private http: HttpClient) { }

  // 查詢盤點單
  queryTLS53010(data: TLS53010QueryRequest): Observable<BaseQueryResponse<TLS53010Data>> {
    return this.http.post<BaseQueryResponse<TLS53010Data>>(`${this.apiUrl}/queryTLS53010`, data);
  }

  // 新增盤點單 (新增全品項)
  insertTLS53010(data: TLS53010InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS53010`, data);
  }

  // 新增盤點單 (手動新增品項)
  insertTLS53010Manual(data: TLS53010InsertManualRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS53010_Manual`, data);
  }

  // 更新盤點單 (更新POS2033M、POS2032資料)
  updateTLS53010(data: TLS53010UpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS53010`, data);
  }

  // 匯出商品基本資料
  exportTLS53010Detail(data: TLS53010DetailQueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/exportTLS53010Detail`,
      data,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  // 列印盤點單
  printTLS53010(data: TLS53010DetailQueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.apiUrl}/printTLS53010`,
      data,
      {
        observe: 'response',
        responseType: 'blob'
      }
    );
  }

  // 查詢POS2004資料表
  queryTLS53010POS2004(data: QueryTLS53010POS2004Request): Observable<BaseQueryResponse<POS2004Info>> {
    return this.http.post<BaseQueryResponse<POS2004Info>>(`${this.apiUrl}/queryTLS53010_POS2004`, data);
  }

  // 查詢盤點單明細
  queryTLS53010Detail(data: TLS53010DetailQueryRequest): Observable<ApiResponse<TLS53010DetailData[]>> {
    return this.http.post<ApiResponse<TLS53010DetailData[]>>(`${this.apiUrl}/queryTLS53010_Detail`, data).pipe(
      map(res => {
        // 返回新的響應對象，使用處理過的 Data
        return {
          ...res,
          Data: res.Data // 將處理過的 Data 重新賦值
        } as ApiResponse<TLS53010DetailData[]>; // 使用斷言確保類型匹配
      })
    );
  }
}
