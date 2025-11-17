import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TLS57110Service {
  private apiUrl = `${environment.ApiUrl}/TLS0000/TLS5000`;

  constructor(private http: HttpClient) { }
  queryTLS57110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryTLS57110`, data);
  }


  /** 匯出 XLSX */
  exportTLS57110(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS57110`, body, {
      responseType: 'blob'
    });
  }

  /** 匯出 PDF */
  exportTLS57110PDF(body: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportTLS57110PDF`, body, {
      responseType: 'blob'
    });
  }
}
