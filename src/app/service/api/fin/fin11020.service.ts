import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface MainInvoiceData {
  ID: number;
  GUI_YYMM: string;
  GUI_SerNo: number;
  GUI_Track: string;
  GUI_BegNo: string;
  GUI_EndNo: string;
  GUI_TotQty: number;
  GUI_AssignQty: number;
  GUI_Status: string;
  GUI_Type?: string;
  GUI_VERIFY1?: string;
  GUI_VERIFY1_Name?: string;
  GUI_VERIFY2?: string | null;
  GUI_VERIFY2_Name?: string | null;
  GUI_File?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
  details: SubInvoiceData[]; // 包含子表資料
}

interface SubInvoiceData {
  STO_No: string;
  GUI_YYMM: string;
  GUI_SerNo: number;
  GUI_Track: string;
  GUI_BegNo: string;
  GUI_EndNo: string;
  GUI_TotQty: number;
  GUI_AssignQty: number;
  GUI_Status: string;
  GUI_ProcStatus?: string | null;
  GUI_ProcDate?: string | null;
  GUI_Type?: string;
  STO_Uniform?: string;
  CRT_Date?: string;
  CRT_USR_No?: string;
  CRT_USR_Name?: string;
  UPD_Date?: string | null;
  UPD_USR_No?: string | null;
  UPD_USR_Name?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class Fin11020Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS1017 資料表
   */
  queryFIN11020(params: {
    PageSize: number;
    PageIndex: number;
    OrderBy?: string;
    Offset?: number;
    SortBy?: { field: string; order: number }[];
    GUI_YYMM_start?: string;
    GUI_YYMM_end?: string;
    GUI_Track?: string;
    GUI_No_start?: string;
    GUI_No_end?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/queryFIN11020`, params);
  }

  /**
   * 新增 POS1017 資料
   */
  insertFIN11020(data: {
    GUI_YYMM: string;
    GUI_Track: string;
    GUI_BegNo: string;
    GUI_EndNo: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertFIN11020`, data);
  }

  /**
   * 更新 POS1017 資料
   */
  updateFIN11020(data: {
    ID: number;
    GUI_YYMM: string;
    GUI_Track: string;
    GUI_BegNo: string;
    GUI_EndNo: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateFIN11020`, data);
  }

  /**
   * 刪除 POS1017 資料
   */
  deleteFIN11020(idList: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteFIN11020`, { idList });
  }

  /**
   * 匯入 POS1017 檔案
   */
  uploadFIN11020(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/uploadFIN11020`, formData);
  }
}
