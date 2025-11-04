import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN71010Service {

  public readonly test = !0;

  public readonly FIN71010Data = signal<unknown[]>([]);

  private readonly tableCancel$ = new Subject<void>();

  public tableLoading = signal<boolean>(!1);
  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN71010(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/queryFIN71010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN71010Data.set(res.Data)),
      tap(() => this.logger.debug('查詢FIN71010結果:', [this.FIN71010Data()])),
      finalize(() => this.tableLoading.set(!1))
    );
  };
}
