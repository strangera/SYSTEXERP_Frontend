import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TLS2j030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTLS2J030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030`, data);
  }
  queryTLS2J030Detail1(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030Detail1`, data);
  }
  queryTLS2J030Detail2(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030Detail2`, data);
  }
   queryTLS2J030Detail3(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J030Detail3`, data);
  }
  queryEcrNo(ip: string) {
    return this.http.post(`${environment.ApiUrl}/TLS0000/TLS2000/queryEcrNo`, {
      ECR_IP: ip
    });
  }
}

