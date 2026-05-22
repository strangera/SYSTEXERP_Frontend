import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from './tls25030.service';

export interface InsertTLS47010Request {
  DEFTBL_List: string;
  POS1002_List: string;
}
@Injectable({
  providedIn: 'root'
})
export class TLS47010Service {
  private readonly apiUrl = environment.ApiUrl;
  private readonly http = inject(HttpClient);
  insertTLS47010(data: InsertTLS47010Request): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.apiUrl}/TLS0000/TLS4000/insertTLS47010`, data);
  }
}
