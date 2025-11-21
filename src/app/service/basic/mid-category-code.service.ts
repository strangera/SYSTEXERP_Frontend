import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MidCategoryCodeService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl = `${environment.ApiUrl}/TLS0000/TLS5000/queryTLS51020_DropDownList`;
  title = '中分類代碼';

  constructor(
    private http: HttpClient,
  ) { }

  // 根據 CAT_LNo 查詢中分類代碼
  getSystemTypesByCatLNo(catLNo: string): Observable<{ value: string, label: string }[]> {
    const params = {
      id: 0,
      No: '',
      Name: '',
      CAT_LNo: catLNo || '' // 傳遞大分類代碼
    };

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('queryTLS51020_DropDownList response', data)),
      map(response => {
        const data = response.Data || [];
        return data.map((item: any) => ({
          value: item.No || '',
          label: `${item.No || ''} - ${item.Name || ''}`
        }));
      }),
    );
  }
  // 原有方法（保留，供其他地方使用）
  getSystemTypes(): Observable<{ value: string, label: string }[]> {
    return this.getSystemTypesByCatLNo(''); // 重用新方法，傳空值表示不過濾
  }
}
