import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin33010Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/ARS1000';

  constructor(private http: HttpClient) { }
  queryFIN33010(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/queryFIN33010`, params);
  }
  insertFIN33010(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertFIN33010`, payload);
  }
}
