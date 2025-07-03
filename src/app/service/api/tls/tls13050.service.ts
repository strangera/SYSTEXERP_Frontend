import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Tls13050Service {
  apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(
    private http: HttpClient,
  ) { }

  queryTLS13050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS13050`, data);
  }
}
