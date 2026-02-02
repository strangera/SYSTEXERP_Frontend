import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ApplyPurchaseListRow,
  ApplyQuotedListRow,
  ASS12030Detail,
  ASS12030InsertRequest,
  ASS12030QueryRow,
  ASS12030UpdateRequest,
  QueryASS12030Request,
} from '@pages/ass/ass12030/ass12030.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';


const emptyApiMeta = {
  Timestamp: '',
  RequestId: '',
};

@Injectable({
  providedIn: 'root',
})
export class ASS12030Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 採購申請查詢
   */
  queryASS12030(body: QueryASS12030Request): Observable<ApiResponse<ASS12030QueryRow[]>> {
    return of({
      Status: '0000',
      Data: [],
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 新增採購申請
   */
  insertASS12030(body: ASS12030InsertRequest): Observable<ApiResponse<unknown>> {
    return of({
      Status: '0000',
      Data: {},
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 取得單筆採購申請 (編輯/明細頁用)
   */
  getASS12030Detail(id: string | number): Observable<ApiResponse<ASS12030Detail>> {
    return of({
      Status: '0000',
      Data: {
        id,
        NOTES: '',
        EMP_ID: '',
        ORG_ID: '',
        APPLY_DATE: '',
        SUPPLIER_ID: '',
        EXPEND_TYPE: '',
        Details: [],
      },
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 更新採購申請
   */
  updateASS12030(id: number | string, body: ASS12030UpdateRequest): Observable<ApiResponse<unknown>> {
    return of({
      Status: '0000',
      Data: {},
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 刪除採購申請
   */
  deleteASS12030(idList: number[]): Observable<ApiResponse<unknown>> {
    return of({
      Status: '0000',
      Data: {},
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 做廢採購申請
   */
  voidASS12030(idList: number[]): Observable<ApiResponse<unknown>> {
    return of({
      Status: '0000',
      Data: {},
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 報表功能
   */
  reportASS12030(params: { id?: number | string }): Observable<ApiResponse<Blob>> {
    return of({
      Status: '0000',
      Data: new Blob(),
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 取得詢價清單 (套用請購清單彈窗用)
   */
  getQuotedList(): Observable<ApiResponse<ApplyQuotedListRow[]>> {
    return of({
      Status: '0000',
      Data: [],
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 取得單筆詢價明細 (套用請購清單確認後載入明細)
   */
  getQuotedDetail(id: string): Observable<ApiResponse<ASS12030Detail>> {
    return of({
      Status: '0000',
      Data: { Details: [] },
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 取得請購清單 (套用詢價清單彈窗用)
   */
  getPurchaseRequestList(): Observable<ApiResponse<ApplyPurchaseListRow[]>> {
    return of({
      Status: '0000',
      Data: [],
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }

  /**
   * 取得單筆請購明細 (套用詢價清單確認後載入明細)
   */
  getPurchaseRequestDetail(needId: string): Observable<ApiResponse<ASS12030Detail>> {
    return of({
      Status: '0000',
      Data: { Details: [] },
      TotalCount: 0,
      TotalPage: 0,
      Message: '',
      Error: null,
      Meta: emptyApiMeta,
    });
  }
}
