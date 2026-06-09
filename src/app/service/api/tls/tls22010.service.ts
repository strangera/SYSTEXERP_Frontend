import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

          res.Data = res.Data.queryTLS22010_DataList.map((item: any) => {
            // 1. 處理狀態符號前綴
            let iconHtml = '';
            switch (item.Status_Code) {
              case '#':
                iconHtml = '<span class="text-red-500 mr-1">#</span>';
                break;
              case '@':
                iconHtml = '<span class="text-red-500 mr-1">@</span>';
                break;
              case '!':
                iconHtml = '<span class="text-red-500 mr-1">!</span>';
                break;
            }

            // 2. 依據 IsCompany 判斷機號字體顏色 (false 代表它社機台，呈現藍色數字)
            const ecrNoHtml = item.IsCompany
              ? `<span class="text-blue-600 font-bold">${item.ECR_No}</span>`
              : item.ECR_No;

            return {
              ...item,
              ECR_No_Display: `${iconHtml}${ecrNoHtml}`
            };
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
        return { Data: list, TotalCount: res.TotalCount, footerData: summary };
      })
    );
  }

  exportTLS22010Detail(body: any): Observable<Blob> {
    return this.http.post<Blob>(`${this.apiUrl}/exportTLS22010Detail`, body, { responseType: 'blob' as 'json' });
  }

  exportTLS22010DetailPDF(body: any): Observable<Blob> {
    return this.http.post<Blob>(`${this.apiUrl}/exportTLS22010DetailPDF`, body, { responseType: 'blob' as 'json' });
  }
}
