import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  QueryASS15050ApiResponse,
  QueryASS15050Request,
} from '@pages/ass/ass15050/ass15050.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ASS15050Service {
  private readonly apiUrl = `${environment.ApiUrl}/ASS0000/ASS1000`;

  constructor(private readonly http: HttpClient) {}

  queryASS15050(body: QueryASS15050Request): Observable<QueryASS15050ApiResponse> {
    return this.http.post<QueryASS15050ApiResponse>(`${this.apiUrl}/queryASS15050`, body);
  }

  exportPDFASS15050(body: QueryASS15050Request): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFASS15050`, body, {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
