import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ASS21050Service {
  // 能源抄表作業
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';
  constructor(private http: HttpClient) { }

  // 查詢 能源抄表作業
  queryASS21050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryASS21050`, body);
  }
  insertASS21050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertASS21050`, body);
  }
  updateASS21050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateASS21050`, body);
  }
  deleteASS21050(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteASS21050`, body);
  }
}
