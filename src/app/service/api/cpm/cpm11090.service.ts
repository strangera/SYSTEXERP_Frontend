import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { getSYS1000Options } from '@service/system/sys1000.service';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from './cpm11030.service';

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
  broadcasT_YN: string;
  IsFinished: string;
}

/** 新增資料 Interface */
export interface InsertCPM11090Request {
  by_MISSING_PEOPLE: string;
  salutation?: string;
  collectioN_SITES: string;
  missinG_PEOPLE?: string;
  relations?: string;
  reC_DATE: string | Date;
}

/** 編輯資料 Interface */
export interface UpdateCPM11090Request {
  seQ_ID: string;
  by_MISSING_PEOPLE: string;
  salutation?: string;
  collectioN_SITES: string;
  missinG_PEOPLE?: string;
  relations?: string;
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
            salutation: getSYS1000Options('SALUTATION').find(opt => opt.label === item.SalutationName)?.value || '',
          }))
        };
      })
    );
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
