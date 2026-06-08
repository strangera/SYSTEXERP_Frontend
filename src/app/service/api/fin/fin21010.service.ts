import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

//主檔
export interface APS1002 {
  id: number;                              // 主鍵
  mid: number;                             // ((0))

  BNK_No: string;                          // 全省銀行代碼 (讀取APS1004銀行分行代碼檔，下拉BNK_NO+BNK_BRANCHNO銀行代碼、銀行名稱BNK_BRANCHNAME，不可重覆)
  BNK_AccNo: string;                       // 帳號
  BNK_BranchNo: string;                    // 銀行分行代號
  BNK_AccType: string;                     // 存款代號 (SYS1000.BNK_ACCTYPE)
  BNK_AccName1: string;                    // 帳戶名稱
  BNK_AccStatus: string;                   // 帳戶狀態 (0=正常)
  BNK_DepositAccNo?: string | null;        // 公司銀行科目 (下拉 GLS1005.ACCNO，讀取 ACCNO, ACCCNAME)
  BNK_CheckInAccNo?: string | null;        // 應付票據科目 (下拉 GLS1005.ACCNO，讀取 ACCNO, ACCCNAME)
  BNK_CheckOutAccNo?: string | null;       // 應收票據科目 (下拉 GLS1005.ACCNO，讀取 ACCNO, ACCCNAME)

  CRT_Date?: string | null;                // 建立日期 (datetime)
  CRT_USR_No?: string | null;              // 建立人員
  CRT_USR_Name?: string | null;            // 建立人員姓名
  UPD_Date?: string | null;                // 變更日期 (datetime)
  UPD_USR_No?: string | null;              // 變更人員
  UPD_USR_Name?: string | null;            // 變更人員姓名

  CanDel?: boolean;  //能否刪除(僅顯示)     // 看SA有沒有要卡控
}

export interface APS1004 {
  id: number;                              // 主鍵
  BNK_No: string;                          // 全省銀行代碼
  BNK_BranchNo: string;                    // 銀行分行代號
  BNK_BranchName: string;                  // 銀行分行名稱
  ACC_LEN?: number | null;                 // 該行帳號最小長度 (沒有使用)
  ACC_LEN_MAX?: number | null;             // 該行帳號最大長度 (沒有使用)
  CRT_Date?: string | null;                // 建立日期
  CRT_USR_No?: string | null;              // 建立人員
  CRT_USR_Name?: string | null;            // 建立人員姓名
  UPD_Date?: string | null;                // 變更日期
  UPD_USR_No?: string | null;              // 變更人員
  UPD_USR_Name?: string | null;            // 變更人員姓名
}

export interface FIN21010Request extends BaseQueryRequest {
  BNK_DepositAccNo?: string;        // 公司銀行科目
  AccCName?: string;                // 公司銀行科目名稱
  BNK_No?: string;                  // 全省銀行代碼
  BNK_AccNo?: string[];             // 帳號
  BNK_AccName1?: string[];          // 帳戶名稱
  BNK_AccType?: string;             // 存款代號
  BNK_CheckInAccNo?: string;        // 應付票據科目
  BNK_CheckOutAccNo?: string;       // 應收票據科目
}

export interface FIN21010Response {
  id: number;
  BNK_DepositAccNo: string;
  Bank_Name: string; // 銀行名稱(新增)
  AccCName: string;
  BNK_No: string;
  BNK_AccNo: string;
  BNK_AccName1: string;
  BNK_AccType: string;
  SYS_Name: string;
  BNK_CheckInAccNo: string;
  BNK_CheckOutAccNo: string;
}

@Injectable({
  providedIn: 'root'
})
export class Fin21010Service {

  private apiUrl = environment.ApiUrl + '/FIN0000/APS1000';
  constructor(private http: HttpClient) { }

  // 查詢 APS1002 資料表
  queryFIN21010(data: FIN21010Request): Observable<BaseQueryResponse<FIN21010Response>> {
    return this.http.post<BaseQueryResponse<FIN21010Response>>(`${this.apiUrl}/queryFIN21010`, data);
  }

  // 新增 APS1002 資料
  insertFIN21010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN21010`, body);
  }

  // 修改 APS1002 資料
  updateFIN21010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN21010`, body);
  }

  // 刪除 APS1002 資料
  deleteFIN21010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFIN21010`, body);
  }

  checkDuplicateBNKid(bnkId: string, id?: number): Observable<any> {
    // 對應後端 [HttpPost("checkDuplicateBNKid")]
    return this.http.post<any>(`${this.apiUrl}/checkDuplicateBNKid`, {
      BNK_id: bnkId,
      id: id
    });
  }
}
