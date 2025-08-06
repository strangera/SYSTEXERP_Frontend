import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FIN15070Service {
  private apiUrl = `${environment.ApiUrl}/FIN15070`;

  constructor(private http: HttpClient) {}

  queryFIN15070(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/queryFIN15070`, data);
  }
}
