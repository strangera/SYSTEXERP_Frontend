import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BussclassDropdownService {
  apiUrl: string = environment.ApiUrl;
  queryApiUrl = `${environment.ApiUrl}/queryTLTBUSSCLASS_DropDownList`;
  title = '小分類代碼';

  constructor(
    private http: HttpClient,
  ) { }

  /**
   * 根據大分類和中分類取得小分類選項
   * @param busTypes 大分類代碼陣列
   * @param classTypes 中分類代碼陣列
   */
  getSystemTypesByBustype(busTypes: string[], classTypes: string[]): Observable<{ value: string, label: string }[]> {
    // 將 busTypes 和 classTypes 組合成新的參數格式
    const queryInfos = [];
    const maxLength = Math.max(busTypes.length, classTypes.length);

    for (let i = 0; i < maxLength; i++) {
      if (busTypes[i] && classTypes[i]) {
        queryInfos.push({
          bus_type: busTypes[i],
          bus_class: classTypes[i]
        });
      }
    }

    const params = {
      queryTLTBUSSCLASSInfos: queryInfos
    };

    return this.http.post<any>(this.queryApiUrl, params).pipe(
      tap(data => console.debug('queryTLTBUSSCLASS_DropDownList response', data)),
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
