import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../fin/fin26010.service';

export interface CPM12030Request {
  query: string;
}

export interface CPM12030Response {
  id: number;
  name: string;
}

export interface InsertCPM12030Request {
  name: string;
}

export interface UpdateCPM12030Request {
  id: number;
  name: string;
}
@Injectable({
  providedIn: 'root'
})
export class Cpm12030Service {
  apiUrl: string = environment.ApiUrl + '/SYS0000/BAS1000';

  constructor(private http: HttpClient) { }

  queryCPM12030(body: CPM12030Request): Observable<ApiResponse<CPM12030Response[]>> {
    return this.http.post<ApiResponse<CPM12030Response[]>>(`${this.apiUrl}/queryCPM12030`, body);
  }
  insertCPM12030(body: InsertCPM12030Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/insertCPM12030`, body);
  }

  updateCPM12030(body: UpdateCPM12030Request[]): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(`${this.apiUrl}/updateCPM12030`, body);
  }
}
