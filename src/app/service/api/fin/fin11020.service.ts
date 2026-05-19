import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
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
  details: SubInvoiceData[];
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
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  /** 查詢發票資料 */
  queryFIN11020(params: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/queryFIN11020`, params);
  }

  /** 新增發票資料 */
  insertFIN11020(data: Partial<MainInvoiceData>): Observable<any> {
    return this.http.post(`${this.apiUrl}/insertFIN11020`, data);
  }

  /** 更新發票資料 */
  updateFIN11020(data: Partial<MainInvoiceData>): Observable<any> {
    return this.http.post(`${this.apiUrl}/updateFIN11020`, data);
  }

  /** 刪除發票資料 */
  deleteFIN11020(idList: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/deleteFIN11020`, { idList });
  }

  /** 匯入 CSV 檔案 */
  uploadFIN11020(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/uploadFIN11020`, formData);
  }
}