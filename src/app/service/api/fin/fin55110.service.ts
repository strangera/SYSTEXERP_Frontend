import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FIN55110Service {
  private apiUrl = `${environment.ApiUrl}/FIN0000/GLS1000`;

  constructor(private http: HttpClient) { }

  queryFIN55110(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN55110`, data);
  }
  exportFIN55110(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN55110`, data, { responseType: 'blob' });
  }
  exportFIN55110PDF(data: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/exportFIN55110PDF`, data, { responseType: 'blob' });
  }
}
