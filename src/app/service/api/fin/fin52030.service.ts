import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { AccNoList, FIN52030Data, FIN52030Detail, FIN52030InsertPayload, FIN52030Payload, FIN52030UpdatePayload, VendorList } from '@pages/fin/fin52030/fin52030.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52030Service {

  private readonly tableCancel$ = new Subject<void>();
  private readonly accNoCancel$ = new Subject<void>();
  private readonly vendorCancel$ = new Subject<void>();
  private readonly usrCancel$ = new Subject<void>();
  private readonly orgNoCancel$ = new Subject<void>();
  private readonly OrgIdCancel$ = new Subject<void>();

  public readonly FIN52030Data = signal<FIN52030Data[]>([]);
  public readonly FIN52030Detail = signal<FIN52030Detail[]>([]);

  public readonly tableLoading = signal(!1);
  public readonly accLoading = signal(!1);
  public readonly venLoading = signal(!1);
  public readonly usrLoading = signal(!1);

  public readonly accNoList = signal<Option[]>([]);
  public readonly vendorList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly tblUserOrgidList = signal<Option[]>([]);

  /** 傳票種類 */
  public readonly vouTypeOptions = signal<Option[]>([
    { value: '1', label: '現金收入傳票' },
    { value: '2', label: '現金支出傳票' },
    { value: '3', label: '轉帳傳票' },
  ]);

  public readonly accNoMap = computed(() =>
    new Map(this.accNoList().map(item => [item.value, item]))
  );
  public readonly vendorMap = computed(() =>
    new Map(this.vendorList().map(item => [item.value, item]))
  );
  public readonly usrMap = computed(() =>
    new Map(this.usrList().map(item => [item.value, item]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN52030(payload: FIN52030Payload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/queryFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52030Data.set(res.Data)),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('查詢FIN52030結果:', [this.FIN52030Data()]);
      })
    );
  }

  public loadFIN52030Detail(id: number): Observable<BaseQueryResponse<FIN52030Detail>> {
    return this.http.post<BaseQueryResponse<FIN52030Detail>>(`${apiUrl}/queryFIN52030Detail`, { id }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52030Detail.set(res.Data)),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('查詢FIN52030 Detail結果:', [this.FIN52030Detail()]);
      })
    );
  }

  public updateFIN52030Data(payload: FIN52030UpdatePayload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/updateFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('更新FIN52030結果:', []);
      })
    );
  }

  public insertFIN52030Data(payload: FIN52030InsertPayload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/insertFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('插入FIN52030結果:', []);
      })
    );
  }

  public deleteFIN52030Data(payload: number[]): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/deleteFIN52030`, { ids: payload }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('刪除FIN52030結果:', []);
      })
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

  public getTblUserOrgidList(): void {
    this.OrgIdCancel$.next();
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      takeUntil(this.OrgIdCancel$),
      map(res => res?.map(item => ({ value: item.Org_ID, label: item.Org_Name } as Option)) ?? []),
      tap(res => this.tblUserOrgidList.set(res)),
      finalize(() => this.logger.debug('查詢TblUserOrgidList結果:', [this.tblUserOrgidList()])),
    ).subscribe();
  }

  public getAccNoList(): Observable<Option[]> {
    this.accNoCancel$.next();
    this.accLoading.set(!0);
    return this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoList`, {}).pipe(
      take(1),
      takeUntil(this.accNoCancel$),
      map(res => res.Data.map(item => ({ value: item.AccNo, label: item.AccName } as Option))),
      tap(res => this.accNoList.set(res)),
      finalize(() => {
        this.accLoading.set(!1);
        this.logger.debug('查詢AccNoList結果:', [this.accNoList()]);
      }),
    );
  }

  public getVendorList(): Observable<Option[]> {
    this.vendorCancel$.next();
    this.venLoading.set(!0);
    return this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      takeUntil(this.vendorCancel$),
      map(res => res.Data.map(item => ({ value: item.VEN_No, label: item.VEN_Name, short: item.VEN_ShortName } as Option))),
      tap(res => this.vendorList.set(res)),
      finalize(() => {
        this.venLoading.set(!1);
        this.logger.debug('查詢VendorList結果:', [this.vendorList()]);
      }),
    );
  }

  public getUsrList(): Observable<Option[]> {
    this.usrCancel$.next();
    this.usrLoading.set(!0);
    return this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
      take(1),
      takeUntil(this.usrCancel$),
      // map(res => res?.filter(item => !RegExp(/^[0-9]/).test(item['value']))),
      map(res => res?.map(item => ({ value: item['VEN_No'], label: item['Name'], short: item['ShortName'] } as Option)) ?? []),
      tap(res => this.usrList.set(res)),
      finalize(() => {
        this.usrLoading.set(!1);
        this.logger.debug('查詢UsrList結果:', [this.usrList()]);
      }),
    );
  }
}
