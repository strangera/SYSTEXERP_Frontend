import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

/** 查詢條件 Interface */
export interface QueryCPM11090Request {
  recDateFrom: string;
  recDateTo: string;
  byMissingPeople?: string;
  collectionSites?: string;
  sortBy?: string;
}

/** 查詢結果 Interface */
export interface QueryCPM11090Response {
  mid: number;
  sto_NO: string;
  seQ_ID: string;
  rec_DATE: string;
  by_MISSING_PEOPLE: string;
  salutation: string;
  SalutationName: string;
  collectioN_SITES: string;
  missinG_PEOPLE: string;
  relations: string;
  relations_Name: string;
  broadcasT_YN: string; // 是否廣播 (Y/N/null)
  IsFinished: string;   // 是否結案 (已結案/未結案 或 true/false)
}

/** 明細結果 Interface (編輯/檢視用) */
export interface QueryDetailResponse {
  ID: number,
  MID: number,
  STO_NO: string,
  SEQ_ID: string,
  BY_MISSING_PEOPLE: string,
  SalutationCode: string,
  SalutationName: string,
  COLLECTION_SITES: string,
  MISSING_PEOPLE: string,
  RelationsCode: string,
  RelationsName: string,
  REC_DATE: Date,
  BROADCAST_YN: string,
  BROADCAST_SITUAATION: string,
  BROADCAST_DATE: string,
  IsFinished: boolean,
  CRT_Date: string,
  CRT_USR_No: string,
  CRT_USR_Name: string,
  UPD_Date: string,
  UPD_USR_No: string,
  UPD_USR_Name: string
}

/** 新增資料 Interface */
export interface InsertCPM11090Request {
  by_MISSING_PEOPLE: string; // 被尋人姓名
  salutation?: string;       // 被尋人稱謂
  collectioN_SITES: string;  // 集合地點
  missinG_PEOPLE?: string;   // 尋人者
  relations?: string;        // 與被尋人關係
  reC_DATE: string | Date;   // 登錄日期
}

/** 編輯資料 Interface */
export interface UpdateCPM11090Request {
  seQ_ID: string;
  by_MISSING_PEOPLE: string;
  salutation?: string;
  collectioN_SITES: string;
  missinG_PEOPLE?: string;
  relations?: string;
  broadcast_YN?: string; // 新增此欄位
}

@Injectable({
  providedIn: 'root'
})
export class Cpm11090Service {
  apiUrl: string = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  /** * 查詢清單
   * @param body 查詢條件
   */
  queryCPM11090(body: QueryCPM11090Request): Observable<ApiResponse<QueryCPM11090Response[]>> {
    return this.http.post<ApiResponse<QueryCPM11090Response[]>>(`${this.apiUrl}/queryCPM11090`, body).pipe(
      map(res => {
        return {
          ...res,
          Data: res.Data.map(item => ({
            ...item,
            // 處理稱謂轉換
            salutation: getSYS1000Options('SALUTATION').find(opt => opt.label === item.SalutationName)?.value || '',
            // 處理廣播狀態顯示文字 (可選：視後端回傳格式而定)
            broadcasT_YN: item.broadcasT_YN === 'Y' ? '已廣播' : (item.broadcasT_YN === 'N' ? '不廣播' : '待廣播')
          }))
        };
      })
    );
  }

  /**
   * 取得單筆明細 (用於編輯畫面初始化)
   * @param seQ_ID 登錄編號
   */
  getCPM11090Detail(seQ_ID: string): Observable<ApiResponse<QueryDetailResponse>> {
    return this.http.post<ApiResponse<QueryDetailResponse>>(`${this.apiUrl}/getCPM11090Detail`, { seQ_ID });
  }

  /** * 新增尋人廣播
   * @param body 新增內容
   */
  insertCPM11090(body: InsertCPM11090Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/insertCPM11090`, body);
  }

  /** * 編輯尋人廣播
   * @param body 更新內容（包含 MID, STO_NO, SEQ_ID 作為 Key）
   */
  updateCPM11090(body: UpdateCPM11090Request): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateCPM11090`, body);
  }

  /**
   * 已領回 (結案)
   * @param body 包含 seQ_ID
   */
  finishedCPM11090(body: { seQ_ID: string }): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/finishedCPM11090`, body);
  }

  /**
   * 重新廣播
   * @param seQ_ID 登錄編號
   */
  broadcastCPM11090(seQ_ID: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/broadcastCPM11090`, { seQ_ID });
  }
}
