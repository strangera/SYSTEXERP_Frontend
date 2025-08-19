import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ASS21030Service {
  // 能源抄表作業
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';
  constructor(private http: HttpClient) { }

  // 查詢 能源抄表作業
  queryASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryASS21030`, body);
  }

  // 新增 能源抄表作業
  insertASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertASS21030`, body);
  }

  // 更新 能源抄表作業
  updateASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateASS21030`, body);
  }

  // 刪除 能源抄表作業
  deleteASS21030(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteASS21030`, body);
  }
}