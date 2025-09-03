import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin14040Service {
  // 形成媒體申報檔
    apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';
    constructor(private http: HttpClient) { }
    
    //形成媒體申報檔
    printFIN14040(body: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/PrintFIN14040`, body);
    }
  
    // ---下拉---
  
    // 取得稅籍編號
    queryTDS1003_STO_TaxNo_DropDownList(body: any): Observable<any> {
      return this.http.post<any>(`${environment.ApiUrl}/Share/queryTDS1003_STO_TaxNo_DropDownList`, body);
    }
}
