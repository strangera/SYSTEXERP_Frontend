import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Tls51110Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) {}

  queryTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS51110`, data);
  }

  insertTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS51110`, data);
  }

  updateTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS51110`, data);
  }

  deleteTLS51110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS51110`, data);
  }
}
