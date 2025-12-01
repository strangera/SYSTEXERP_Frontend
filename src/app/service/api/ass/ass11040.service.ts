import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

export interface ASS11040Request {
  query: string;
}

export interface ASS11040Response {
  id: number;
  name: string;
}

export interface InsertASS11040Request {
  name: string;
}

export interface UpdateASS11040Request {
  id: number;
  name: string;
}
@Injectable({
  providedIn: 'root'
})
export class Ass11040Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  queryASS11040(body: ASS11040Request): Observable<ApiResponse<ASS11040Response[]>> {
    return this.http.post<ApiResponse<ASS11040Response[]>>(`${this.apiUrl}/queryASS11040`, body);
  }
  insertASS11040(body: InsertASS11040Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertASS11040`, body);
  }

  updateASS11040(body: UpdateASS11040Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateASS11040`, body);
  }
}
