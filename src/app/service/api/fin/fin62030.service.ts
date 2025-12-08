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
    // return this.http.post<BaseQueryResponse<FIN62030Data>>(`${this.apiUrl}/queryFIN62030`, req);
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
    // return this.http.post<any>(`${this.apiUrl}/queryAPS4001Tran_No`, {});
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
}