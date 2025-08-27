import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin14030Service {
  // 申報書維護
  apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';
  constructor(private http: HttpClient) { }
  
  //形成申報書
  printFIN14030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/printFIN14030`, body);
  }

  // 審核功能
  ApproveFIN14030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ApproveFIN14030`, body);
  }

  // ---下拉---

  // 取得稅籍編號
  queryTDS1003_STO_TaxNo_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Share/queryTDS1003_STO_TaxNo_DropDownList`, body);
  }
}