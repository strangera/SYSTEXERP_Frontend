import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN71020Service {

  public readonly test = !0;

  public readonly FIN71020Data = signal<unknown[]>([]);

  private readonly tableCancel$ = new Subject<void>();

  public tableLoading = !1;
  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN71020(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/queryFIN71020`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN71020Data.set(res.Data)),
      tap(() => this.logger.debug('查詢FIN71020結果:', [this.FIN71020Data()])),
      finalize(() => this.tableLoading = !1)
    );
  };
}
