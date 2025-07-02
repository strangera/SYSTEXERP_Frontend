import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls51070Service {
  // POS2004 商品基本資料
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS5000';
  constructor(private http: HttpClient) { }

  // 查詢 POS2004 資料表
  queryTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51070`, body);
  }

  // 新增 POS2004、POS2005、POS2010、IMG1001 資料表，更新SER1001流水號
  insertTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51070`, body);
  }

  // 更新 POS2004、POS2005、POS2010、IMG1001 資料表
  updateTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51070`, body);
  }

  // 刪除 POS2004 資料表
  deleteTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51070`, body);
  }

  // 查詢 POS2005_國際條碼、POS2020_採購廠商、IMG1001_商品圖檔
  queryTLS51070_Detail(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51070_Detail`, body);
  }

  // ---圖片處理---

  //查詢圖片
  queryImage(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Image/queryImage`, body);
  }

  // 上傳圖片
  uploadImages(formData: FormData): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Image/uploadImages`, formData);
  }

  //下載圖片
  downloadImage(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Image/downloadImage`, body);
  }

  //刪除圖片
  deleteImage(body: any): Observable<any> {
    return this.http.delete<any>(`${environment.ApiUrl}/Image/deleteImage`, body);
  }

  downloadImage2(path: string): Observable<Blob> {
  return this.http.get(`${environment.ApiUrl}/${path}`, {
    responseType: 'blob'
  });
}

  // --- 標籤檔 ---

  //取得標籤檔資料
  getLabelTLS51070(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/getLabelTLS51070`, body);
  }

  //產生標籤檔資料
  exportLabel(data: any[]): Observable<string> {
      return this.http.post(`${environment.ApiUrl}/ExportLabel/ExportLabel`, data, {
      responseType: 'text'  // 後端回傳的是純文字
    });
  }

  // --- dropDown ---

  // 查詢 大分類(業種)設定檔
  queryCAT_LNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2003_DropDownList`, body);
  }

  // 查詢 中分類(商品類別) 設定檔
  queryCAT_MNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS20031_DropDownList`, body);
  }

  // 查詢 小分類(POS20032) 設定檔
  queryCAT_SNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS20032_DropDownList`, body);
  }

  // 查詢 商品單位(PLUUNIT) 設定檔
  queryPLUUNIT_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLUUNIT_DropDownList`, body);
  }

  // 查詢 品牌代碼(PLULOGO) 設定檔
  queryPLULOGO_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPLULOGO_DropDownList`, body);
  }

  // 查詢 專櫃主檔(TLTTALENT) 設定檔
  queryTLTTALENT_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_DropDownList`, body);
  }

  // 查詢 廠商(POS2013) 設定檔
  queryPOS2013_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS2013_DropDownList`, body);
  }
}