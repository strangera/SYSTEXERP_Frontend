import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { FIN52010Data, FIN52010DataResponse, FIN52010UpdatePayload, FIN52010UpdateResult } from '@pages/fin/fin52010/fin52010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52010Service {

  private readonly dataCancel$ = new Subject<void>();
  private readonly orgNoCancel$ = new Subject<void>();
  private readonly tblUsrOrgCancel$ = new Subject<void>();
  private readonly sys1000Cancel$ = new Subject<void>();
  private readonly submitCancel$ = new Subject<void>();

  public readonly FIN52010Data = signal<FIN52010Data>(Object.create(null));

  public readonly dataLoading = signal<boolean>(!1);
  public readonly OrgNoLoading = signal<boolean>(!1);
  public readonly tblUsrOrgLoading = signal<boolean>(!1);
  public readonly sys1000Loading = signal<boolean>(!1);

  public readonly submitting = signal<boolean>(!1);

  public readonly orgNoList = signal<Option[]>([]);
  public readonly orgList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly sys1000List = signal<Option[]>([]);

  public readonly billTransferConOptions = signal<Option[]>([
    { value: 'N', label: '否' },
    { value: 'Y', label: '是' },
  ]);
  public readonly vouTypeOptions = signal<Option[]>([
    { value: '1', label: '現金收入傳票' },
    { value: '2', label: '現金支出傳票' },
    { value: '3', label: '轉帳傳票' }
  ]);
  public readonly accDCOptions = signal<Option[]>([
    { value: 'D', label: '借' },
    { value: 'C', label: '貸' }
  ]);
  public readonly ledgerOptions = signal<Option[]>([
    { value: '0', label: '統制' },
    { value: '1', label: '明細' }
  ]);

  // public readonly accNoMap = computed(() =>
  //   new Map(this.accNoList().map(item => [item.value, item]))
  // );
  // public readonly vendorMap = computed(() =>
  //   new Map(this.vendorList().map(item => [item.value, item]))
  // );
  // public readonly usrMap = computed(() =>
  //   new Map(this.usrList().map(item => [item.value, item]))
  // );
  // public readonly sys1000Map = computed(() =>
  //   new Map(this.sys1000List().map(item => [item.value, item]))
  // );

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

  public updateFIN52010Data(payload: FIN52010UpdatePayload): Observable<FIN52010UpdateResult> {
    this.submitCancel$.next();
    this.submitting.set(!0);
    return this.http.post<BaseQueryResponse<FIN52010UpdateResult>>(`${apiUrl}/updateFIN52010`, payload).pipe(
      take(1),
      takeUntil(this.submitCancel$),
      tap(res => this.logger.debug('更新FIN52010結果:', [res])),
      finalize(() => this.submitting.set(!1))
    );
  }

  public getOrgNoList(): void {
    this.orgNoCancel$.next();
    this.dropdownApi.querySys3100().pipe(
      take(1),
      takeUntil(this.orgNoCancel$),
      tap(res => this.orgNoList.set(res ?? [])),
      finalize(() => this.logger.debug('查詢OrgNoList結果:', [this.orgNoList()])),
    ).subscribe();
  }

  public getTblUsrOrgList(): void {
    this.tblUsrOrgCancel$.next();
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      takeUntil(this.tblUsrOrgCancel$),
      tap(res => this.orgList.set(res?.map(item => ({ value: item.Org_ID, label: item.Org_Name } as Option)) ?? [])),
      tap(res => this.usrList.set(res?.map(item => ({ value: item.user_No, label: item.user_Name } as Option)) ?? [])),
      finalize(() => this.logger.debug('查詢TblUsrOrgList結果:', [this.orgList(), this.usrList()])),
    ).subscribe();
  }

  public getSYS1000(): void {
    this.sys1000Cancel$.next();
    this.sys1000Loading.set(!0);
    this.dropdownApi.querySys1000({ SYS_Type: 'Voucher_Type' }).pipe(
      take(1),
      takeUntil(this.sys1000Cancel$),
      map(res => res?.map(item => ({ value: item['No'], label: item['Name'] } as Option)) ?? []),
      tap(res => this.sys1000List.set(res)),
      finalize(() => this.logger.debug('查詢SYS1000List結果:', [this.sys1000List()])),
    ).subscribe();
  }
}
