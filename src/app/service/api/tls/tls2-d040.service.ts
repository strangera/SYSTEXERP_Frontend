import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryRequest } from '@shared/models/api/base-api.interface';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// 查詢TLS2D040 Request型別
export interface QueryTLS2D040Request extends BaseQueryRequest {
  tlt_no?: string[];           // 專櫃編號 (陣列)
  source_type?: string[];      // 扣款來源 (1-合約扣款, 2-人工扣款, 4-罰款, 5-能源扣款, 8-溢欠款, 13-電子商務) (陣列)
  CAP_Item?: string[];         // 扣款代碼 (陣列)
  AccNo?: string[];            // 會計科目 (陣列)
  tpy_bdate?: string;          // 扣款年月(起)
  tpy_edate?: string;          // 扣款年月(訖)
  VEN_No?: string;             // 廠商編號
  pod_no?: string;             // 活動代碼/名稱
  GUI_FLAG?: string;           // Y=開立發票 N=不開立發票(DEFAULT Y)
  org_id?: string[];           // 組織代碼(SYS3100) (陣列)
  close_flag?: string;         // 類型，類型 Y=已結帳 N=未結帳
  bus_type?: string[];         // 大分類代碼 (陣列)
  store_way?: string;          // 專櫃/自營櫃(1=專櫃 2=自營)
  building_no?: string[];      // 館別 (陣列)
  FLOOR_NO?: string[];         // 樓層 (陣列)
  ShowNeg?: boolean;          // 只顯示負值
}

@Injectable({
  providedIn: 'root'
})
export class TLS2D040Service {
  private apiUrl = environment.ApiUrl + '/TLS0000/TLS2000';

  constructor(private http: HttpClient) { }

  // 查詢依會計科目彙總資料
  queryTLS2D040_Acct(req: QueryTLS2D040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D040_Acct`, req);
  }

  // 查詢依專櫃彙總資料
  queryTLS2D040_TLT(req: QueryTLS2D040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D040_TLT`, req);
  }

  // 查詢依扣款項目彙總資料
  queryTLS2D040_ChargeItem(req: QueryTLS2D040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D040_ChargeItem`, req);
  }

  // 查詢依部門彙總資料
  queryTLS2D040_Department(req: QueryTLS2D040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D040_Department`, req);
  }

  // 查詢明細資料
  queryTLS2D040_Detail(req: QueryTLS2D040Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2D040_Detail`, req);
  }
  //匯出明細excel
  exportTLS2D040_Detail(req: QueryTLS2D040Request): Observable<Blob> {
    // 後端實際路徑為 /TLS0000/TLS2000/exportTLS2D040
    return this.http.post(`${this.apiUrl}/exportTLS2D040`, req, { responseType: 'blob' });
  }
  //匯出明細PDF
  exportTLS2D040PDF_Detail(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040PDF`, req, { responseType: 'blob' });
  }
  //匯出依專櫃彙總excel
  exportTLS2D040_TLT_Summary(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_TLT_Summary`, req, { responseType: 'blob' });
  }
  //匯出依據扣款項目彙總excel
  exportTLS2D040_ChargeItem_Summary(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_ChargeItem_Summary`, req, { responseType: 'blob' });
  }
  //匯出依據部門彙總excel
  exportTLS2D040_Department_Summary(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_Department_Summary`, req, { responseType: 'blob' });
  }
  //匯出依會計科目彙總excel
  exportTLS2D040_Acct_Summary(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_Acct_Summary`, req, { responseType: 'blob' });
  }
  //匯出依專櫃彙總PDF
  exportTLS2D040_TLT_SummaryPDF(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_TLT_SummaryPDF`, req, { responseType: 'blob' });
  }
  //匯出依據扣款項目彙總PDF
  exportTLS2D040_ChargeItem_SummaryPDF(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_ChargeItem_SummaryPDF`, req, { responseType: 'blob' });
  }
  //匯出依據部門型態別PDF
  exportTLS2D040_Department_SummaryPDF(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_Department_SummaryPDF`, req, { responseType: 'blob' });
  }
  //匯出依會計科目彙總PDF
  exportTLS2D040_Acct_SummaryPDF(req: QueryTLS2D040Request): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2D040_Acct_SummaryPDF`, req, { responseType: 'blob' });
  }
}
