import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN52030Data, FIN52030Detail, FIN52030InsertPayload, FIN52030Payload } from '@pages/fin/fin52030/fin52030.model';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52030Service {

  public readonly FIN52030Data = signal<FIN52030Data[]>([]);
  public readonly FIN52030DetailData = signal<Record<string, any>[]>([]);
  public readonly subpoenaTypes = signal<DropdownOption[]>([]);
  public readonly creators = signal<DropdownOption[]>([]);
  public readonly modifiers = signal<DropdownOption[]>([]);

  /** 預留給科目api */
  public readonly FIN52030xxxxData = signal<Record<string, any>[]>([]);

  private readonly tableCancel$ = new Subject<void>();
  private readonly creatorCancel$ = new Subject<void>();
  private readonly modifierCancel$ = new Subject<void>();

  public tableLoading = !1;
  public creatorLoading = !1;
  public modifierLoading = !1;

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public getSubpoenaTypes(): void {
    this.subpoenaTypes.set([
      { No: '1', Name: '現金收入傳票' },
      { No: '2', Name: '現金支出傳票' },
      { No: '3', Name: '轉帳傳票' },
    ]);
  }

  public loadFIN52030(payload: FIN52030Payload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/queryFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52030Data.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52030結果:', [this.FIN52030Data()]);
      })
    );
  };

  public loadFIN52030Detail(id: number): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<FIN52030Detail>>(`${apiUrl}/queryFIN52030Detail`, { id }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52030DetailData.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52030 Detail結果:', [this.FIN52030DetailData()]);
      })
    ).subscribe();
  };

  /** 預留給科目api */
  public loadxxxx(payload?: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/xxxx`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52030DetailData.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52030 Detail結果:', [this.FIN52030DetailData()]);
      })
    ).subscribe();
  };

  public updateFIN52030Data(payload: FIN52030Payload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/updateFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('更新FIN52030結果:', []);
      })
    );
  }

  public insertFIN52030Data(payload: FIN52030InsertPayload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/insertFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('插入FIN52030結果:', []);
      })
    );
  }

  public deleteFIN52030Data(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/deleteFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('刪除FIN52030結果:', []);
      })
    );
  }

  public loadCreators(): void {
    this.creatorCancel$.next();
    this.creatorLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52030_Creaters`, {}).pipe(
      take(1),
      takeUntil(this.creatorCancel$),
      tap(res => this.creators.set(res.Data)),
      finalize(() => {
        this.creatorLoading = !1;
        this.logger.debug('查詢Creaters結果:', [this.creators()]);
      })
    ).subscribe();
  };

  public loadModifiers(): void {
    this.modifierCancel$.next();
    this.modifierLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52030_Modifiers`, {}).pipe(
      take(1),
      takeUntil(this.modifierCancel$),
      tap(res => this.modifiers.set(res.Data)),
      finalize(() => {
        this.modifierLoading = !1;
        this.logger.debug('查詢Modifiers結果:', [this.modifiers()]);
      })
    ).subscribe();
  };
}
