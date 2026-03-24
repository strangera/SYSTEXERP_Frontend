import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Fin32010Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/ARS1000';

  constructor(private http: HttpClient) { }

  queryFIN32010(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryFIN32010`, params).pipe(
      map(res => {
        if (res?.Data?.mainData) {
          res.footerData = res?.Data?.totalData ? res.Data.totalData[0] : {};
          res.Data = res.Data.mainData;
        }
        return res;
      })
    );
  }
  updateFIN32010(params: any): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/updateFIN32010`, params);
  }
}
