import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin14010Service {
  // TDS1002 營業人銷售額與稅額申報書檔
    apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';
    constructor(private http: HttpClient) { }
  
    // 查詢 TDS1002 營業人銷售額與稅額申報書檔
    // queryTLS51070(body: any): Observable<any> {
      // return this.http.post<any>(`${this.apiUrl}/queryTLS51070`, body);
    // }
}
