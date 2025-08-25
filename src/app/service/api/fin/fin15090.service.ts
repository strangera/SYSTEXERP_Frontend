import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FIN15090Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) {}

  PrintFIN15090(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/PrintFIN15090`, data);
  }

  //稅籍編號下拉選單
  queryTDS1003_STO_TaxNo_DropDownList(data: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/Share/queryTDS1003_STO_TaxNo_DropDownList`, data);
  }
}
