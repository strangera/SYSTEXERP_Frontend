import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class FIN52090Service {

  public readonly test = !0;

  public readonly FIN52090Data = signal<Record<string, any>[]>([]);
  public readonly FIN52090DetailData = signal<Record<string, any>[]>([]);
  public readonly accountCodes = signal<DropdownOption[]>([]);

  private readonly tableCancel$ = new Subject<void>();
  private readonly accountCodeCancel$ = new Subject<void>();
  private readonly modifierCancel$ = new Subject<void>();

  public tableLoading = !1;
  public accountCodeLoading = !1;
  public modifierLoading = !1;

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN52090(payload: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52090`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52090Data.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52090結果:', [this.FIN52090Data()]);
      })
    ).subscribe();
  };

  public loadFIN52090Detail(payload: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52090_detail`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52090DetailData.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52090 Detail結果:', [this.FIN52090DetailData()]);
      })
    ).subscribe();
  };

  public updateFIN52090Data(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/updateFIN52090`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('更新FIN52090結果:', []);
      })
    );
  };

  /** 預留給科目api */
  public loadxxxx(payload?: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/xxxx`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52090DetailData.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52090 Detail結果:', [this.FIN52090DetailData()]);
      })
    ).subscribe();
  };

  public loadAccountCodes(): void {
    this.accountCodeCancel$.next();
    this.accountCodeLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52090_Creaters`, {}).pipe(
      take(1),
      takeUntil(this.accountCodeCancel$),
      tap(res => this.accountCodes.set(res.Data)),
      finalize(() => {
        this.accountCodeLoading = !1;
        this.logger.debug('查詢AccountCodes結果:', [this.accountCodes()]);
      })
    ).subscribe();
  };
}
