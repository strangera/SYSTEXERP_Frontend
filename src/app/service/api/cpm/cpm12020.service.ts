import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

export interface CPM12020Request {
  query: string;
}

export interface CPM12020Response {
  id: number;
  name: string;
}

export interface InsertCPM12020Request {
  name: string;
}

export interface UpdateCPM12020Request {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class Cpm12020Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  queryCPM12020(body: CPM12020Request): Observable<ApiResponse<CPM12020Response[]>> {
    return this.http.post<ApiResponse<CPM12020Response[]>>(`${this.apiUrl}/queryCPM12020`, body);
  }

  insertCPM12020(body: InsertCPM12020Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertCPM12020`, body);
  }

  updateCPM12020(body: UpdateCPM12020Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateCPM12020`, body);
  }
}
