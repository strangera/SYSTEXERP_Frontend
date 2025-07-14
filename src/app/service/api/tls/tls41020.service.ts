import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';



@Injectable({ providedIn: 'root' })
export class TLS41020Service {
  private API_URL = `${environment.ApiUrl}/TLS0000/TLS4000`;
  
  constructor(private http: HttpClient) {}

  queryTLS41020(payload: any): Observable<any> {
    return this.http.post(`${this.API_URL}/queryTLS41020`, payload);
  }

  insertTLS41020(payload: any): Observable<any> {
    return this.http.post(`${this.API_URL}/insertTLS41020`, payload);
  }

  updateTLS41020(payload: any): Observable<any> {
    return this.http.post(`${this.API_URL}/updateTLS41020`, payload);
  }

  deleteTLS41020(body: { idList: number[] }): Observable<any> {
    return this.http.post(`${this.API_URL}/deleteTLS41020`, body);
  }
}
