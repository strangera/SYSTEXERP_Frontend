import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BigCategoryCodeService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl = `${environment.ApiUrl}/queryTLTBUSTYPE_DropDownList`;
  title = '大分類代碼';

  constructor(
    private http: HttpClient,
  ) { }

  getSystemTypes(): Observable<{ value: string, label: string }[]> {
    const payload = {};
    return this.http.post<any>(this.queryApiUrl, payload, {
    }).pipe(
      tap(data => console.debug('/queryTLTBUSTYPE_DropDownList', data)),
      map(response => {
        const data = response.Data || [];
        return data.map((item: any) => ({
          value: item.No || '',
          label: `${item.No || ''} - ${item.Name || ''}`
        }));
      }),
    );
  }
}
