import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ASS21060Data,
  ASS21060ExportQuery,
  ASS21060Query
} from '@pages/ass/ass21060/ass21060.model';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';

@Injectable({ providedIn: 'root' })
export class ASS21060Service {
  constructor(private http: HttpClient) { }

  public queryASS21060(query: ASS21060Query): Observable<ApiResponse<ASS21060Data[]>> {
    return this.http.post<ApiResponse<ASS21060Data[]>>(`${apiUrl}/queryASS21060`, query).pipe(
      map(res => {
        const enhancedData: ASS21060Data[] = (res.Data ?? []).map(item => ({
          ...item,
          dataKey: `${item.TLT_No ?? ''}-${item.Contract_No ?? ''}-${item.Contract_SubNo ?? ''}`
        }));

        return {
          ...res,
          Data: enhancedData
        } as ApiResponse<ASS21060Data[]>;
      })
    );
  }

  public exportASS21060Excel(body: ASS21060ExportQuery): Observable<HttpResponse<Blob>> {
    return this.http.post(`${apiUrl}/exportASS21060`, this.stripPaging(body), {
      observe: 'response',
      responseType: 'blob',
    });
  }

  public exportASS21060PDF(body: ASS21060ExportQuery): Observable<HttpResponse<Blob>> {
    return this.http.post(`${apiUrl}/exportASS21060PDF`, this.stripPaging(body), {
      observe: 'response',
      responseType: 'blob',
      headers: {
        Accept: 'application/pdf'
      }
    });
  }

  private stripPaging<T extends Record<string, any>>(input: T): T {
    if (!input) {
      return input;
    }

    const {
      pageIndex,
      pageSize,
      PageIndex,
      PageSize,
      Offset,
      OrderBy,
      ...rest
    } = input as any;

    if (Array.isArray((input as any).SortBy)) {
      (rest as any).SortBy = (input as any).SortBy;
    }

    if (Array.isArray((input as any).Columns)) {
      (rest as any).Columns = (input as any).Columns;
    }

    return rest as T;
  }
}
