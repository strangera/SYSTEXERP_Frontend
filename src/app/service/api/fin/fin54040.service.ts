import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin54040Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  queryFIN54040(params: any): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryFIN54040`, params);
  }
  executeFIN54040(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/executeFIN54040`, params);
  }

}
