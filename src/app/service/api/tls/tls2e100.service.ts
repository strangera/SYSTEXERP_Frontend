import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS2E100Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS2000`;

  constructor(private http: HttpClient) { }

  queryTL2E100(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2E100`, body).pipe(
      map(res => ({
        Data: res?.Data ?? [],
        TotalCount: res?.TotalCount ?? (res?.Data?.length ?? 0),
        footerData: null
      }))
    );
  }

}
