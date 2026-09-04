import { ApiRequest, ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Query request interface for TLS42020
export interface TLS42020QueryRequest extends ApiRequest {
  menuType?: string[];             // 菜單類別
  tltNo?: string[];                // 專櫃編號
  tltName?: string[];              // 專櫃名稱
  SBM_BegDate?: string;            // 開始日期
  SBM_EndDate?: string;            // 結束日期
}

// Data result interface for TLS42020 (POS1027M資料表)
export interface TLS42020Data {
  id: number;                     // ID
  mid: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type?: string;               // 菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  TLT_Name: string;               // 專櫃名稱
  crt_date: string;               // 建立日期
  crt_usr_no: string;             // 建立者編號
  crt_usr_name: string;           // 建立者姓名
  upd_date: string;               // 更新日期
  upd_usr_no: string;             // 更新者編號
  upd_usr_name: string;           // 更新者姓名
}

// Detail query request interface for TLS42020
export interface TLS42020DetailQueryRequest {
  MID: number;           // 主檔 ID (對應後端 MID)
  STO_No: string;       // 門市店號
  SBM_Type?: string;     // 菜單類別
  TLT_No: string;        // 專櫃編號 (對應後端 TLT_No)
  SBM_BegDate: string;  // 有效起始日期
}

// Detail data result interface for TLS42020 (POS10271資料表)
export interface TLS42020DetailData {
  CRT_Date: string;               // 建立日期
  CRT_USR_No: string;             // 建立者編號
  CRT_USR_Name: string;           // 建立者姓名
  UPD_Date: string;               // 更新日期
  UPD_USR_No: string;             // 更新者編號
  UPD_USR_Name: string;           // 更新者姓名
  ID: number;                     // ID
  MID: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type?: string;               // 子菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  SBM_SeqNo: number;              // 序號
  PLU_MagNo: string;              // 商品貨號
  PLU_No: string;                 // 國際條碼
  PLU_Name: string;               // 商品名稱
  PLU_PrnName: string;            // 商品按鍵名稱
  PLU_FixPrc: number;    // 商品定價
  PLU_SalePrc: number;   // 商品售價
  SBM_BtnNo: number;              // 菜單按鍵序號
}

// Insert request interface for TLS42020M
export interface TLS42020InsertUpdateRequest {
  SBM_Type: string;               // 菜單類別
  TLT_No?: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  POS10271: TLS42020InsertUpdateDetailData[];  // POS10271子資料
}
export interface TLS42020InsertUpdateDetailData {
  ID: number;           // 👈 確保這裡是 number！(傳 0 或 既存 ID 數字)
  SBM_Type: string;
  TLT_No: string;
  SBM_BegDate: string;
  SBM_EndDate: string;
  SBM_SeqNo?: number;   // 👈 改為 number
  PLU_MagNo?: string;
  PLU_No?: string;
  PLU_Name: string;
  PLU_PrnName?: string;
  PLU_FixPrc?: number;
  PLU_SalePrc: number;
  SBM_BtnNo: number;
}

// Delete request interface for TLS42020M
export interface TLS42020DeleteRequest {
  idList: number[];               // ID清單
}

// Dropdown request interface for TLS42020
export interface TLS42020DropdownRequest {
  TLT_NO: string; // 專櫃編號清單
}

export interface TLS42020DropdownResponse {
  PLU_MagNo: string,
  PLU_No: string,
  PLU_Name: string,
  PLU_PrnName: string,
  PLU_FixPrc: number,
  PLU_SalePrc: number
}

// ExecSpFunc request interface for TLS42020
export interface TLS42020ExecSpFuncRequest {
  idList: number[];               // ID清單
}

@Injectable({
  providedIn: 'root'
})
export class TLS42020Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS4000';

  constructor(private http: HttpClient) { }

  // 查詢POS1027M資料表
  queryTLS42020(data: TLS42020QueryRequest): Observable<ApiResponse<TLS42020Data[]>> {
    return this.http.post<ApiResponse<TLS42020Data[]>>(`${this.apiUrl}/queryTLS42020`, data);
  }

  // 查詢POS10271資料表
  queryTLS42020Detail(data: TLS42020DetailQueryRequest): Observable<ApiResponse<TLS42020DetailData[]>> {
    return this.http.post<ApiResponse<TLS42020DetailData[]>>(`${this.apiUrl}/queryTLS42020_Detail`, data);
  }

  // 查詢全部既有菜單設定(POS1027M)下拉選單，不受查詢頁篩選條件限制，供複製設定來源選單使用
  queryTLS42020AllDropDownList(): Observable<ApiResponse<TLS42020Data[]>> {
    return this.http.post<ApiResponse<TLS42020Data[]>>(`${this.apiUrl}/queryTLS42020_AllDropDownList`, {});
  }

  // 新增POS1027M資料表
  insertTLS42020(data: TLS42020InsertUpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS42020`, data);
  }

  // 更新POS1027M資料表
  updateTLS42020(data: TLS42020InsertUpdateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS42020`, data);
  }

  // 刪除POS1027M資料表
  deleteTLS42020(data: TLS42020DeleteRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS42020`, data);
  }

  // 匯入TLS42020資料
  uploadTLS42020(file: File, uploadType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadType', uploadType);
    return this.http.post<any>(`${this.apiUrl}/uploadTLS42020`, formData);
  }

  // 下載收銀觸控按鍵設定作業Excel規範
  downloadRule(): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/downloadRule`, {}, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  // 下傳POS1027M資料表
  ExecSpFuncTLS42020(data: TLS42020ExecSpFuncRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ExecSpFuncTLS42020`, data);
  }

  // 專櫃編號下拉選單
  dropdownTLS42020(data: TLS42020DropdownRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dropdownTLS42020`, data).pipe(
      map(res => {
        return {
          Data: res.Data.map((item: TLS42020DropdownResponse) => {
            return {
              ...item,
              label: item.PLU_MagNo + '-' + item.PLU_Name,
            };
          }),
        }
      })
    );
  }
  QueryPLU_No(data: { TLT_No?: string; PLU_No?: string; PLU_Name?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryPLU_No`, data);
  }
}
