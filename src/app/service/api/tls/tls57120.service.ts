import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

/**
 * 滯銷品分析 請求參數
 */
export interface QueryTLS57120Request {
  /** 顯示方式 M: 彙總, D: 明細 */
  ShowType: QueryTLS57120ShowType;
  /** 基準月份 (YYYYMM) */
  BaseYM: string;
  /** 倉別代碼 */
  HOS_NO?: string;
  /** 品牌代碼 */
  LOGO_No?: string;
  /** 日期範圍(起) */
  DateFrom?: string;
  /** 日期範圍(訖) */
  DateTo?: string;
  /** 期間天數 */
  PeriodDays?: number;
  /** 分頁索引 */
  PageIndex: number;
  /** 分頁大小 */
  PageSize: number;
  /** 排序 */
  SortBy?: SortMeta[];
  /** 排序欄位 (可選) */
  OrderBy?: string;
  /** 偏移量 (可選) */
  Offset?: number;
}

/**
 * 滯銷品分析 統一資料模型
 * 彙總和明細共用此介面
 */
export interface QueryTLS57120DataItem {
  /** 品牌名稱 */
  LOGO_NAME: string;
  /** 商品管理編號 (明細模式) */
  PLU_MagNo?: string;
  /** 品名 (明細模式) */
  PLU_Name?: string;
  /** 國際條碼 (明細模式) */
  PLU_NO?: string;
  /** 廠商貨號 (明細模式) */
  PLU_OrgPLUNo?: string;
  /** 售價 (明細模式) */
  PLU_SalePrc?: number;
  /** 平均成本 */
  STK_UnitCost?: number;
  /** 期末數量 (彙總模式使用 TOT_STK_CurrentQty) */
  TOT_STK_CurrentQty?: number;
  /** 期末成本 (彙總模式使用 TOT_STK_CurrentCost) */
  TOT_STK_CurrentCost?: number;
  /** 庫存成本 */
  StockCost?: number;
  /** 成本佔比 (字串格式，如 "21.33%") */
  CostPercentage?: string;
  /** 最近銷貨日期 (明細模式) */
  MAX_SALE_DATE?: string;
  /** 總計筆數 (每筆資料中的欄位) */
  TotalCount?: number;
}

/**
 * 滯銷品分析 回傳資料模型
 */
export interface QueryTLS57120Response {
  /** 資料陣列 (API 會根據 Request 的 ShowType 自動回傳對應資料) */
  Datas: QueryTLS57120DataItem[];
  /** 總計資料 (單一物件) */
  SumData: QueryTLS57120DataItem;
}

/**
 * 彙總資料型別 (向後相容)
 */

/** 顯示方式
 * 彙總 = `M`
 * 明細 = `D`
 */
export enum QueryTLS57120ShowType {
  /** 彙總 */
  Summary = 'M',
  /** 明細 */
  Detail = 'D',
}

interface QueryTLS57120TableReportDataItem {
  Data: QueryTLS57120DataItem[];
  TotalCount: number;
  TotalData: QueryTLS57120DataItem | null;
}

@Injectable({
  providedIn: 'root'
})
export class Tls57120Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  /**
   * 查詢滯銷品分析資料的 API 呼叫
   * @param body 查詢請求物件
   * @returns 查詢結果
   */
  queryTLS57120(body: QueryTLS57120Request): Observable<QueryTLS57120TableReportDataItem> {
    const url = `${this.apiUrl}/queryTLS57120`;
    return this.http.post<ApiResponse<QueryTLS57120Response>>(url, body).pipe(
      map(res => {
        const apiData = res.Data;
        if (!apiData) {
          return {
            Data: [],
            TotalCount: 0,
            TotalData: null,
          };
        }

        // API 會根據 Request 的 ShowType 自動回傳對應資料，無需過濾
        return {
          Data: apiData.Datas || [],
          TotalCount: res.TotalCount || 0,
          TotalData: apiData.SumData || null,
        };
      })
    );
  }

  /**
   * 匯出滯銷品分析報表 PDF
   * POST /TLS0000/TLS5000/exportTLS57120PDF
   * @param body 查詢請求物件
   * @returns 包含匯出 PDF 檔案的 Blob 物件 (帶有完整的 HttpResponse)
   */
  exportTLS57120PDF(body: QueryTLS57120Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57120PDF`;
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }

  /**
   * 匯出滯銷品分析報表 Excel
   * POST /TLS0000/TLS5000/exportTLS57120
   * @param body 查詢請求物件
   * @returns 包含匯出 Excel 檔案的 Blob 物件 (帶有完整的 HttpResponse)
   */
  exportTLS57120(body: QueryTLS57120Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportTLS57120`;
    return this.http.post(url, body, { observe: 'response', responseType: 'blob' });
  }
}
