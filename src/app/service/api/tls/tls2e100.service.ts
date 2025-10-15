import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS2E100Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }
  /** 年度對帳單 查詢 */
  queryTLS2E100(body: any): Observable<any> {
    const payload = {
      PageSize: body.PageSize ?? 30,
      PageIndex: body.PageIndex ?? 1,
      OrderBy: body.OrderBy ?? '',
      Offset: 0,
      SortBy: body.SortBy ?? [{ field: 'apply_no', order: 1 }],
      sad_date: body.sad_date ?? '',
      tlt_noList: body.tlt_noList ?? [],
      org_idList: body.org_idList ?? [],
      tlt_floorList: body.tlt_floorList ?? [],
      tlt_buildingList: body.tlt_buildingList ?? [],
    };

    return this.http.post<any>(`${this.apiUrl}/queryTLS2E100`, payload).pipe(
      map(res => {
        const mainData = res?.Data?.mainData ?? [];
        const totalData = res?.Data?.totalData ?? [];

        return {
          Data: mainData,
          TotalCount: res?.TotalCount ?? mainData.length,
          footerData: Array.isArray(totalData) && totalData.length > 0 ? totalData[0] : totalData
        };
      })
    );
  }


  /** 匯出 Excel */
  exportTLS2E100(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2E100Excel`, body, {
      responseType: 'blob'
    });
  }

  /** 匯出 PDF */
  exportTLS2E100PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS2E100PDF`, body, {
      responseType: 'blob'
    });
  }
}
