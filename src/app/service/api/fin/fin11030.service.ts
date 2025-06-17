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
   * 查詢 APS2001 資料表
   */
  queryFIN11030(params: {
    PageSize?: number;
    PageIndex?: number;
    OrderBy?: string;
    Offset?: number;
    SortBy?: { field: string; order: number }[];
    SAL_GUIYYYYMM_start?: string;
    SAL_GUIYYYYMM_end?: string;
    SAL_GUITrack?: string;
    SAL_GUINo_start?: string;
    SAL_GUINo_end?: string;
    SAL_GUIPaper?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/queryFIN11030`, params);
  }

  /**
   * 新增 APS2001 資料
   */
  insertFIN11030(data: {
    SAL_GUIYYYYMM: string;
    SAL_GUITrack: string;
    SAL_GUIBegNo: string;
    SAL_GUIEndNo: string;
    SAL_GUIPaper: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertFIN11030`, data);
  }

  /**
   * 更新 APS2001 資料
   */
  updateFIN11030(data: {
    id: number;
    SAL_GUIYYYYMM: string;
    SAL_GUITrack: string;
    SAL_GUIBegNo: string;
    SAL_GUIEndNo: string;
    SAL_GUIPaper: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateFIN11030`, data);
  }

  /**
   * 刪除 APS2001 資料
   */
  deleteFIN11030(idList: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteFIN11030`, { idList });
  }
}
