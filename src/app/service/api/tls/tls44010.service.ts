import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TLS44010Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS4000`;

  constructor(private http: HttpClient) {}

  queryTLS44010(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS44010`, data);
  }
}
