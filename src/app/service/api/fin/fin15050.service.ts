import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

// --- FIN15050 列印參數 Model 定義 ---
export interface FIN15050PrintRequest {
  Mid: number;
  STO_No: string;
  REP_GUIYM: string;                // 申報年月
  GUI_Track: string;                // 字軌
  SAL_Type: string;                 // 使用別
  INV_GUINumber_S: string;          // 發票號碼起
  INV_GUINumber_E: string;          // 發票號碼訖
}

@Injectable({
  providedIn: 'root'
})
export class FIN15050Service {
  private printApiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  // 列印
  printFIN15050(data: FIN15050PrintRequest): Observable<any> {
    return this.http.post<any>(`${this.printApiUrl}/PrintFIN15050`, data);
  }
}