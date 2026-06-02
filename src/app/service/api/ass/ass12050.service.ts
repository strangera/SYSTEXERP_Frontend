import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS12050ConfirmRequest,
  ASS12050Detail,
  ASS12050ForceCloseRequest,
  ASS12050GetDetailRequest,
  ASS12050GetMasterRequest,
  ASS12050InsertRequest,
  ASS12050InsertResult,
  ASS12050MasterDataWrapper,
  ASS12050MasterRow,
  ASS12050QueryDataWrapper,
  ASS12050QueryRow,
  ASS12050SubcheckRequest,
  ASS12050TransferListDataWrapper,
  ASS12050TransferRequest,
  ASS12050TransferRow,
  ASS12050UpdateRequest,
  ASS12050VoidRequest,
  QueryASS12050Request,
} from '@pages/ass/ass12050/ass12050.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS12050Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /** 採購單驗收查詢 */
  queryASS12050(body: QueryASS12050Request): Observable<ApiResponse<ASS12050QueryRow[]>> {
    return this.http
      .post<ApiResponse<ASS12050QueryDataWrapper>>(`${this.apiUrl}/queryASS12050`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.QueryData ?? [],
          TotalCount: res.Data?.TotalRows ?? 0,
        } as ApiResponse<ASS12050QueryRow[]>)),
      );
  }

  /** 新增驗收單 */
  insertASS12050(body: ASS12050InsertRequest): Observable<ApiResponse<ASS12050InsertResult>> {
    return this.http.post<ApiResponse<ASS12050InsertResult>>(`${this.apiUrl}/insertASS12050`, body);
  }

  /** 取得採購單編輯主檔 */
  getMasterASS12050(body: ASS12050GetMasterRequest): Observable<ApiResponse<ASS12050MasterRow[]>> {
    return this.http
      .post<ApiResponse<ASS12050MasterDataWrapper>>(`${this.apiUrl}/getMasterASS12050`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.Details ?? [],
          TotalCount: res.Data?.TotalRows ?? 0,
        } as ApiResponse<ASS12050MasterRow[]>)),
      );
  }

  /** 取得採購單編輯明細（以 SUBCHECK_ID 查詢主檔+明細） */
  getDetailASS12050(body: ASS12050GetDetailRequest): Observable<ApiResponse<ASS12050Detail>> {
    return this.http.post<ApiResponse<ASS12050Detail>>(`${this.apiUrl}/getDetailASS12050`, body);
  }

  /** 驗收確認 */
  confirmASS12050(body: ASS12050ConfirmRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/confirmASS12050`, body);
  }

  /** 更新驗收單 */
  updateASS12050(body: ASS12050UpdateRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/updateASS12050`, body);
  }

  /** 強制結案 */
  forceCloseASS12050(body: ASS12050ForceCloseRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/forceCloseASS12050`, body);
  }

  /** 作廢 */
  voidASS12050(body: ASS12050VoidRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/voidASS12050`, body);
  }

  /** 取得可轉入採購單清單 */
  listForTransferASS12050(): Observable<ApiResponse<ASS12050TransferRow[]>> {
    return this.http
      .post<ApiResponse<ASS12050TransferListDataWrapper>>(`${this.apiUrl}/listForTransferASS12050`, {})
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.ListData ?? [],
          TotalCount: res.Data?.TotalRows ?? 0,
        } as ApiResponse<ASS12050TransferRow[]>)),
      );
  }

  /** 轉入採購單 */
  transferASS12050(body: ASS12050TransferRequest): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/transferASS12050`, body);
  }

  /** 匯出 PDF 報表 */
  exportPDFASS12050(body: ASS12050SubcheckRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportASS12050`, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /** 依採購單號匯出 PDF 報表 */
  exportASS12050(body: { SUBPOENA_ID: string }): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportASS12050`, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
