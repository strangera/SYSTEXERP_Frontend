import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Fin11030Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS1017 資料表
   */
  queryFIN11030(params: {}): Observable<any> {
    return this.http.post(`${this.apiUrl}/queryFIN11030`, params);
  }

  /**
   * 新增 POS1017 資料
   */
  insertFIN11030(data: {
    GUI_YYMM: string;
    GUI_Track: string;
    GUI_BegNo: string;
    GUI_EndNo: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertFIN11030`, data);
  }

  /**
   * 更新 POS1017 資料
   */
  updateFIN11030(data: {
    ID: number;
    GUI_YYMM: string;
    GUI_Track: string;
    GUI_BegNo: string;
    GUI_EndNo: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateFIN11030`, data);
  }

  /**
   * 刪除 POS1017 資料
   */
  deleteFIN11030(idList: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteFIN11030`, { idList });
  }
}
