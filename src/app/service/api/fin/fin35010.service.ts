import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

export interface FIN35010Request {
  query: string;
}

export interface FIN35010Response {
  id: number;
  name: string;
}

export interface InsertFIN35010Request {
  name: string;
}

export interface UpdateFIN35010Request {
  id: number;
  name: string;
}
@Injectable({
  providedIn: 'root'
})
export class Fin35010Service {
  apiUrl: string = environment.ApiUrl + '/FIN0000/ARS1000';

  constructor(private http: HttpClient) { }

  queryFIN35010(body: FIN35010Request): Observable<ApiResponse<FIN35010Response[]>> {
    return this.http.post<ApiResponse<FIN35010Response[]>>(`${this.apiUrl}/queryFIN35010`, body);
  }

  insertFIN35010(body: InsertFIN35010Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertFIN35010`, body);
  }

  updateFIN35010(body: UpdateFIN35010Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateFIN35010`, body);
  }
}
