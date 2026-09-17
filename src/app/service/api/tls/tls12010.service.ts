import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls12010Service {
  // Potential_Customer 潛在客戶主檔
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS1000';
  constructor(private http: HttpClient) { }

  // 查詢 Potential_Customer 資料表
  queryTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12010`, body);
  }

  // 查詢 Potential_Customer_Detail資料表
  queryTLS12010_Detail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12010_Detail`, body);
  }

  // 新增 Potential_Customer 資料表
  insertTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS12010`, body);
  }

  // 更新 Potential_Customer 資料表
  updateTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS12010`, body);
  }

  // 刪除 Potential_Customer 資料表
  deleteTLS12010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS12010`, body);
  }

  // 查詢 POS2013 資料表
  queryTLS12010_POS2013(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12010_POS2013`, body);
  }

  //匯出主表 Excel
  exportTLS12010(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS12010`, body, {
      responseType: 'blob'
    });
  }

  //匯出主表 PDF
  exportTLS12010PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS12010PDF`, body, {
      responseType: 'blob'
    });
  }

  // 匯出 明細PDF(主表和明細一起一起匯出，改用exportTLS12010)
  // exportTLS12010_Detail(body: any): Observable<Blob> {
  //   return this.http.post(`${this.apiUrl}/exportTLS12010_Detail`, body, {
  //     responseType: 'blob'
  //   });
  // }

  //匯出 明細Excel(主表和明細一起一起匯出，改用exportTLS12010PDF)
  // exportTLS12010_DetailPDF(body: any): Observable<Blob> {
  //   return this.http.post(`${this.apiUrl}/exportTLS12010_DetailPDF`, body, {
  //     responseType: 'blob'
  //   });
  // }

  // --- dropDown ---

  // 查詢 大分類(業種)設定檔
  queryTLTBUSTYPE_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`, body);
  }

  // 查詢 品牌代碼(PLULOGO) 設定檔
  queryPLULOGO_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLULOGO_DropDownList`, body);
  }

  // 廠商統一編號下拉（從Potential_Customer取distinct值，與POS2013無關）
  queryTLS12010_CusUniformDropDown(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12010_CusUniformDropDown`, {});
  }
  // 查詢 經營方式 設定檔 (SYS1000.t117)
  querySYS1000_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/querySYS1000_DropDownList`, body);
  }
  // 查詢 潛在客戶 (tblUser)
  queryTBLUSER_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTBLUSER_DropDownList`, body);
  }
}
