import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { SortMeta } from 'primeng/api';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- Interface 定義 ---

export interface Tls2e060QueryBody {
  pageSize: number;
  pageIndex: number;
  SortBy: SortMeta[];
  adj_no: string;
  adj_date: string;
  sam_yyymm: string;
}

export interface Tls2e060Data {
  adj_no: string;
  adj_date: string;
  sam_yyymm: string;
  tlt_no: string;
  contract_no: string;
  contract_subno: string;
  money_type: string;      // 結帳方式 10=十日結 15=半月結 30=月結
  money_type_desc: string; // 結帳方式名稱（後端已轉換好的中文名稱）
  sam_termno: string;      // 帳次
  adj_taxtype: string;
  adj_amount: number;
  remarks: string;      // 修正為複數符合後端
  sale_lock: string;    // [新增] 判斷鎖定狀態: 'Y' 為鎖定
  CRT_Date: string;
  CRT_USR_No: string;
  CRT_USR_Name: string;
  UPD_Date: string;
  UPD_USR_No: string;
  UPD_USR_Name: string;
}

// [新增] 更新資料用的 Body
export interface Tls2e060UpdateBody {
  adj_no: string;
  sam_yyymm: string;
  sam_termno: number;
  tlt_no: string;
  talent_id: number;
  adj_taxtype: string;
  adj_amount: number;
  remarks: string;
}

// [新增] 刪除資料用的 Body (List 批次刪除)
export interface Tls2e060DeleteBody {
  adj_nos: string[];
}

export interface Tls2e060DropDownListData {
  tlt_no: string;
  tlt_name: string;
  talent_id: number;
  contract_no: string;
  contract_subno: number;
  money_type: string;
  sam_termno: number;
}

export interface Tls2e060CreateBody {
  sam_yyymm: string;
  sam_termno: number;
  tlt_no: string;
  talent_id: number;
  adj_taxtype: string;
  adj_amount: number;
  remarks: string; // 補上備註
}

// --- API URL 定義 ---
const BASE_URL = environment.ApiUrl + '/TLS0000/TLS2000';
const QUERY_API_URL = `${BASE_URL}/queryTLS2E060`;
const CREATE_API_URL = `${BASE_URL}/createTLS2E060`;
const UPDATE_API_URL = `${BASE_URL}/updateTLS2E060`; // [新增]
const DELETE_API_URL = `${BASE_URL}/deleteTLS2E060`; // [新增]
const DROPDOWN_LIST_API_URL = environment.ApiUrl + '/queryTLS2E060_TLTTALENTDropDownList';

@Injectable({
  providedIn: 'root'
})
export class Tls2e060Service {

  constructor(private http: HttpClient) { }

  /** 查詢專櫃結帳前調整作業資料 */
  queryTls2e060(queryBody: Tls2e060QueryBody): Observable<ApiResponse<Tls2e060Data[]>> {
    return this.http.post<ApiResponse<Tls2e060Data[]>>(QUERY_API_URL, queryBody).pipe(
      map((res: ApiResponse<Tls2e060Data[]>) => {
        // 確保回傳結構與 ApiResponse 一致
        return {
          ...res,
          Data: res.Data?.map((item: Tls2e060Data) => ({
            ...item,
            sam_yyymm: item.sam_yyymm && item.sam_yyymm.length >= 6
              ? `${item.sam_yyymm.substring(0, 4)}/${item.sam_yyymm.substring(4, 6)}`
              : item.sam_yyymm,
          }))
        };
      })
    );
  }

  /** 新增調整資料 */
  createTls2e060(createBody: Tls2e060CreateBody): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(CREATE_API_URL, createBody);
  }

  /** [新增] 更新調整資料 */
  updateTls2e060(updateBody: Tls2e060UpdateBody): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(UPDATE_API_URL, updateBody);
  }

  /** [新增] 刪除調整資料 (批次) */
  deleteTls2e060(deleteBody: Tls2e060DeleteBody): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(DELETE_API_URL, deleteBody);
  }

  /** 查詢專櫃下拉選單資料 */
  queryTltTalentDropdownList(sam_yyymm: string): Observable<ApiResponse<Tls2e060DropDownListData[]>> {
    const body = { sam_yyymm };
    return this.http.post<ApiResponse<Tls2e060DropDownListData[]>>(DROPDOWN_LIST_API_URL, body);
  }
}
