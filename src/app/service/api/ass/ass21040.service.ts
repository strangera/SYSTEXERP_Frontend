import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '@service/system/auth.service';

export interface ClearingASS21040 {
  SYS_StoreNo: string,
  Mid: number,
  EngTypes: string,
  ClearingYM: string
}

export interface ClearingASS21040Response {
  IsClearingSuccess: boolean,
  ErrorMsg: string
}

export interface printASS21040 {
  SYS_StoreNo: string,
  Mid: number,
  EngTypes: string,
  ClearingYM: string
}

export interface printASS21040Response {
  Print_URL: string
}

@Injectable({
  providedIn: 'root'
})

export class ASS21040Service {
  // 能源抄表作業
  apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';
  constructor(private http: HttpClient) { }

  ClearingASS21040(body: ClearingASS21040): Observable<ApiResponse<ClearingASS21040Response>> {
    return this.http.post<ApiResponse<ClearingASS21040Response>>(`${this.apiUrl}/ClearingASS21040`, body);
  }

  printASS21040(body: printASS21040): Observable<ApiResponse<printASS21040Response>> {
    return this.http.post<ApiResponse<printASS21040Response>>(`${this.apiUrl}/printASS21040`, body);
  }
}