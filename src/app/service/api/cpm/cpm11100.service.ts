import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Cpm11100Request {
  Keyword: string;
  TLT_OPENFLAG: string;
}

@Injectable({
  providedIn: 'root'
})

export class Cpm11100Service {
  // 全館店櫃資訊查詢
  apiUrl: string = environment.ApiUrl + '/CPM0000/CPM1000';

  constructor(private http: HttpClient) { }

  // 查詢 全館店櫃資訊
  queryCPM11100(body: Cpm11100Request): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryCPM11100`, body);
  }
}
