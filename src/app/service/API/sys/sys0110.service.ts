import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Sys0110Service {
  apiUrl: string = environment.ApiUrl + '/User';

  constructor(private http: HttpClient) { }

  // 查詢 tblUser 資料表
  queryUser(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryUser`, body);
  }
}
