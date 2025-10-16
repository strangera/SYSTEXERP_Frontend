import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { AccNoList, FIN53010Data, FIN53010Detail, FIN53010InsertPayload, FIN53010Payload, FIN53010UpdatePayload, VendorList } from '@pages/fin/fin53010/fin53010.model';
import { Option, TblUserOrgidItem } from '@service/utility/dropdown-api.model';
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

  public readonly accNoList = signal<AccNoList[]>([]);
  public readonly vendorList = signal<VendorList[]>([]);
  /** 傳票種類 */
  public readonly VouTypes = signal<Option[]>([]);
  /** 傳票型態 */
  public readonly vouForm = signal<Option[]>([]);
  /** 傳票狀態 */
  public readonly postFlags = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly tblUserOrgidList = signal<TblUserOrgidItem[]>([]);
  public readonly vouAccTypes = signal<Option[]>([]);
  public readonly INVOptions = signal<Option[]>([]);

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

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public getVouAccTypes(cru: boolean = !1): void {
    this.vouAccTypes.set([
      { value: '0', label: '共用' },
      { value: '1', label: 'ROC' },
      { value: '2', label: 'IFRS' },
      ...(cru ? [] : [{ value: '3', label: '全部' }]),
    ]);
  }

  public getVouTypes(): void {
    this.VouTypes.set([
      { value: '1', label: '現金收入傳票' },
      { value: '2', label: '現金支出傳票' },
      { value: '3', label: '轉帳傳票' }
    ]);
  }

  public getVouForm(): void {
    this.vouForm.set([
    ]);
  }

  public getPostFlags(): void {
    this.postFlags.set([
      { value: '0', label: '作廢' },
      { value: '1', label: '建立' },
      // { value: '2', label: '確認' },
      { value: '3', label: '過帳' },
    ]);
  }

  public getINVOptions(): void {
    this.INVOptions.set([
      { value: 'N', label: '否' },
      { value: 'Y', label: '是' },
    ]);
  }

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
      ? this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
        take(1),
        tap(res => this.usrList.set(res ?? [])))
      : of(void 0);

    const vendor$ = !this.vendorList().length
      ? this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
        take(1),
        tap(res => this.vendorList.set(res.Data))
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
    this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
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
