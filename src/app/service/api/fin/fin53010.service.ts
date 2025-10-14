import { HttpClient } from '@angular/common/http';
import { effect, Injectable, signal } from '@angular/core';
import { FIN53010Data, FIN53010Detail, FIN53010InsertPayload, FIN53010Payload, FIN53010UpdatePayload, VendorList } from '@pages/fin/fin53010/fin53010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { concatMap, finalize, forkJoin, map, Observable, of, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN53010Service {

  public readonly FIN53010Data = signal<FIN53010Data[]>([]);
  public readonly FIN53010Detail = signal<FIN53010Detail[]>([]);

  public readonly accNoList = signal<Option[]>([]);
  public readonly vendorList = signal<Option[]>([]);
  /** 傳票種類 */
  public readonly subpoenaTypes = signal<Option[]>([
    { value: '0', label: '現金收入傳票' },
    { value: '1', label: '現金支出傳票' },
    { value: '2', label: '轉帳傳票' }
  ]);
  /** 傳票型態 */
  public readonly subpoenaTypes2 = signal<Option[]>([
    { value: '0', label: '作廢' },
    { value: '1', label: '建立' },
    { value: '3', label: '過帳' },
  ]);
  /** 傳票狀態 */
  public readonly subpoenaStatus = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly subDetailNoList = signal<Option[]>([]);
  public readonly rocifrsOptions = signal<Option[]>([
    { value: '0', label: '共用' },
    { value: '1', label: 'ROC' },
    { value: '2', label: 'IFRS' },
    { value: '3', label: '全部' },
  ]);

  public accNoMap = new Map<string, Option>([]);
  public vendorMap = new Map<string, Option>([]);
  public usrMap = new Map<string, Option>([]);

  public usrEffect = effect(() => {
    this.usrMap = new Map(this.usrList().map(item => [item.value, item]));
  });
  public vendorEffect = effect(() => {
    this.vendorMap = new Map(this.vendorList().map(item => [item.value, item]));
  });
  public accNoEffect = effect(() => {
    this.accNoMap = new Map(this.accNoList().map(item => [item.value, item]));
  });

  private readonly tableCancel$ = new Subject<void>();

  public tableLoading = !1;
  public venUsrLoading = !1;
  public venLoading = signal(!1);
  public usrLoading = signal(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN53010(payload: FIN53010Payload): Observable<BaseQueryResponse<FIN53010Data>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<FIN53010Data>>(`${apiUrl}/queryFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN53010Data.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN53010結果:', [this.FIN53010Data()]);
      })
    );
  };

  public loadFIN53010Detail(id: number): Observable<BaseQueryResponse<FIN53010Detail>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    const usr$ = !this.usrList().length
      ? this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(tap(res => this.usrList.set(res ?? [])))
      : of(void 0);

    const vendor$ = !this.vendorList().length
      ? this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
        map(({ Data }) => Data.map(item => ({ value: item.VEN_No, label: item.VEN_Name, short: item.VEN_ShortName } as Option))),
        tap(res => this.vendorList.set(res))
      )
      : of(void 0);

    return forkJoin([usr$, vendor$]).pipe(
      concatMap(() =>
        this.http.post<BaseQueryResponse<FIN53010Detail>>(`${apiUrl}/queryFIN53010Detail`, { id }).pipe(
          take(1),
          takeUntil(this.tableCancel$),
          tap(res => this.FIN53010Detail.set(res.Data)),
          finalize(() => {
            this.tableLoading = !1;
            this.logger.debug('查詢FIN53010 Detail結果:', [this.FIN53010Detail()]);
          })
        )
      )
    );
  }

  public updateFIN53010Data(payload: FIN53010UpdatePayload): Observable<BaseQueryResponse<FIN53010Data>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<FIN53010Data>>(`${apiUrl}/updateFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('更新FIN53010結果:', []);
      })
    );
  }

  public insertFIN53010Data(payload: FIN53010InsertPayload): Observable<BaseQueryResponse<FIN53010Data>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<FIN53010Data>>(`${apiUrl}/insertFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('插入FIN53010結果:', []);
      })
    );
  }

  public deleteFIN53010Data(payload: number[]): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/deleteFIN53010`, { ids: payload }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('刪除FIN53010結果:', []);
      })
    );
  }

  public getAccNoList(): void {
    this.dropdownApi.queryGls1005().pipe(
      take(1),
      tap(res => this.accNoList.set(res || [])),
      finalize(() => this.logger.debug('查詢AccNoList結果:', [this.accNoList()])),
    ).subscribe();
  }

  public getVendorList(): void {
    this.venLoading.set(!0);
    this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      map(({ Data }) => Data.map(item => ({ value: item.VEN_No, label: item.VEN_Name, short: item.VEN_ShortName } as Option))),
      tap(res => this.vendorList.set(res)),
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

  public getSubDetailNoList(): void {
    this.http.post<BaseQueryResponse<Option>>('/queryPOS10015_DropDownList', {}).pipe(
      take(1),
      tap(res => this.subDetailNoList.set(res.Data ?? [])),
      finalize(() => this.logger.debug('查詢SubDetailNoList結果:', [this.subDetailNoList()])),
    ).subscribe();
  }
}
