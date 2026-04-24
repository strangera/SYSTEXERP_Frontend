import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './fin26010.service';

export interface FIN15100QueryParams {
  INV_DeclareYM: string | null,
  TXN_Ret_NoS: string | null,
  TXN_Ret_NoE: string | null,
  InvoiceTrack: string | null,
  InvoiceNumberS: string | null,
  InvoiceNumberE: string | null,
  Mid: number,
  STO_No: string
}

@Injectable({ providedIn: 'root' })
export class FIN15100Service {
  constructor(private http: HttpClient) { }
  // 新增：呼叫列印 PI
  printFIN15100(data: FIN15100QueryParams): Observable<ApiResponse<{ Print_URL: string }>> {
    return this.http.post<ApiResponse<{ Print_URL: string }>>(`${environment.ApiUrl}/FIN0000/INV1000/PrintFIN15100`, data);
  }
}
