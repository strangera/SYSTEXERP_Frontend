import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { AccNoDropdown, FIN52030Data, FIN52030Detail, FIN52030InsertPayload, FIN52030Payload, VendorList } from '@pages/fin/fin52030/fin52030.model';
import { IDropdownItem, Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52030Service {

  public readonly FIN52030Data = signal<FIN52030Data[]>([]);
  public readonly FIN52030Detail = signal<FIN52030Detail[]>([]);

  public readonly accNoList = signal<AccNoDropdown[]>([]);
  public readonly vendorList = signal<Option[]>([]);
  public readonly subpoenaTypes = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);

  public vendorMap = computed(() => new Map(this.vendorList().map(item => [item.value, item])));
  public accNoMap = computed(() => new Map(this.accNoList().map(item => [item.AccNo, item])));

  private readonly tableCancel$ = new Subject<void>();

  public tableLoading = !1;
  public venUsrLoading = !1;
  public venLoading = signal(!1);
  public usrLoading = signal(!1);

  private readonly loadingEffect = effect(() => {
    this.venUsrLoading = this.venLoading() && this.usrLoading();
  });

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
    const arr = Array.from(this.subpoenaTypeMap.entries());
    const payload: Option[] = arr.map(([value, label]) => ({ value, label }));
    this.subpoenaTypes.set(payload);
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
      tap(res => this.FIN52030Detail.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52030 Detail結果:', [this.FIN52030Detail()]);
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

  public getAccNoList(): void {
    this.http.post<BaseQueryResponse<AccNoDropdown>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      tap(res => this.accNoList.set(res.Data)),
      finalize(() => this.logger.debug('查詢AccNoList結果:', [this.accNoList()])),
    ).subscribe();
  }

  public getVendorList(): void {
    this.venLoading.set(!0);
    this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      map(({ Data }) => Data.map(item => ({ value: item.VEN_No, label: item.VEN_Name } as Option))),
      tap(res => this.vendorList.set(res)),
      finalize(() => this.logger.debug('查詢VendorList結果:', [this.vendorList()])),
      finalize(() => this.venLoading.set(!1)),
    ).subscribe();
  }

  public getUsrList(): void {
    this.usrLoading.set(!0);
    this.dropdownApi.queryTblUser().pipe(
      take(1),
      map(res => <Option[]>(<IDropdownItem[]><unknown>res)?.map(item => ({ value: item.No, label: item.Name })) ?? []),
      tap(res => this.usrList.set(res)),
      finalize(() => this.logger.debug('查詢UsrList結果:', [this.usrList()])),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();
  }

  public getOrgNoList(): void {
    this.dropdownApi.querySys3100().pipe(
      take(1),
      map(res => <Option[]>(<IDropdownItem[]><unknown>res)?.map(item => ({ value: item.No, label: item.Name })) ?? []),
      tap(res => this.orgNoList.set(res)),
      finalize(() => this.logger.debug('查詢OrgNoList結果:', [this.orgNoList()])),
    ).subscribe();
  }
}
