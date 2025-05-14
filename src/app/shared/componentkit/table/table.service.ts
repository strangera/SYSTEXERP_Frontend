import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TableService {
  apiUrl = `${environment.ApiUrl}`;
  constructor(private http: HttpClient) { }

  exportPDF(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/TSRDERP_Main/Controllers/exportPDF`, data);
  }
  exportExcel(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/exportExcel`, data);
  }
}
