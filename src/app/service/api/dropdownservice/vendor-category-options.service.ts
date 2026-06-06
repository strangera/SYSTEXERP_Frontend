import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendorCategoryOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  // 廠商別下拉選項
  getVendorCategoryOptions(venFlag?: string): Observable<any[]> {
    const requestBody = {
      VEN_Flag: venFlag || ""
    };

    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2013_DropDownList`, requestBody)
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,  // 改這裡
          value: x.No
        })) ?? [])
      );
  }

  // 新增/編輯用：value = VEN_No（廠商編號，唯一識別），保留原始行為
  getVendorCategoryNoNameOptionsForCru(venFlag?: string): Observable<any[]> {
    const requestBody = { VEN_Flag: venFlag || '' };
    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2013_DropDownList`, requestBody)
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({
          label: `${x.No} - ${x.Name} - ${x.VEN_No}`,
          value: x.VEN_No,
          VEN_No: x.VEN_No,
          No: x.No,
          Name: x.Name,
          VEN_Address: x.VEN_Address
        })) ?? [])
      );
  }

  // 查詢用：value = 統編No（去重，避免同統編多筆）
  getVendorCategoryNoNameOptions(venFlag?: string): Observable<any[]> {
    const requestBody = {
      VEN_Flag: venFlag || ""
    };

    return this.http
      .post<any>(`${this.apiUrl}/queryPOS2013_DropDownList`, requestBody)
      .pipe(
        map((res) => {
          const seen = new Set<string>();
          const items: any[] = [];
          for (const x of res?.Data ?? []) {
            const uniform = x.No as string;
            if (!uniform || seen.has(uniform)) continue;
            seen.add(uniform);
            items.push({
              label: `${x.No} - ${x.Name}`,
              value: x.No,             // value 用統編
              VEN_No: x.VEN_No,
              No: x.No,
              Name: x.Name,
              VEN_Address: x.VEN_Address
            });
          }
          return items;
        })
      );
  }
}
