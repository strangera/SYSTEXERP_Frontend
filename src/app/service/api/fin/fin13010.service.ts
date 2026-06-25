import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FIN13010Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // ✅ 查詢
  queryFIN13010(query: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13010`, query)
      .pipe(
        tap(res => console.log('查詢結果:', res)),
      );
  }

  // ✅ 下拉：依字軌查發票清單
  queryINV1000List(param: { GUI_Track: string }): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13010_PURGUINo`,
      param
    );
  }

  // ✅ 新增
  insertFIN13010(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/insertFIN13010`, data)
      .pipe(
        tap(res => console.log('新增結果:', res)),
      );
  }

  // ✅ 更新
  updateFIN13010(data: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/updateFIN13010`, data)
      .pipe(
        tap(res => console.log('更新結果:', res)),
      );
  }
  queryFIN13100ByVoucherNo(voucherNo: string) {
  return this.http.post<any>('/FIN0000/INV1000/queryFIN13100', {
    PageSize: 10,
    PageIndex: 1,
    VouNoStart: voucherNo,
    VouNoEnd: voucherNo,
  });
}

  // ✅ 明細：依 PUR_GUINo 查明細
  queryDetailByPURGUINo(param: { PUR_GUINo: string }): Observable<any> {
    // 這裡原本就沒加 apiUrl，我保持你的寫法
    return this.http.post<any>('/FIN13010/queryDetailByPURGUINo', param);
  }

  // ✅ 依 ID 查單筆（含原始發票參考欄位，Total_Amt 排除當前筆）
  queryFIN13010ById(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/FIN0000/INV1000/queryFIN13010ById`, { id });
  }

  // ✅ 對應發票：依對應號碼查
  queryCorrespondByGUINoCorrespond(param: { PUR_GUINo_Correspond: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/FIN0000/INV1000/queryFIN13010_Correspond`,
      param
    );
  }

  // ✅ 刪除（新增的 API）
  // 呼叫方式：deleteFIN13010([1, 2, 3])
  deleteFIN13010(idList: number[]): Observable<any> {
    const body = { idList };
    return this.http
      .post<any>(`${this.apiUrl}/FIN0000/INV1000/deleteFIN13010`, body)
      .pipe(
        tap(res => console.log('刪除結果:', res)),
      );
  }

  // ✅ 審核狀態查詢（用於判斷申報年月是否可異動，共用 FIN14030 endpoint）
  checkRepAuditStatus(params: { REP_GUIYM: string }): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/FIN0000/INV1000/checkRepAuditStatus`,
      params
    );
  }
}
