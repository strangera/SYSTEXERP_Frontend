import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Tls22010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }
  queryTLS22010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22010`, data).pipe(
      map(res => {
        if (res?.Data?.queryTLS22010_DataList) {
          const sum = res.Data.queryTLS22010_Sum;

          // 明細 + 收銀機號 icon
          res.Data = res.Data.queryTLS22010_DataList.map((item: any) => {
            let iconHtml = '';
            switch (item.Status_Code) {
              case '#': iconHtml = '<span class="text-red-500 mr-1">#</span>'; break;
              case '@': iconHtml = '<span class="text-red-500 mr-1">@</span>'; break;
              case '!': iconHtml = '<span class="text-red-500 mr-1">!</span>'; break;
            }
            return { ...item, ECR_No_Display: `${iconHtml}${item.ECR_No}` };
          });
          res.footerData = sum ? [sum] : [];
        } else {
          res.Data = [];
          res.footerData = [];
        }
        return res;
      })
    );
  }


  // 查詢收銀機對帳查詢作業 - 明細
  queryTLS22010_Detail(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS22010_Detail`, data).pipe(
      map(res => {
        const dataWrapper = res?.Data || res;
        const list = dataWrapper.queryTLS22010_DetailDataList || [];
        const summary = dataWrapper.queryTLS22010_DetailSum || null;
        return {
          Data: list,
          TotalCount: list.length,
          footerData: summary
        };
      })
    );
  }
  exportTLS22010Detail(body: any): Observable<Blob> {
    return this.http.post<Blob>(`${this.apiUrl}/exportTLS22010Detail`, body, {
      responseType: 'blob' as 'json'
    });
  }

  exportTLS22010DetailPDF(body: any): Observable<Blob> {
    return this.http.post<Blob>(`${this.apiUrl}/exportTLS22010DetailPDF`, body, {
      responseType: 'blob' as 'json'
    });
  }

}
