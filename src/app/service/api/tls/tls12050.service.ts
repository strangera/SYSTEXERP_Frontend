import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TLS12050Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) {}

  queryTLS12050(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS12050`, data);
  }
}
