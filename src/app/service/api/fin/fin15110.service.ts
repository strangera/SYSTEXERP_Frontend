import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse,} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})

export class FIN15110Service {
 private apiUrl = `${environment.ApiUrl}/FIN0000/INV1000`;

  constructor(private http: HttpClient) {}

 QueryFIN15110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15110`, data);
  }
 PrintFIN15110(body: any): Observable<HttpResponse<Blob>> {
  return this.http.post(`${this.apiUrl}/printFIN15110`, body, {
    observe: 'response',
    responseType: 'blob'
  });
}

}
