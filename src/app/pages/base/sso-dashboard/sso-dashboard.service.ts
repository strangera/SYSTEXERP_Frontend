import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ApiItem {
  System_Id: string,
  System_Name: string,
  System_Url: string,
  System_ImgFile: string,
  IsEnable?: string,
  Seq_No?: number,
  CRT_Date?: string,
  CRT_USR_No?: string,
  CRT_USR_Name?: string,
  UPD_Date?: string,
  UPD_USR_No?: string,
  UPD_USR_Name?: string

  dynamicColor?: string,
  customOrder?: number
}

@Injectable({
  providedIn: 'root',
})
export class SsoDashboardService {
  private apiUrl: string = environment.ApiUrl + '/SSOLogin';

  constructor(private http: HttpClient) { }

  // 模擬 API 呼叫，返回一個 Observable<ApiItem[]>
  fetchUrlList(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/querySSOLogin`, {});
  }

  Inner(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/Inner`);
  }

  Outer(token: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/Outer?oneTimeToken=${encodeURIComponent(token)}`);
  }
}

