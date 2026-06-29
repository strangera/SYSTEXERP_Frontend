import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FIN62050QueryRequest, FIN62050ResponseItem } from '../../../pages/fin/fin62050/fin62050.types';

@Injectable({
  providedIn: 'root'
})
export class Fin62050Service {
  private readonly baseUrl = `${environment.ApiUrl}/FIN0000/NTS1000`;
  private readonly http = inject(HttpClient);

  queryFIN62050(body: FIN62050QueryRequest): Observable<FIN62050ResponseItem[]> {
    return this.http
      .post<ApiResponse<FIN62050ResponseItem[]>>(`${this.baseUrl}/queryFIN62050`, body)
      .pipe(map(res => res.Data));
  }

  exportFIN62050PDF(body: FIN62050QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.baseUrl}/exportFIN62050PDF`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  exportFIN62050Excel(body: FIN62050QueryRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.baseUrl}/exportFIN62050Excel`, body, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
