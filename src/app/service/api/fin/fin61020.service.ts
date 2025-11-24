import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@service/system/auth.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 假設後端 Request/Response Model 定義如下 (請根據實際路徑調整)
// 這裡僅為 TypeScript 類型提示，實際應用中可能需要定義這些 DTO。
export interface QueryFIN61020Request {
  Sales_Id?: string;
  User_no?: string;
  User_Name?: string;
  ORG_ID?: string;
}

export interface InsertUpdateFIN61020Request {
  ID: number; // 使用 number 對應 C# 的 decimal
  Sales_Id?: string;
  User_no: string;
  User_Name: string;
  ORG_ID?: string;
}

export interface QueryFIN61020Response {
  ID: number;
  MID: number;
  Sales_Id: string;
  User_no: string;
  User_Name: string;
  ORG_ID: string;
  // 建立/更新資訊...
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string | null;
  UPD_USR_No: string | null;
  UPD_USR_Name: string | null;
}

export interface DeleteFIN61020Request {
  IDs: number[];
}

@Injectable({
  providedIn: 'root'
})
export class Fin61020Service {
  // 將 BAS1000 修正為 NTS1000
  private apiUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;

  constructor(private http: HttpClient) { }

  /**
   * 1. 查詢業務員資料 (對應後端 queryFIN61020)
   * @param data 查詢條件 (Sales_Id, User_no, User_Name, ORG_ID)
   * @returns 包含業務員列表和總筆數的 Observable
   */
  queryFIN61020(data: QueryFIN61020Request): Observable<ApiResponse<QueryFIN61020Response[]>> {
    // 雖然前端作業名稱是 FIN61020，但呼叫的 API 路由是 FIN61020
    return this.http.post<ApiResponse<QueryFIN61020Response[]>>(`${this.apiUrl}/queryFIN61020`, data);
  }

  /**
   * 2. 新增業務員資料 (對應後端 insertFIN61020)
   * @param data 新增內容 (User_no, User_Name, ORG_ID, ID=0)
   * @returns 包含成功訊息 (例如新 Sales_Id) 的 Observable
   */
  insertFIN61020(data: InsertUpdateFIN61020Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/insertFIN61020`, data);
  }

  /**
   * 3. 修改業務員資料 (對應後端 updateFIN61020)
   * @param data 修改內容 (ID != 0, User_no, User_Name, ORG_ID)
   * @returns 包含成功訊息的 Observable
   */
  updateFIN61020(data: InsertUpdateFIN61020Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/updateFIN61020`, data);
  }

  /**
   * 4. 刪除業務員資料 (對應後端 deleteFIN61020)
   * @param data 要刪除的資料 ID 列表
   * @returns 包含成功訊息 (例如影響筆數) 的 Observable
   */
  deleteFIN61020(data: DeleteFIN61020Request): Observable<ApiResponse<string>> {
    // 這裡使用 POST，因為後端 API 定義為 [HttpPost("deleteFIN61020")]
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/deleteFIN61020`, data);
  }
}
