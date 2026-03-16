import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ASS21060Data, ASS21060Query } from '@pages/ass/ass21060/ass21060.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2100';

@Injectable({ providedIn: 'root' })
export class ASS21060Service {

  constructor(
    private http: HttpClient,
  ) { }

  public queryASS21060(query: ASS21060Query): Observable<BaseQueryResponse<ASS21060Data>> {
    return this.http.post<BaseQueryResponse<ASS21060Data>>(`${apiUrl}/queryASS21060`, query).pipe(
      map(res => {
        const enhancedData: ASS21060Data[] = res.Data.map(item => ({
          ...item,
          dataKey: `${item.TLT_No ?? ''}-${item.Contract_No ?? ''}-${item.Contract_SubNo ?? ''}`
        }));

        return {
          ...res,
          Data: enhancedData
        } as BaseQueryResponse<ASS21060Data>;
      })
    );
  }
}