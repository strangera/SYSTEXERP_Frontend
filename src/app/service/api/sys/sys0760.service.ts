import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../system/auth.service';
import { SortMeta } from 'primeng/api';

export interface userLoginErrorRequest {
  PageSize: number,
  PageIndex: number,
  SortBy: SortMeta[]
  User_No: string,
  Description: string,
  From_IP: string,
  Start_Date: string,
  End_Date: string
}

export interface userLoginErrorResponse {
  User_No: string,
  Description: string,
  From_IP: string,
  Login_time: string
}

@Injectable({
  providedIn: 'root',
})
export class SYS0760Service {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  queryUserLoginError(body: userLoginErrorRequest): Observable<ApiResponse<userLoginErrorResponse[]>> {
    return this.http.post<ApiResponse<userLoginErrorResponse[]>>(`${this.apiUrl}/User/queryUserLoginError`, body)
  }
}
