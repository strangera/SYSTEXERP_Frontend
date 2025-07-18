import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls29010Service {
  // POS2004 TALPORDERD_OPENDisc 折扣開放維護作業
    apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';
    constructor(private http: HttpClient) { }

  // 查詢 專櫃編號
  queryTLTTALENT_Status_DropDownList(body: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTLTTALENT_Status_DropDownList`, body);
  }  
}
