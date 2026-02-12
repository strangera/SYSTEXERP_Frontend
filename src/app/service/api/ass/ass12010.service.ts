import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS12010ApproveRequest, ASS12010Data, ASS12010DeleteRequest, ASS12010DetailRequest, ASS12010DetailResponse, ASS12010DownloadReportRequest, ASS12010InsertRequest, ASS12010QueryDataWrapper, ASS12010QueryRequest, ASS12010UpdateRequest } from '@pages/ass/ass12010/ass12010.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ASS12010Service {
  private readonly apiUrl = environment.ApiUrl + '/ASS0000/ASS1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢請購申請資料
   */
  queryASS12010(payload: ASS12010QueryRequest): Observable<ApiResponse<ASS12010Data[]>> {
    return this.http.post<ApiResponse<ASS12010QueryDataWrapper>>(`${this.apiUrl}/queryASS12010`, payload)
      .pipe(
        map(res => {
          return {
            ...res,
            Data: res.Data.QueryData,
            TotalCount: res.Data.TotalRows
          } as ApiResponse<ASS12010Data[]>;
        })
      );
  }

  /**
   * 取得請購申請詳細資料
   */
  detailASS12010(payload: ASS12010DetailRequest): Observable<ApiResponse<ASS12010DetailResponse>> {
    return this.http.post<ApiResponse<ASS12010DetailResponse>>(`${this.apiUrl}/detailASS12010`, payload);
  }

  /**
   * 新增請購申請資料
   */
  insertASS12010(payload: ASS12010InsertRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/insertASS12010`, payload);
  }

  /**
   * 更新請購申請資料
   */
  updateASS12010(payload: ASS12010UpdateRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/updateASS12010`, payload);
  }

  /**
   * 刪除請購申請資料
   */
  deleteASS12010(payload: ASS12010DeleteRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/deleteASS12010`, payload);
  }

  /**
   * 審核請購申請資料
   */
  approveASS12010(payload: ASS12010ApproveRequest): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/statusASS12010`, payload);
  }

  /**
   * 下載請購申請報表
   */
  downloadReportASS12010(payload: ASS12010DownloadReportRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS12010`, payload, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      take(1)
    );
  }
}
