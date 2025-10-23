import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TLS57030Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS1000`;

  constructor(private http: HttpClient) {}

  queryTLS57030(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57030`, data);
  }


}
