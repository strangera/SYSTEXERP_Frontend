import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ASS21030Service {
  // 能源抄表作業
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';
  constructor(private http: HttpClient) { }

  // 查詢 能源抄表作業
  queryASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryASS21030`, body);
  }

  // 更新 能源抄表作業 (都用匯入處理，暫時不用這支)
  updateASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateASS21030`, body);
  }

  // 刪除 能源抄表作業
  deleteASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteASS21030`, body);
  }

  // 匯入 能源抄表作業
  importASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ImportASS21030`, body);
  }

  // 取得能源表號
  queryENG1001_ENG_MeterNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Share/queryENG1001_ENG_MeterNo_DropDownList`, body);
  }

  // 取得錶號最新一筆抄表記錄 (新增時使用)
  getLatestReading(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getLatestReading`, body);
  }

  // 取得上一期抄表記錄 (編輯/檢視時使用)
  getPreviousReading(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getPreviousReading`, body);
  }

  exportASS21030(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportASS21030`, body, { responseType: 'blob' });
  }

  exportASS21030PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportASS21030PDF`, body, { responseType: 'blob' });
  }
}
