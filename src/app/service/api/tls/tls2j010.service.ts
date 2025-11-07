import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS2J010Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';
  constructor(private http: HttpClient) { }

  queryTLS2J010(body: any): Observable<any> {
    const payload = {
      ...body,
      PageSize: body.pageSize || body.PageSize || 20,
      PageIndex: body.pageIndex || body.PageIndex || 1,
    };
    delete payload.pageSize;
    delete payload.pageIndex;
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J010`, payload);
  }
  insertTLS2J010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/insertTLS2J010`, body);
  }
  updateTLS2J010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/updateTLS2J010`, body);
  }
  deleteTLS2J010(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteTLS2J010`, body);
  }
}
