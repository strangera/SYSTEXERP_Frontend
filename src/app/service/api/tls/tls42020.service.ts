import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { environment } from '../../../../environments/environment';
import { Observable, of } from 'rxjs';

// Query request interface for TLS42020
export interface TLS42020QueryRequest extends BaseQueryRequest {
  menuType: string[];              // 菜單類別
  tltNo: string[];                 // 專櫃編號
  tltName?: string[];               // 專櫃名稱 - 新增此欄位
  SBM_BegDate_s: string;          // 開始日期(起)
  SBM_BegDate_e: string;          // 開始日期(迄)
  SBM_EndDate_s: string;          // 結束日期(起)
  SBM_EndDate_e: string;          // 結束日期(迄)
}

// Data result interface for TLS42020 (POS1027M資料表)
export interface TLS42020Data {
  crt_date: string;               // 建立日期 - 改為小寫 snake_case
  crt_usr_no: string;             // 建立者編號 - 改為小寫 snake_case
  crt_usr_name: string;           // 建立者姓名 - 改為小寫 snake_case
  upd_date: string;               // 更新日期 - 改為小寫 snake_case
  upd_usr_no: string;             // 更新者編號 - 改為小寫 snake_case
  upd_usr_name: string;           // 更新者姓名 - 改為小寫 snake_case
  id: number;                     // ID
  mid: number;                    // MID
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  TLT_Name: string;               // 專櫃名稱
}

// Detail query request interface for TLS42020
export interface TLS42020DetailQueryRequest {
  tltNo: string;                // 專櫃編號
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
  SBM_Type: number;               // 子菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  SBM_SeqNo: string;              // 序號
  PLU_MagNo: string;              // 商品貨號
  PLU_No: string;                 // 國際條碼
  PLU_Name: string;               // 商品名稱
  PLU_PrnName: string;            // 商品列印名稱
  PLU_FixPrc: string;             // 商品定價
  PLU_SalePrc: string;            // 商品售價
  SBM_BtnNo: string;              // 菜單按鍵序號
}

// Insert POS10271 detail data interface
export interface TLS42020InsertDetailData {
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 子菜單類別
  TLT_No: string;                 // 專櫃編號
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  SBM_SeqNo: string;              // 序號
  PLU_MagNo: string;              // 商品貨號
  PLU_No: string;                 // 國際條碼
  PLU_Name: string;               // 商品名稱
  PLU_PrnName: string;            // 商品列印名稱
  PLU_FixPrc: string | number;             // 商品定價
  PLU_SalePrc: string | number;            // 商品售價
  SBM_BtnNo: string;              // 菜單按鍵序號
}

// Insert request interface for TLS42020M
export interface TLS42020InsertRequest {
  STO_No: string;                 // 店舖編號
  SBM_Type: number;               // 菜單類別
  TLT_No: string;                 // 專櫃編號
  TLT_Name: string;               // 專櫃名稱
  SBM_BegDate: string;            // 開始日期
  SBM_EndDate: string;            // 結束日期
  POS10271: TLS42020InsertDetailData[];  // POS10271子資料
}

@Injectable({
  providedIn: 'root'
})
export class TLS42020Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS4000';

  constructor(private http: HttpClient) { }

  // 查詢POS1027M資料表
  queryTLS42020(data: TLS42020QueryRequest): Observable<BaseQueryResponse<TLS42020Data>> {
    // return this.http.post<BaseQueryResponse<TLS42020Data>>(`${this.apiUrl}/queryTLS42020`, data);

    // 回傳假資料
    return of({
      Status: '0000',
      Message: '查詢成功',
      Data: [
        {
          crt_date: '2024-01-15',
          crt_usr_no: 'U001',
          crt_usr_name: '張三',
          upd_date: '2024-01-16',
          upd_usr_no: 'U002',
          upd_usr_name: '李四',
          id: 1,
          mid: 101,
          STO_No: 'S001',
          SBM_Type: 1,
          TLT_No: 'T001',
          SBM_BegDate: '2024-01-01',
          SBM_EndDate: '2024-12-31',
          TLT_Name: '美食專櫃',
        },
        {
          crt_date: '2024-01-15',
          crt_usr_no: 'U001',
          crt_usr_name: '張三',
          upd_date: '2024-01-16',
          upd_usr_no: 'U002',
          upd_usr_name: '李四',
          id: 2,
          mid: 102,
          STO_No: 'S002',
          SBM_Type: 2,
          TLT_No: 'T002',
          SBM_BegDate: '2024-02-01',
          SBM_EndDate: '2024-12-31',
          TLT_Name: '服飾專櫃',
        }
      ],
      TotalCount: 2,
      TotalPage: 1
    })
  }

  // 查詢POS10271資料表
  queryTLS42020Detail(data: TLS42020DetailQueryRequest): Observable<BaseQueryResponse<TLS42020DetailData>> {
    // return this.http.post<BaseQueryResponse<TLS42020DetailData>>(`${this.apiUrl}/queryTLS42020_Detail`, data);

    // 回傳假資料
    return of({
      Status: '0000',
      Message: '查詢成功',
      Data: [
        {
          CRT_Date: '2024-01-15T00:00:00.000Z',
          CRT_USR_No: 'U001',
          CRT_USR_Name: '張三',
          UPD_Date: '2024-01-16T00:00:00.000Z',
          UPD_USR_No: 'U002',
          UPD_USR_Name: '李四',
          ID: 1,
          MID: 101,
          STO_No: 'S001',
          SBM_Type: 1,
          TLT_No: 'T001',
          SBM_BegDate: '2024-01-01T00:00:00.000Z',
          SBM_EndDate: '2024-12-31T00:00:00.000Z',
          SBM_SeqNo: '001',
          PLU_MagNo: 'M001',
          PLU_No: '1234567890123',
          PLU_Name: '招牌牛肉麵',
          PLU_PrnName: '牛肉麵',
          PLU_FixPrc: '2000',
          PLU_SalePrc: '1800',
          SBM_BtnNo: '01'
        },
        {
          CRT_Date: '2024-01-15T00:00:00.000Z',
          CRT_USR_No: 'U001',
          CRT_USR_Name: '張三',
          UPD_Date: '2024-01-16T00:00:00.000Z',
          UPD_USR_No: 'U002',
          UPD_USR_Name: '李四',
          ID: 2,
          MID: 102,
          STO_No: 'S001',
          SBM_Type: 1,
          TLT_No: 'T001',
          SBM_BegDate: '2024-01-01T00:00:00.000Z',
          SBM_EndDate: '2024-12-31T00:00:00.000Z',
          SBM_SeqNo: '002',
          PLU_MagNo: 'M002',
          PLU_No: '1234567890124',
          PLU_Name: '蔥爆牛肉',
          PLU_PrnName: '蔥爆牛肉',
          PLU_FixPrc: '2500',
          PLU_SalePrc: '2200',
          SBM_BtnNo: '02'
        }
      ],
      TotalCount: 2,
      TotalPage: 1
    });
  }

  // 新增POS1027M資料表
  insertTLS42020M(data: TLS42020InsertRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS42020M`, data);
    // return of({ Status: '0000', Message: '新增成功' });
  }
}
