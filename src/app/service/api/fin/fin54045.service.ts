import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Fin54045Service {
  private readonly apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

  constructor(private http: HttpClient) { }

  queryFIN54045(params: any): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${this.apiUrl}/queryFIN54045`, params);
  }
  executeFIN54045(params: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/executeFIN54045`, params);
  }
}
