import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FIN15100Service {
  private apiUrl = `${environment.ApiUrl}/FIN15100`;

  constructor(private http: HttpClient) {}

  queryFIN15100(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15100`, data);
  }
    // 新增：呼叫列印 API
  printFIN15100(data: {
    INV_DeclareYM: string;
    TXN_Ret_NoS?: string | null;
    TXN_Ret_NoE?: string | null;
    InvoiceTrack?: string | null;
    InvoiceNumberS?: string | null;
    InvoiceNumberE?: string | null;
    Mid: number;
    STO_No: string;
  }): Observable<any> {
    const url = `${environment.ApiUrl}/FIN0000/INV1000/PrintFIN15100`;
    return this.http.post<any>(url, data);
  }
}
