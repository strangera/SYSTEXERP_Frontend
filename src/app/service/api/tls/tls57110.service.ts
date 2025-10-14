import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS57110Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }

  queryTLS57110(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57110`, body).pipe(
      map(res => {
        const data = res?.Data ?? res;
        return {
          Data: data?.Datas ?? [],
          TotalCount: res?.TotalCount ?? data?.Datas?.length ?? 0,
          footerData: data?.SumData ?? null,
          detailSumData: data?.DetailSumData ?? [],
        };
      })
    );
  }

  /** 匯出 XLSX */
  exportTLS57110(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS57110`, body, {
      responseType: 'blob'
    });
  }

  /** 匯出 PDF */
  exportTLS57110PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS57110PDF`, body, {
      responseType: 'blob'
    });
  }

  /** 分組工具 */
  private _groupBy(array: any[], key: string): Record<string, any[]> {
    return array.reduce((acc: Record<string, any[]>, obj: any) => {
      const val = obj[key] ?? '未分類';
      if (!acc[val]) acc[val] = [];
      acc[val].push(obj);
      return acc;
    }, {});
  }
}
