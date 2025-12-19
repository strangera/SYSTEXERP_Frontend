import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class CPM11080Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;

  constructor(private http: HttpClient) { }

  queryCPM11080(params: any): Observable<HttpResponse<any>> {
    const url = `${this.apiUrl}/queryCPM11080`;
    return this.http.post<any>(url, params, { observe: 'response' });
  }
  updateCPM11080(params: any): Observable<HttpResponse<any>> {
    const url = `${this.apiUrl}/updateCPM11080`;
    return this.http.post<any>(url, params, { observe: 'response' });
  }
}
