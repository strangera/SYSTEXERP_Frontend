import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢銀行調撥 Request
export interface QueryFIN62030Request extends BaseQueryRequest {
  Tran_NoFrom?: string; // 調撥單號(起)
  Tran_NoTo?: string;   // 調撥單號(迄)
}

// 預覽銀行調撥傳票拋轉作業 Request
export interface PreviewFIN62030Request {
  Tran_Nos: string[]; // 調撥單號
}

// 傳票明細資料
export interface VoucherDetail {
  Tran_No?: string;       // 調撥單號
  AccDC?: string;         // 借貸方別 D:借方 C:貸方
  SerNo?: string;         // 序號
  ACC_No?: string;        // 科目代號
  ACC_Name?: string;      // 科目名稱
  DetailNo?: string;      // 廠商代號
  NoteDesc?: string;      // 摘要
  Debit_Amt?: number;     // 借方金額
  Credit_Amt?: number;    // 貸方金額
  ORG_ID?: string;        // 組織代號
  ORG_Name?: string;      // 組織名稱
  PTA?: string;           // 立沖代號
  ProjectNo?: string;     // 活動代號
  SubDetailNo?: string;   // 對象別編號
}

// 預覽銀行調撥傳票拋轉作業 Response
export interface PreviewFIN62030Response {
  VouType?: string;           // 傳票種類 1:現金收入2:現金支出3:轉帳傳票 (固定為3)
  VouTypeName?: string;       // 傳票種類名稱
  VoucherType?: string;       // 傳票型態 固定為BT
  VouDate?: string;           // 傳票日期
  Remark?: string;            // 傳票摘要
  CRT_USR_No?: string;        // 建立者
  CRT_Date?: string;          // 建立日
  voucherDetails?: VoucherDetail[]; // 傳票明細資料
}

// 預覽銀行調撥傳票拋轉作業 API Response (包含 Status, Error, Meta 等欄位)
export interface PreviewFIN62030ApiResponse {
  Status?: string;
  Data?: PreviewFIN62030Response;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  };
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  };
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
}

// 執行銀行調撥傳票拋轉作業 明細資料
export interface TranNoDetail {
  Tran_No?: string;       // 調撥單號
  AccDC?: string;         // 借貸方別
  IsFee?: boolean;        // 是否為手續費
  AccNo?: string;         // 科目代號
  NoteDesc?: string;      // 摘要
  ORG_ID?: string;        // 組織代號
  ProjectNo?: string;     // 活動代號
  SubDetailNo?: string;   // 對象別編號
}

// 執行銀行調撥傳票拋轉作業 Request
export interface InsertFIN62030Request {
  Tran_Nos: string[];            // 調撥單號
  Remark: string;                // 備註
  tranNoDetails: TranNoDetail[]; // 明細資料
}

// 銀行調撥 Response 資料結構
export interface FIN62030Data {
  Tran_No?: string;       // 調撥單號
  CRT_Date?: string;      // 建立日期
  Tran_Date?: string;     // 轉帳日期
  BNK_No_In?: string;     // 調入銀行
  BNK_Name_In?: string;   // 調入帳號
  BNK_No_Out?: string;    // 調出銀行
  BNK_Name_Out?: string;  // 調出帳號
  Tran_Amt?: number;      // 金額
  Fee_Amt?: number;       // 手續費
  Remark?: string;        // 備註
}

@Injectable({
  providedIn: 'root'
})
export class FIN62030Service {
  private apiUrl = environment.ApiUrl + '/FIN0000/NTS1000';

  constructor(private http: HttpClient) { }

  // 查詢銀行調撥資料
  queryFIN62030(req: QueryFIN62030Request): Observable<BaseQueryResponse<FIN62030Data>> {
    return this.http.post<BaseQueryResponse<FIN62030Data>>(`${this.apiUrl}/queryFIN62030`, req);
    // return 假資料
    return of({
      Status: "Success",
      Data: [
        {
          Tran_No: "T001",
          CRT_Date: "2024-01-01",
          Tran_Date: "2024-01-02",
          BNK_No_In: "B001",
          BNK_Name_In: "Bank In 1",
          BNK_No_Out: "B002",
          BNK_Name_Out: "Bank Out 1",
          Tran_Amt: 1000,
          Fee_Amt: 10,
          Remark: "Test Remark 1"
        },
        {
          Tran_No: "T002",
          CRT_Date: "2024-01-03",
          Tran_Date: "2024-01-04",
          BNK_No_In: "B003",
          BNK_Name_In: "Bank In 2",
          BNK_No_Out: "B004",
          BNK_Name_Out: "Bank Out 2",
          Tran_Amt: 2000,
          Fee_Amt: 20,
          Remark: "Test Remark 2"
        }
      ],
      Message: "查詢成功",
      TotalCount: 2,
      TotalPage: 1
    });
  }

  // 查詢APS4001調撥單號
  queryAPS4001Tran_No(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryAPS4001Tran_No`, {});
    // return假資料
    return of({
      Status: "Success",
      Data: ["T001", "T002", "T003"],
      Error: {
        Code: "",
        Message: "",
        Details: ""
      },
      Meta: {
        Timestamp: new Date().toISOString(),
        RequestId: "mock-request-id"
      },
      Message: "查詢成功",
      TotalCount: 3,
      TotalPage: 1
    })
  }

  // 預覽銀行調撥傳票拋轉作業資料
  previewFIN62030(req: PreviewFIN62030Request): Observable<PreviewFIN62030ApiResponse> {
    return this.http.post<PreviewFIN62030ApiResponse>(`${this.apiUrl}/previewFIN62030`, req);
    // return假資料
    return of({
      Status: "Success",
      Data:
      {
        VouType: "3",
        VouTypeName: "轉帳傳票",
        VoucherType: "BT",
        VouDate: "2024-12-09",
        Remark: "銀行調撥傳票",
        CRT_USR_No: "USER001",
        CRT_Date: "2024-12-09",
        voucherDetails: [
          {
            Tran_No: "T001",
            AccDC: "D",
            SerNo: "1",
            ACC_No: "612003",
            ACC_Name: "零用金",
            DetailNo: "V001",
            NoteDesc: "銀行調撥-借方",
            Debit_Amt: 1000,
            Credit_Amt: 0,
            ORG_ID: "100000",
            ORG_Name: "總公司",
            PTA: "P001",
            ProjectNo: "20250730001",
            SubDetailNo: "SUB001"
          },
          {
            Tran_No: "T001",
            AccDC: "C",
            SerNo: "1",
            ACC_No: "612003",
            ACC_Name: "零用金",
            DetailNo: "V001",
            NoteDesc: "銀行調撥-貸方",
            Debit_Amt: 0,
            Credit_Amt: 1000,
            ORG_ID: "100000",
            ORG_Name: "總公司",
            PTA: "P001",
            ProjectNo: "20250730001",
            SubDetailNo: "SUB001"
          },
          {
            Tran_No: "T001",
            AccDC: "C",
            SerNo: "2",
            ACC_No: "1101",
            ACC_Name: "銀行存款",
            DetailNo: "V002",
            NoteDesc: "銀行調撥-貸方",
            Debit_Amt: 0,
            Credit_Amt: 1000,
            ORG_ID: "100200",
            ORG_Name: "總公司",
            PTA: "P002",
            ProjectNo: "20250730001",
            SubDetailNo: "SUB002"
          }
        ]
      },
      Message: "查詢成功",
      TotalCount: 1,
      TotalPage: 1
    });
  }

  // 執行銀行調撥傳票拋轉作業
  insertFIN62030(req: InsertFIN62030Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN62030`, req);
    // return假資料
    return of({
      Status: "Success",
      Data: null,
      Error: {
        Code: "",
        Message: "",
        Details: ""
      },
      Meta: {
        Timestamp: new Date().toISOString(),
        RequestId: "mock-request-id"
      },
      Message: "執行成功"
    });
  }
}