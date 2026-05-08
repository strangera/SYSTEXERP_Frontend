import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN71020Data, FIN71020Delete, FIN71020Insert, FIN71020OrgNo, FIN71020Update, FIN71020UsrNo } from '@pages/fin/fin71020/fin71020.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/CSH1000';

@Injectable({ providedIn: 'root' })
export class FIN71020Service {

  public readonly usrNoOptions = signal<FIN71020UsrNo[]>([]);
  public readonly orgIdOptions = signal<FIN71020OrgNo[]>([]);

  public readonly usrLoading = signal<boolean>(!1);
  public readonly orgLoading = signal<boolean>(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN71020(payload: unknown): Observable<BaseQueryResponse<FIN71020Data>> {
    return this.http.post<BaseQueryResponse<FIN71020Data>>(`${apiUrl}/queryFIN71020`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN71020結果:', [res])),
    );
  };

  public insertFIN71020(payload: FIN71020Insert): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/insertFIN71020`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('FIN71020新增結果:', [res])),
    );
  }

  public updateFIN71020(payload: FIN71020Update): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/updateFIN71020`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('FIN71020修改結果:', [res])),
    );
  }

  public deleteFIN71020(payload: FIN71020Delete): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/deleteFIN71020`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('FIN71020刪除結果:', [res])),
    );
  }

  public getKeepUsrNo(): void {
    this.usrLoading.set(!0);
    this.http.post<BaseQueryResponse<FIN71020UsrNo>>(`${apiUrl}/queryFIN71020KeepUsrNoDropdownList`, {}).pipe(
      take(1),
      tap(res => {
        this.usrNoOptions.set(res.Data || []);
        this.logger.debug('查詢UsrNo結果:', [res]);
      }),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();
  }

  public getKeepOrgId(): void {
    this.orgLoading.set(!0);
    this.http.post<BaseQueryResponse<FIN71020OrgNo>>(`${apiUrl}/queryFIN71020KeepOrgNoDropdownList`, {}).pipe(
      take(1),
      tap(res => {
        this.orgIdOptions.set(res.Data || []);
        this.logger.debug('查詢OrgNo結果:', [res]);
      }),
      finalize(() => this.orgLoading.set(!1)),
    ).subscribe();
  }
}
