import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response'; // 請確認你的 ApiResponse 介面路徑是否正確
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment'; // 請確認你的 environment 路徑是否正確
import { IDropdownItem, POS2004Item } from '../../utility/dropDownList.service';

export interface TLS24010Request {
  TXN_GUIPaper: string; // 補登類別
  TXN_Date: string; // 銷售日期
  ECR_No?: string; // 收銀機號
  TLT_No?: string; // 專櫃編號
  TXN_No?: number; // 交易序號
}

export interface TLS24010DetailRequest {
  SYS_StoreNo: string; // 店號,
  TXN_Date: string; // 銷售日期,
  ECR_No: string, // 收銀機號,
  TXN_No: number, // 交易序號,
}

export interface TLS24010Data {
  ID?: number;
  TXN_Date: string; // 銷售日期
  ECR_No: string; // 收銀機號
  TXN_No: string; // 交易序號
  TLT_No: string; // 專櫃編號
  TLT_Name: string; // 專櫃名稱
  TXN_Status: string; // 交易狀態
  TXN_Remark: string; // 備註
  TXN_Mode: string; // 交易型態
  USR_No: string; // 操作員編號
  TXN_PreOrder: string,
  TXN_VIP: string,
  TXN_TaxType: string,
  TXN_TaxFreeCertNo: string,
  GUI_Track: string,
  TXN_GUIBegNo: string, // 發票號碼起號
  TXN_GUIEndNo: string, // 發票號碼訖號
  TXN_CustCnt: number,
  TXN_SaleCnt: number, // 交易筆數
  TXN_MemCard: string,
  TXN_Uniform: string,
  TXN_Time: string
  TXN_GUI_CarrType: string,
  TXN_GUIVehicle: string,
  TXN_TotGUI: number; // 發票金額
  TXN_GUI_CarrId: string,
  TXN_GUI_CarrIdEx: string,
  TXN_GUIRemark: string,
  TXN_PrintTimes: number,
  IsHaveGUILoveCode: string,
  TXN_GUILoveCode: string
  store_way?: string; // 櫃位類型
  talent_id?: number; // 專櫃合約編號
  rece_yn?: string; // 是否開立業主發票
  TXN_GUIPaper?: string; // 補登類別
  type?: string; // 修正類型
  IsCanDel?: boolean; // 有發票的是否可刪除
  TXN_Ret_No?: string; // 折讓單號
  tlt_term_type?: string;
  ORG_TXN_Date?: string;
  ORG_ECR_No?: string;
  Check_Status: string; // 審核狀態 (Y: 已審核, N: 未審核)
}

export interface POS5007Data {
  id: number; // 唯一識別碼
  ID?: number; // 唯一識別碼
  PLU_MagNo?: string | POS2004Item; // 商品編號
  PLU_No?: string; // 國際條碼
  PLU_Name?: string; // 商品名稱
  TLT_No?: string; // 專櫃編號
  Talent_ID?: number;
  TXN_Qty?: number;// 數量
  PLU_SalePrc?: number; // 單價金額
  Unitprice?: number; // 單價小計金額 !!
  TXN_Amt?: number; // 單價小計金額 !!
  TXN_Disc?: number; // 單價折扣讓金額
  TXN_SaleAmt?: number; // 單價銷售金額
  tlt_id?: string; // 類別
  tlt_id_desc?: string;
  PLU_TaxType?: string; // 稅別
  TXN_DiscCode?: string; // 折扣別
  TXN_DiscCode_Name?: string; // 折扣名稱
  TXN_DiscName?: string;
  Contract_No?: string;
  Contract_SubNo?: string;
}

export interface POS5008Data {
  ID?: number;
  id?: number; // 唯一識別碼
  TXN_Date?: string; // 銷售日期
  ECR_No?: string; // 收銀機號
  Talent_ID?: number; // 專櫃合約編號
  PAY_No?: string; // 付款編號          // 傳給後端
  PAY_Name?: string; // 付款名稱
  PAY_Type?: string; // 付款別
  TXN_PayAmt?: number; // 付款金額       // 傳給後端
  CRD_Type?: string | null; // 信用卡別         // 傳給後端
  CRD_No?: string,                      // 傳給後端
  TXN_CouponNo?: string,               // 傳給後端
  TXN_PayDesc?: string,               // 傳給後端
  TERM_No?: string | null; // 期別              // 傳給後端
  selected?: boolean,
  PAY_OverPay?: string;
  CRD_NoTXN_CouponNoTXN_PayDesc?: string | null;
  Check_Status?: string; // 審核狀態 (Y: 已審核, N: 未審核)
  isLocked?: boolean; // 是否鎖定 (已審核的資料將被鎖定，無法編輯)
  PAY_TaxType?: string;
}

export interface InsertTLS24010Payload {
  Store_way: string; // store_way
  TXN_Date: string;
  ECR_No: string;
  TLT_No: string;
  TXN_Remark: string;
  USR_No: string;
  TXN_PreOrder: string;
  TXN_VIP: string;
  TXN_TaxFreeCertNo: string;
  TXN_Status: string;
  GUI_Track: string;
  TXN_GUIBegNo: string;
  TXN_GUIEndNo: string;
  TXN_CustCnt: number;
  TXN_SaleCnt: number; // 交易筆數
  TXN_MemCard: string;
  TXN_Uniform: string;
  TXN_Time: string;
  TXN_GUI_CarrType: string;
  TXN_GUIVehicle: string;
  TXN_GUI_CarrIdEx: string;
  TXN_GUI_CarrId: string;
  TXN_GUIRemark: string;
  TXN_PrintTimes: number;
  TXN_GUILoveCode: string;
  POS5007_INFO: {
    PLU_MagNo: string;
    PLU_No: string;
    TXN_Qty: number;
    PLU_SalePrc: number;
    TXN_Disc: number;
    TXN_SaleAmt: number;
    tlt_id: string;
    PLU_TaxType: string;
    TXN_DiscCode: string;
  }[];
  POS5008_INFO: {
    PAY_No: string;
    TXN_PayAmt: number;
    CRD_Type: string;
    CRD_No: string;
    TXN_CouponNo: string;
    TXN_PayDesc: string;
    TERM_No: number;
  }[];
  VoidEdit: Record<string, string>
}

export interface UpdateTLS24010Payload {
  EditType: string;
  Store_way: string;
  SYS_StoreNo: string;
  TXN_Date: string | null;
  ECR_No: string;
  TXN_No: number;
  POS5006_ID?: number;
  TXN_Remark?: string;
  TLTNoEdit?: {
    TLT_No: string;
    Talent_ID: number;
    Contract_No: string
    Contract_SubNo: string
    updatePOS5007List: {
      POS5007_ID?: number;
      TLT_No: string;
      PLU_MagNo: string;
      PLU_No: string;
      Talent_ID: number;
      Contract_No: string,
      Contract_SubNo: string,
      tlt_id?: string;
      PLU_TaxType?: string;
      TXN_DiscCode?: string;
    }[];
  };
  DiscCodeEditList?: {
    POS5007_ID?: number;
    Talent_ID: number;
    TXN_DiscCode: string;
  }[];
  TLTIdEditList?: {
    POS5007_ID?: number;
    Talent_ID: number;
    tlt_id: string;
  }[];
  PayNoEditList?: {
    POS5008_ID?: number;
    PAY_No: string;
    TXN_PayAmt: number;
    CRD_Type: string;
    CRD_No: string;
    TXN_CouponNo: string;
    TXN_PayDesc: string;
    TERM_No: number;
  }[];
  PreOrderEdit?: {
    Talent_ID: number;
    TXN_PreOrder: string;
  };
  VoidEdit?: {
    Void_Date: string,
    Void_Time: string
  }
}

export interface QueryPOS2004ForUpdatePayload {
  Store_way: string;
  TXN_Date: string;
  TLT_No?: string;
  Keyword?: string;
}

export interface POS2004ForUpdateResponse {
  id?: number;
  TLT_No: string;
  TLT_Name: string;
  tlt_id: string;
  tlt_id_desc: string;
  cag_taxtype: string;
  cag_barcode: string;
  cag_barcode_name: string;
  PLU_MagNo: string;
  PLU_No: string;
  PLU_Name: string;
  PLU_OrgPLUNo: string;
  PLU_SalePrc: number;
  talent_id: number;
  Contract_No: string;
  Contract_SubNo: string;
}

export interface CancelVoidTLS24010Payload {
  SYS_StoreNo: string,
  TXN_Date: string,
  ECR_No: string,
  TXN_No: number
}

export interface ExportTLS24010PDFResponse {
  TXN_GUIPaper: string,
  TXN_Date: string,
  ECR_No: string,
  TLT_No: string,
  TXN_No: number
}

export interface TltInfo {
  No: string;
  Name: string;
  store_way: string;
  talent_id: number;
}

export interface DeleteTLS24010Payload {
  SYS_StoreNo: string,
  TXN_Date: string,
  ECR_No: string,
  TXN_No: number
}

export interface queryTLS24010CheckStatusPayload {
  TXN_Date: string,
  ECR_No: string,
  Talent_ID: number;
}
export interface queryTLS24010EcrNoListPayload {
  TXN_Date: string,
}
export interface queryTLS24010EcrNoListItem {
  ECR_No: string;
  ECR_Name: string;
  ECR_TLT_No: string;
  ECR_Type: string;
}

@Injectable({
  providedIn: 'root',
})
export class Tls24010Service {
  private apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * 查詢 POS2006 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS24010Data 陣列的 API 響應
   */
  queryTLS24010(params: TLS24010Request, tltOptions: IDropdownItem[]): Observable<ApiResponse<TLS24010Data[]>> {
    const tltMap = new Map(tltOptions.map(tlt => [tlt.No, tlt]));

    return this.http.post<ApiResponse<TLS24010Data[]>>(`${this.apiUrl}/queryTLS24010`, params).pipe(
      map(res => ({
        ...res,
        Data: res.Data?.map(item => {
          const tltInfo = tltMap.get(item.TLT_No);
          return {
            ...item,
            TXN_No: item.TXN_No.toString(),
            // 使用 Optional Chaining 簡化賦值
            store_way: tltInfo?.store_way ?? item.store_way,
            talent_id: tltInfo?.talent_id ?? item.talent_id
          };
        })
      }))
    );
  }
  /**
   * 查詢 POS2007 POS2008 資料表
   * @param params 查詢條件
   * @returns 包含 ITLS24010Data 陣列的 API 響應
   */
  queryTLS24010_Detail(params: TLS24010DetailRequest): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryTLS24010_Detail`, params);
  }
  /**
 * 新增 POS5006、POS5007、POS5008 資料
 * @param payload 請參考 Swagger insertTLS24010 API 格式
 * @returns 成功訊息或錯誤訊息
 */
  insertTLS24010(payload: InsertTLS24010Payload): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/insertTLS24010`, payload);
  }
  /**
   * 更新交易補登資料（修正用）
   * @param payload 依照 Swagger 規格傳入資料
   * @returns API 回應結果
   */
  updateTLS24010(payload: UpdateTLS24010Payload): Observable<ApiResponse<{ Is_Create_Ret: boolean, TXN_Ret_No: string }>> {
    return this.http.post<ApiResponse<{ Is_Create_Ret: boolean, TXN_Ret_No: string }>>(`${this.apiUrl}/updateTLS24010`, payload);
  }

  /**
   * 查詢 POS2004 商品資料（修正用）
   * @param payload 查詢條件
   * @returns 商品資料列表
   */
  queryPOS2004ForUpdate(payload: QueryPOS2004ForUpdatePayload): Observable<ApiResponse<POS2004ForUpdateResponse[]>> {
    return this.http.post<ApiResponse<POS2004ForUpdateResponse[]>>(`${this.apiUrl}/queryPOS2004ForUpdate`, payload);
  }

  /**
   * 取消交易補登
   * @param payload 依照 Swagger 規格傳入資料
   * @returns API 回應結果
   */
  cancelVoidTLS24010(payload: CancelVoidTLS24010Payload): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/cancelVoidTLS24010`, payload);
  }

  exportTLS24010PDF(payload: ExportTLS24010PDFResponse): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportTLS24010PDF`, payload, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  printTLS24010(TXN_Ret_No: string): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${this.apiUrl}/printTLS24010`, { TXN_Ret_No })
  }

  deleteTLS24010(payload: DeleteTLS24010Payload): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/deleteTLS24010`, payload);
  }
  /** 查詢銷售日期是否已關帳 */
  queryTLS24010IsClose(TXN_Date: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/queryTLS24010IsClose`, { TXN_Date });
  }
  /** 查詢銷售日期是否已關帳 */
  queryTLS24010CheckStatus(payload: queryTLS24010CheckStatusPayload): Observable<ApiResponse<{ payNoList: string[] }>> {
    return this.http.post<ApiResponse<{ payNoList: string[] }>>(`${this.apiUrl}/queryTLS24010CheckStatus`, payload);
  }
  /** 查詢收銀機下拉(POS1002) */
  queryTLS24010EcrNoList(payload: queryTLS24010EcrNoListPayload): Observable<ApiResponse<queryTLS24010EcrNoListItem[]>> {
    return this.http.post<ApiResponse<queryTLS24010EcrNoListItem[]>>(`${this.apiUrl}/queryTLS24010EcrNoList`, payload);
  }
}
