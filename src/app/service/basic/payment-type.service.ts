import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PaymentTypeService {
  apiUrl: string = environment.ApiUrl;
  title = '付款別';

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * 取得付款別清單 (轉換成 {value, label} 格式)
   */
  getPaymentTypes(): Observable<any[]> {
    const url = `${this.apiUrl}/queryPOS1006_DropDownList`;

    return this.http.post<any>(url, {}).pipe(
      map((res) =>
        (res?.Data ?? []).map((item: any) => ({
          value: item.No,
          label: item.Name,
          PAY_Type: item.PAY_Type, // 保留原始欄位，若之後需要用得到
        }))
      ),
    );
  }
}
