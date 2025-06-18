import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Fin11200Service {
  private apiUrl: string = environment.ApiUrl + '/FIN0000/INV1000';

  constructor(private http: HttpClient) { }

  /**
   * 查詢 POS1018 資料表
   */
  queryFIN11200(params: {
    PageSize?: number;
    PageIndex?: number;
    SortBy?: { field: string; order: number }[];

  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/queryFIN11200`, params);
  }
}
