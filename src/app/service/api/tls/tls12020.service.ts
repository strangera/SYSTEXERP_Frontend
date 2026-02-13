import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TLS12020Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) { }

  queryTLS12020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12020`, data);
  }

  insertTLS12020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS12020`, data);
  }

  updateTLS12020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS12020`, data);
  }

  deleteTLS12020(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS12020`, data);
  }
  queryTLS12010_POS2013(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12010_POS2013`, data);
  }
}
