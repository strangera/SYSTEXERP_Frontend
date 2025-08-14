import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin11060Service {
  // 電子發票上送狀況 (POS8011H)
    apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';
    constructor(private http: HttpClient) { }
  
    // 查詢 電子發票上送狀況 資料表
    queryFIN11060(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/queryFIN11060`, body);
    }
}
