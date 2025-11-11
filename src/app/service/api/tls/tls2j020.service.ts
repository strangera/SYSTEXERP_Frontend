import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS2J020Service {
  apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';
  constructor(private http: HttpClient) { }


  queryTLS2J020(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS2J020`, body);
  }

}
