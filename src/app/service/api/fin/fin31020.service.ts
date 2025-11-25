import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FIN31020Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/ARS1000`;

  constructor(private http: HttpClient) { }
  // 查詢銷項發票明細表
  queryFIN31020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN31020`, data);
  }
  queryFIN31020Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN31020Detail`, data);
  }
  insertFIN31020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertFIN31020`, data);
  }
  updateFIN31020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateFIN31020`, data);
  }
}
