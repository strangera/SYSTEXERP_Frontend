import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
// POS2004 商品主檔
export interface POS2004 {
  'id': string;
  'PLU_MagNo': string;
  'PLU_No': string;
  'PLU_OrgPLUNo': string;
  'PLU_Name': string;
  'PLU_PrnName': string;
  'PLU_EngName': string;

  'CAT_LNo': string;
  'CAT_MNo': string;
  'CAT_SNo': string;
  'VEN_No': string;

  'PLU_TaxType': string;
  'PLU_Unit': string;
  'PLU_Spec': string;

  'PLU_FixPrc': number;
  'PLU_SalePrc': number;
  'PLU_MemPrc': number;
  'PLU_BatPrc': number;
  'PLU_Cost': number;

  'PLU_OpenPrc': string;
  'PLU_Status': string;
  'PLU_Type': string;
  'PLU_PageNum': string;

  'PLU_LocNo': number;
  'PLU_BoxQty': number;
  'PLU_StockTaxType': string;

  'PLU_OrderPrc': number;
  'PLU_OrderPrcRate': number;
  'PLU_SafeQty': number;
  'PLU_LastStockDate': Date;

  'PLU_Reserve1': string;
  'PLU_Reserve2': string;
  'PLU_Reserve3': string;
  'PLU_Reserve4': string;
  'PLU_Reserve5': string;

  'PLU_StopSale': string;
  'PLU_CalcSaleStock': string;
  'PLU_Disc': string;
  'PLU_OpenOrderPrc': string;
  'PLU_LastSaleDate': Date;
  'PLU_LastUpdSalePrc': Date;
  'PLU_LastUpdOrderPrc': Date;

  'PLU_RebateRate': number;
  'PLU_AccountType': string;
  'PLU_StopStockDate': Date;

  'PLU_StopSaleDate': Date;
  'PLU_ExpDays': number;
  'PLU_MemPrc2': number;
  'PLU_MemPrc3': number;

  'MAM_No': string;
  'MAM_Condition': number;
  'MAM_TotAmt': number;
  'MAM_CombNo': string;
  'MAM_CombGrp': string;

  'MAM_Method': string;
  'MAM_UnitPrc': number;
  'MAM_ChangeNo': string;
  'MAM_BegDate': Date;
  'MAM_EndDate': Date;
  'MAM_Quart': number;
  'MAM_TotQuart': number;
  'MAM_AddPrc': number;
  'MAM_AddQty': number;

  'MAM_AddPLU_No': string;
  'MAM_MemCondition': number;
  'MAM_MemTotAmt': number;
  'MAM_MemUnitPrc': number;
  'MAM_MaxCondition': number;

  'MAM_DiscAmt': number;
  'MAM_ActiveDate': Date;
  'MAM_DiscType': string;
  'MAM_FirstActiveDate': Date;
  'MAM_RecoverDate': Date;

  'PLU_Attribute': string;
  'PLU_Source': string;
  'PLU_IsStock': string;
  'PLU_ReadyDay': number;
  'PLU_MinOrder': number;
  'PLU_StockType': string;
  'MAM_PLU_MagNo': string;

  'MAM_OrdPrcBegDate': Date;
  'MAM_OrdPrcEndDate': Date;
  'MAM_OrderPrc': number;
  'TLT_NO': string;
  'PLU_TaxRate': number;
  'PLU_Lable': string;
  'LOGO_No': string;

  'PLU_Length': number;
  'PLU_Width': number;
  'PLU_Height': number;
  'PLU_Weight': number;
  'PLU_Volume': number;
  'PLU_Image': string;
  'PLU_ECStatus': string;

  'PLU_ECStopUseDate': Date;
  'PLU_ECStopUseUsr': string;
  'PLU_ECStopUseName': string;
  'PLU_ECReShelvesDate': Date;
  'PLU_ECReShelvesUsr': string;
  'PLU_ECReShelvesName': string;
  'PLU_ECStopInDate': Date;
  'PLU_ECStopInUsr': string;
  'PLU_ECStopInName': string;


  'CRT_Date': Date;
  'CRT_USR_No': string;
  'CRT_USR_Name': string;
  'UPD_Date': Date;
  'UPD_USR_No': string;
  'UPD_USR_Name': string;

  'STK_CurrentQty': number; //庫存量(僅顯示)

  'CanDel': boolean;  //能否刪除(僅顯示)
}
@Injectable({
  providedIn: 'root'
})
export class Tls51070Service {
  // POS2004 商品基本資料
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // 查詢 POS2004 資料表
  queryTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51070`, body);
  }

  // 新增 POS2004、POS2005、POS2010、IMG1001 資料表，更新SER1001流水號
  insertTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51070`, body);
  }

  // 更新 POS2004、POS2005、POS2010、IMG1001 資料表
  updateTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51070`, body);
  }

  // 刪除 POS2004 資料表
  deleteTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51070`, body);
  }

  // 下傳POS2004異動資料
  ExecSpFuncTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ExecSpFuncTLS51070`, body);
  }

  // 查詢 POS2005_國際條碼、POS2020_採購廠商、IMG1001_商品圖檔
  queryTLS51070_Detail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51070_Detail`, body);
  }

  // 查詢 商品變價紀錄
  queryTLS51070_PriceChangeRecord(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51070_PriceChangeRecord`, body);
  }

  // excel匯入並且產生錯誤檔
  uploadTLS51070(file: File, sheetNames?: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (sheetNames) {
      formData.append('SheetNames', sheetNames);
    }

    return this.http.post<any>(`${this.apiUrl}/uploadTLS51070`, formData);
  }

  //上傳圖檔
  uploadTLS51070Image(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/uploadTLS51070Image`, formData);
  }

  // ---圖片處理---

  //查詢圖片
  queryImage(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Image/queryImage`, body);
  }

  // 上傳圖片
  uploadImages(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Image/uploadImages`, formData);
  }

  //下載圖片
  downloadImage(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Image/downloadImage`, body);
  }

  //刪除圖片
  deleteImage(body: any): Observable<any> {
    return this.http.delete<any>(`${environment.ApiUrl}/Image/deleteImage`, {
      headers: { 'Content-Type': 'application/json' },
      body: body
    });
  }

  // --- 標籤檔 ---

  //取得標籤檔資料
  getLabelTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getLabelTLS51070`, body);
  }

  //產生標籤檔資料
  exportLabel(data: any[]): Observable<string> {
    return this.http.post(`${environment.ApiUrl}/ExportLabel/ExportLabel_Other`, data, {
      responseType: 'text'  // 後端回傳的是純文字
    });
  }

  //下載excel範本
  downloadTLS51070Template(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/downloadTLS51070Template`, {
      responseType: 'blob',
    });
  }

  // --- dropDown ---

  // 查詢 大分類(業種)設定檔
  queryCAT_LNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2003_DropDownList`, body);
  }

  // 查詢 中分類(商品類別) 設定檔
  queryCAT_MNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS20031_DropDownList`, body);
  }

  // 查詢 小分類(POS20032) 設定檔
  queryCAT_SNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS20032_DropDownList`, body);
  }

  // 查詢 商品單位(PLUUNIT) 設定檔
  queryPLUUNIT_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLUUNIT_DropDownList`, body);
  }

  // 查詢 品牌代碼(PLULOGO) 設定檔
  queryPLULOGO_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLULOGO_DropDownList`, body);
  }

  // 查詢 自營 專櫃主檔(TLTTALENT) 設定檔
  queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_ByStoreWay2AndApprove2_DropDownList`, body);
  }

  // 查詢 專櫃主檔(TLTTALENT) 設定檔 (VEN_No篩選)
  queryTLTTALENT_ByStoreWay2AndApprove2WithVenNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLTTALENT_ByStoreWay2AndApprove2WithVenNo_DropDownList`, body);
  }

  // 查詢 廠商(POS2013) 設定檔
  queryPOS2013_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2013_DropDownList`, body);
  }

  // 查詢 廠商(POS2013) 設定檔(新增時使用)
  queryTLTTALENT_ActiveStoreWay2(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLTTALENT_ActiveStoreWay2`, body);
  }
}
