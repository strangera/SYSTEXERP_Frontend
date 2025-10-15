import { HttpClient } from '@angular/common/http';
import { effect, Injectable, signal } from '@angular/core';
import { AccNoList, FIN52030Data, FIN52030Detail, FIN52030InsertPayload, FIN52030Payload, FIN52030UpdatePayload, VendorList } from '@pages/fin/fin52030/fin52030.model';
import { Option, TblUserOrgidItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { concatMap, finalize, forkJoin, map, Observable, of, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52030Service {

  public readonly FIN52030Data = signal<FIN52030Data[]>([]);
  public readonly FIN52030Detail = signal<FIN52030Detail[]>([]);

  public readonly accNoList = signal<AccNoList[]>([]);
  public readonly vendorList = signal<VendorList[]>([]);
  public readonly subpoenaTypes = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly tblUserOrgidList = signal<TblUserOrgidItem[]>([]);

  public accNoMap = new Map<string, AccNoList>([]);
  public vendorMap = new Map<string, VendorList>([]);
  public usrMap = new Map<string, Option>([]);

  public usrEffect = effect(() => {
    this.usrMap = new Map(this.usrList().map(item => [item.value, item]));
  });
  public vendorEffect = effect(() => {
    this.vendorMap = new Map(this.vendorList().map(item => [item.VEN_No, item]));
  });
  public accNoEffect = effect(() => {
    this.accNoMap = new Map(this.accNoList().map(item => [item.AccNo, item]));
  });

  private readonly tableCancel$ = new Subject<void>();

  public tableLoading = !1;
  public venUsrLoading = !1;
  public venLoading = signal(!1);
  public usrLoading = signal(!1);

  public readonly subpoenaTypeMap = new Map([
    ['1', '現金收入傳票'],
    ['2', '現金支出傳票'],
    ['3', '轉帳傳票'],
  ]);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public getSubpoenaTypes(): void {
    this.subpoenaTypes.set(Array.from(this.subpoenaTypeMap, ([value, label]) => ({ value, label })));
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

  public loadFIN52030Detail(id: number): Observable<BaseQueryResponse<FIN52030Detail>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    const usr$ = !this.usrList().length
      ? this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(tap(res => this.usrList.set(res ?? [])))
      : of(void 0);

    const vendor$ = !this.vendorList().length
      ? this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
        tap(res => this.vendorList.set(res.Data))
      )
      : of(void 0);

    return forkJoin([usr$, vendor$]).pipe(
      concatMap(() =>
        this.http.post<BaseQueryResponse<FIN52030Detail>>(`${apiUrl}/queryFIN52030Detail`, { id }).pipe(
          take(1),
          takeUntil(this.tableCancel$),
          tap(res => this.FIN52030Detail.set(res.Data)),
          finalize(() => {
            this.tableLoading = !1;
            this.logger.debug('查詢FIN52030 Detail結果:', [this.FIN52030Detail()]);
          })
        )
      )
    );
  }

  public updateFIN52030Data(payload: FIN52030UpdatePayload): Observable<BaseQueryResponse<FIN52030Data>> {
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

  public deleteFIN52030Data(payload: number[]): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/deleteFIN52030`, { ids: payload }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('刪除FIN52030結果:', []);
      })
    );
  }

  public getAccNoList(): void {
    this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoList`, {}).pipe(
      take(1),
      tap(res => this.accNoList.set(res.Data)),
      finalize(() => this.logger.debug('查詢AccNoList結果:', [this.accNoList()])),
    ).subscribe();
  }

  public getVendorList(): void {
    this.venLoading.set(!0);
    this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      tap(res => this.vendorList.set(res.Data)),
      finalize(() => this.logger.debug('查詢VendorList結果:', [this.vendorList()])),
      finalize(() => this.venLoading.set(!1)),
    ).subscribe();
  }

  public getUsrList(): void {
    this.usrLoading.set(!0);
    this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
      take(1),
      map(res => res!.map(item => ({ value: item['VEN_No'], label: item['Name'], short: item['ShortName'] } as Option))),
      tap(res => this.usrList.set(res ?? [])),
      finalize(() => this.logger.debug('查詢UsrList結果:', [this.usrList()])),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();
  }

  public getOrgNoList(): void {
    this.dropdownApi.querySys3100().pipe(
      take(1),
      tap(res => this.orgNoList.set(res ?? [])),
      finalize(() => this.logger.debug('查詢OrgNoList結果:', [this.orgNoList()])),
    ).subscribe();
  }

  public getTblUserOrgid(): void {
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      tap(res => this.tblUserOrgidList.set(res ?? [])),
      finalize(() => this.logger.debug('查詢TblUserOrgidList結果:', [this.tblUserOrgidList()])),
    ).subscribe();
  }
}
