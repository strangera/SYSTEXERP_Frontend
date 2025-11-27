import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN71010Service {

  public readonly test = !0;

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN71010(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/queryFIN71010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN71010結果:', [res.Data])),
    );
  };
}
