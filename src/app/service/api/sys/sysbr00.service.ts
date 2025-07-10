import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SYSBR00Service {
  private apiUrl: string = environment.ApiUrl + '/CityDist';

  constructor(private http: HttpClient) {}

  // ✅ 查詢縣市（條件式）
  queryCitiesByCondition(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetCity`, data);
  }

  // ✅ 新增縣市
  insertCity(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/InsertSYS2000`, data);
  }

  // ✅ 修改縣市
  updateCity(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/UpdateSYS2000`, data);
  }

  // ✅ 刪除縣市
  deleteCity(cityId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/DeleteSYS2000`, cityId);
  }

  // ⛔️（選用）查詢全部城市
  queryAllCities(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/GetCity`, {});
  }
}
