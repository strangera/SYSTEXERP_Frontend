import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


/**
 * 請求物件 (對應後端 TLS2J040Request)
 */
export interface TLS2J040Request {
  /**
   * 換開日期 (對應 txn_date)
   */
  TxnDate: Date;

  /**
   * 三聯式發票號碼 (對應 TXN_GUINo)
   */
  TxnGUINo?: string;

  /**
   * 買受人統一編號 (對應 TXN_Uniform)
   */
  TxnUniform?: string;
}
@Injectable({
  providedIn: 'root',
})

export class TLS2j040Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

      // 列印
    print(data: TLS2J040Request): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/PrintTLS2J040`, data);
    }
}
