import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN52010Data, FIN52010DataResponse, FIN52010UpdatePayload, FIN52010UpdateResult, GLS1005Option } from '@pages/fin/fin52010/fin52010.model';
import { Option, TblUserOrgidItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52010Service {

  private readonly dataCancel$ = new Subject<void>();
  private readonly tblUsrOrgCancel$ = new Subject<void>();
  private readonly submitCancel$ = new Subject<void>();
  private readonly gls1005Cancel$ = new Subject<void>();

  public readonly FIN52010Data = signal<FIN52010Data>(Object.create(null));

  public readonly dataLoading = signal<boolean>(!1);
  public readonly tblUsrOrgLoading = signal<boolean>(!1);
  public readonly gls1005Loading = signal<boolean>(!1);

  public readonly submitting = signal<boolean>(!1);

  public readonly orgList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly gls1005List = signal<GLS1005Option[]>([]);

  public readonly billTransferConOptions = signal<Option[]>([
    { value: 'N', label: '否' },
    { value: 'Y', label: '是' },
  ]);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN52010(CompNo: string = ''): Observable<FIN52010Data> {
    this.dataCancel$.next();
    this.dataLoading.set(!0);
    return this.http.post<FIN52010DataResponse>(`${apiUrl}/queryFIN52010`, { CompNo }).pipe(
      take(1),
      takeUntil(this.dataCancel$),
      tap(res => this.FIN52010Data.set(res.Data)),
      map(res => res.Data),
      finalize(() => {
        this.dataLoading.set(!1);
        this.logger.debug('查詢FIN52010結果:', [this.FIN52010Data()]);
      })
    );
  }

  public updateFIN52010Data(payload: FIN52010UpdatePayload): Observable<BaseQueryResponse<FIN52010UpdateResult>> {
    this.submitCancel$.next();
    this.submitting.set(!0);
    return this.http.post<BaseQueryResponse<FIN52010UpdateResult>>(`${apiUrl}/updateFIN52010`, payload).pipe(
      take(1),
      takeUntil(this.submitCancel$),
      tap(res => this.logger.debug('更新FIN52010結果:', [res])),
      finalize(() => this.submitting.set(!1))
    );
  }

  public getGLS1005DropDownList(): Observable<GLS1005Option[]> {
    this.gls1005Cancel$.next();
    this.gls1005Loading.set(!0);
    return this.dropdownApi.queryGls1005().pipe(
      take(1),
      takeUntil(this.gls1005Cancel$),
      map(res => res as GLS1005Option[] ?? []),
      tap(res => this.gls1005List.set(res)),
      finalize(() => {
        this.gls1005Loading.set(!1);
        this.logger.debug('查詢GLS1005結果:', [this.gls1005List()]);
      }),
    );
  }

  public getTblUsrOrgList(): Observable<TblUserOrgidItem[]> {
    this.tblUsrOrgCancel$.next();
    this.tblUsrOrgLoading.set(!0);
    return this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      takeUntil(this.tblUsrOrgCancel$),
      map(res => res ?? []),
      tap(res => this.orgList.set(res?.map(item => ({ value: item.Org_ID, label: item.Org_Name } as Option)) ?? [])),
      tap(res => this.usrList.set(res?.map(item => ({ value: item.user_No, label: item.user_Name } as Option)) ?? [])),
      finalize(() => {
        this.tblUsrOrgLoading.set(!1);
        this.logger.debug('查詢TblUsrOrgList結果:', [this.orgList(), this.usrList()]);
      }),
    );
  }
}
