import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS12050ConfirmRequest,
  ASS12050ConfirmResult,
  ASS12050Detail,
  ASS12050ForceCloseRequest,
  ASS12050ForceCloseResult,
  ASS12050InsertRequest,
  ASS12050InsertResult,
  ASS12050QueryDataWrapper,
  ASS12050QueryRow,
  ASS12050SubcheckRequest,
  ASS12050TransferDataWrapper,
  ASS12050TransferRow,
  ASS12050UpdateRequest,
  ASS12050UpdateResult,
  ASS12050VoidRequest,
  ASS12050VoidResult,
  ASS12050ListForTransferRequest,
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

  constructor(private http: HttpClient) {}

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

  /** 取得單筆驗收單明細 (編輯/明細頁用) */
  detailASS12050(body: ASS12050SubcheckRequest): Observable<ApiResponse<ASS12050Detail>> {
    return this.http.post<ApiResponse<ASS12050Detail>>(`${this.apiUrl}/detailASS12050`, body);
  }

  /** 驗收確認 */
  confirmASS12050(body: ASS12050ConfirmRequest): Observable<ApiResponse<ASS12050ConfirmResult>> {
    return this.http.post<ApiResponse<ASS12050ConfirmResult>>(`${this.apiUrl}/confirmASS12050`, body);
  }

  /** 更新驗收單 */
  updateASS12050(body: ASS12050UpdateRequest): Observable<ApiResponse<ASS12050UpdateResult>> {
    return this.http.post<ApiResponse<ASS12050UpdateResult>>(`${this.apiUrl}/updateASS12050`, body);
  }

  /** 強制結案 */
  forceCloseASS12050(body: ASS12050ForceCloseRequest): Observable<ApiResponse<ASS12050ForceCloseResult>> {
    return this.http.post<ApiResponse<ASS12050ForceCloseResult>>(`${this.apiUrl}/forceCloseASS12050`, body);
  }

  /** 作廢 */
  voidASS12050(body: ASS12050VoidRequest): Observable<ApiResponse<ASS12050VoidResult>> {
    return this.http.post<ApiResponse<ASS12050VoidResult>>(`${this.apiUrl}/voidASS12050`, body);
  }

  /** 取得可轉入採購單清單 */
  listForTransferASS12050(body: ASS12050ListForTransferRequest): Observable<ApiResponse<ASS12050TransferRow[]>> {
    return this.http
      .post<ApiResponse<ASS12050TransferDataWrapper>>(`${this.apiUrl}/listForTransferASS12050`, body)
      .pipe(
        map(res => ({
          ...res,
          Data: res.Data?.QueryData ?? [],
          TotalCount: res.Data?.TotalRows ?? 0,
        } as ApiResponse<ASS12050TransferRow[]>)),
      );
  }

  /** 匯出 PDF 報表 */
  exportPDFASS12050(body: ASS12050SubcheckRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS12050`, body, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
