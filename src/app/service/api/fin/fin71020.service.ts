import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN71020Data, FIN71020Insert, FIN71020OrgNo, FIN71020Update, FIN71020UsrNo } from '@pages/fin/fin71020/fin71020.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/CSH1000';

@Injectable({ providedIn: 'root' })
export class FIN71020Service {

  public readonly FIN71020Data = signal<FIN71020Data[]>([]);
  public readonly UsrNos = signal<FIN71020UsrNo[]>([]);
  public readonly OrgIds = signal<FIN71020OrgNo[]>([]);

  private readonly tableCancel$ = new Subject<void>();

  public readonly tableLoading = signal<boolean>(!1);
  public readonly saving = signal<boolean>(!1);
  public readonly usrLoading = signal<boolean>(!1);
  public readonly orgLoading = signal<boolean>(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN71020(payload: unknown): Observable<BaseQueryResponse<FIN71020Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN71020Data>>(`${apiUrl}/queryFIN71020`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN71020Data.set(res.Data)),
      tap(() => this.logger.debug('查詢FIN71020結果:', [this.FIN71020Data()])),
      finalize(() => this.tableLoading.set(!1))
    );
  };

  public saveFIN71020(payload: FIN71020Insert | FIN71020Update, type: 'insert' | 'update' = 'insert'): Observable<BaseQueryResponse<unknown>> {
    this.saving.set(!0);
    payload = type === 'insert' ? payload as FIN71020Insert : payload as FIN71020Update;
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/${type}`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('FIN71020新增/修改結果:', [res])),
      finalize(() => this.saving.set(!1)),
    );
  }

  public getKeepUsrNo(): void {
    this.usrLoading.set(!0);
    this.http.post<BaseQueryResponse<FIN71020UsrNo>>(`${apiUrl}/queryFIN71020KeepUsrNoDropdownList`, {}).pipe(
      take(1),
      tap(res => this.UsrNos.set(res.Data)),
      tap(() => this.logger.debug('查詢UsrNo結果:', [this.UsrNos()])),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();
  }

  public getKeepOrgId(): void {
    this.orgLoading.set(!0);
    this.http.post<BaseQueryResponse<FIN71020OrgNo>>(`${apiUrl}/queryFIN71020KeepOrgNoDropdownList`, {}).pipe(
      take(1),
      tap(res => this.OrgIds.set(res.Data)),
      tap(() => this.logger.debug('查詢OrgNo結果:', [this.OrgIds()])),
      finalize(() => this.orgLoading.set(!1)),
    ).subscribe();
  }
}
