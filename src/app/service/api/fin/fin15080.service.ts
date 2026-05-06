import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FIN15080Service {
  constructor(private http: HttpClient) {}

  /** 列印 FIN15080 */
  printFIN15080(data: {
    Mid: number;
    STO_No: string;
    REP_GUIYM: string;
    REP_TaxNo: string;
  }): Observable<any> {
    const url = `${environment.ApiUrl}/FIN0000/INV1000/PrintFIN15080`;
    return this.http.post<any>(url, data);
  }

  /** 稅籍下拉原始資料 */
  getStoTaxNoOptions(req: {
    mid: number;
    STO_No: string;
  }): Observable<any[]> {
    const url = `${environment.ApiUrl}/Share/queryTDS1003_STO_TaxNo_DropDownList`;

    return this.http.post<any>(url, req).pipe(
      map((res) => {
        return res?.Data?.TDS1003STO_TaxNos ?? [];
      })
    );
  }
}