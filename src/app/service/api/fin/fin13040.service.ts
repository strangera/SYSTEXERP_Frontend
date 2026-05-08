import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin13040Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) { }

  /** 查詢非三聯式收銀機發票調整作業清單 */
  queryFIN13040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryFIN13040`, data);
  }

  /** 查詢非三聯式收銀機發票調整作業 Detail */
  queryFIN13040Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/QueryFIN13040Detail`, data);
  }

  /** 儲存非三聯式收銀機發票調整作業 Detail */
  updateFIN13040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UpdateFIN13040`, data);
  }

  /** 作廢發票 */
  voidFIN13040(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/VoidFIN13040`, data);
  }

  /** 三聯式發票列印 */
  printFIN13040(data: any): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/PrintFIN13040`, data, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
