import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class SYSBR00Service {
  apiUrl: string = environment.ApiUrl + '/CityDist';

  constructor(
    private http: HttpClient,
  ) { }

  // 查詢所有縣市
  queryCities(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetCity`, {})
  }
  // 查詢所有區域
  queryDistricts(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetArea`, {})
  }
  // 條件查詢
  queryCitiesByCondition(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetCity`, data)
  }
  // 刪除縣市
  deleteCity(cityId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/DeleteSYS2000`, cityId); // 直接傳遞 cityId
  }
  // 修改縣市
  updateCity(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UpdateSYS2000`, data);
  }
  // 新增縣市
  insertCity(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/InsertSYS2000`, data);
  }
  // 刪除區域
  deleteArea(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/DeleteSYS2100`, data);
  }
  // 修改區域
  updateArea(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UpdateArea`, data);
  }
  // 新增區域
  insertArea(CITY_No: string, district: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/InsertSYS2100`, { CITY_No, ...district });
  }


}
