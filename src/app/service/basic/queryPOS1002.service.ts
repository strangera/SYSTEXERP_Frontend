import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ECRNoService {
  apiUrl: string = environment.ApiUrl + '/queryPOS1002_DropDownList';
  title = '收銀機號下拉選單';

  constructor(
    private http: HttpClient,
  ) { }

  getECRNo(): Observable<any[]> {
    return this.http.post<any>(this.apiUrl, {}).pipe(
      map(response =>
        (response?.Data ?? []).map((item: any) => ({
          value: item.No,
          // 顯示「編號-名稱」
          label: `${item.No} - ${item.Name}`
        }))
      ),
    );
  }
  /**
* 查詢電子發票配號作業下拉選單 (POS1002)
*/
  getPOS1002BillDropDownList(): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryPOS1002_Bill_DropDownList`, {})
  }
}
