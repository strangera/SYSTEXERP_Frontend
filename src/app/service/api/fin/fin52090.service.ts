import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { AccNoDropdown, FIN52090Data, FIN52090Insert, FIN52090Query } from '@pages/fin/fin52090/fin52090.model';
import { BaseQueryRequest, BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52090Service {

  public readonly test = !0;

  public readonly FIN52090Data = signal<FIN52090Data[]>([]);
  public readonly accNo = signal<AccNoDropdown[]>([]);

  private readonly tableCancel$ = new Subject<void>();
  private readonly accNoCancel$ = new Subject<void>();

  public tableLoading = !1;
  public accNoLoading = !1;

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN52090(payload: FIN52090Query): Observable<BaseQueryResponse<FIN52090Data>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<FIN52090Data>>(`${apiUrl}/queryFIN52090`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52090Data.set(res.Data)),
      tap(() => this.logger.debug('查詢FIN52090結果:', [this.FIN52090Data()])),
      finalize(() => this.tableLoading = !1)
    );
  };

  public saveFIN52090Data(payload: FIN52090Insert): Observable<BaseQueryResponse<FIN52090Data>> {
    return this.http.post<BaseQueryResponse<FIN52090Data>>(`${apiUrl}/insertFIN52090`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN52090結果:', [res])),
    );
  };

  public getAccNo(): void {
    this.accNoCancel$.next();
    this.accNoLoading = !0;
    this.http.post<BaseQueryResponse<AccNoDropdown>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      takeUntil(this.accNoCancel$),
      tap(res => this.accNo.set(res.Data)),
      tap(() => this.logger.debug('查詢AccNo結果:', [this.accNo()])),
      finalize(() => this.accNoLoading = !1)
    ).subscribe();
  };
}
