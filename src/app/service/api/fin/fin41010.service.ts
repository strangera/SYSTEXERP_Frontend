import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  FIN41010ApproveRequest,
  FIN41010ConvertRequest,
  FIN41010Response,
} from '../../../pages/fin/fin41010/fin41010.model';

@Injectable({
  providedIn: 'root',
})
export class FIN41010Service {
  // TODO: 待 API 規格確定後更新 apiUrl
  private apiUrl = environment.ApiUrl + '/FIN0000/FIN41010';

  constructor(private http: HttpClient) {}

  // TODO: 待 API 規格確定後接入真實 API，移除 mock 資料
  /** 範本下載 */
  downloadTemplate(): Observable<HttpResponse<Blob>> {
    // TODO: 替換為真實 API 呼叫
    // return this.http.post(`${this.apiUrl}/downloadTemplate`, {}, {
    //   responseType: 'blob',
    //   observe: 'response',
    // });
    const mockBlob = new Blob(['mock template content'], { type: 'text/csv' });
    const mockResponse = new HttpResponse<Blob>({
      body: mockBlob,
      status: 200,
      headers: undefined,
    });
    return of(mockResponse).pipe(delay(500));
  }

  /** 轉檔 */
  convertFile(file: File, data: FIN41010ConvertRequest): Observable<FIN41010Response> {
    // TODO: 替換為真實 API 呼叫（需使用 FormData 上傳檔案）
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('year', data.year);
    // formData.append('version', data.version);
    // formData.append('orgId', data.orgId);
    // return this.http.post<FIN41010Response>(`${this.apiUrl}/convertFile`, formData);
    return of({
      Status: 'success',
      Message: '轉檔成功（mock）',
      Data: null,
    }).pipe(delay(500));
  }

  /** 審核 */
  approve(data: FIN41010ApproveRequest): Observable<FIN41010Response> {
    // TODO: 替換為真實 API 呼叫
    // return this.http.post<FIN41010Response>(`${this.apiUrl}/approve`, data);
    return of({
      Status: 'success',
      Message: '審核成功（mock）',
      Data: null,
    }).pipe(delay(500));
  }

  /** 反審核 */
  antiApprove(data: FIN41010ApproveRequest): Observable<FIN41010Response> {
    // TODO: 替換為真實 API 呼叫
    // return this.http.post<FIN41010Response>(`${this.apiUrl}/antiApprove`, data);
    return of({
      Status: 'success',
      Message: '反審核成功（mock）',
      Data: null,
    }).pipe(delay(500));
  }
}
