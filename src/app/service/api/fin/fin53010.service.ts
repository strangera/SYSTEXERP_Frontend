import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { AccNoList, FIN53010Data, FIN53010DataDetail, FIN53010DeleteResult, FIN53010InsertPayload, FIN53010InsertResult, FIN53010Payload, FIN53010UpdatePayload, FIN53010UpdateResult, QueryFIN53010Detail, VendorList, VoucherType } from '@pages/fin/fin53010/fin53010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN53010Service {

  private readonly tableCancel$ = new Subject<void>();
  private readonly accNoCancel$ = new Subject<void>();
  private readonly vendorCancel$ = new Subject<void>();
  private readonly usrCancel$ = new Subject<void>();
  private readonly sys1000Cancel$ = new Subject<void>();
  private readonly voucherTypeCancel$ = new Subject<void>();
  private readonly orgNoCancel$ = new Subject<void>();
  private readonly orgIdCancel$ = new Subject<void>();

  public readonly FIN53010Data = signal<FIN53010Data[]>([]);
  public readonly FIN53010Detail = signal<QueryFIN53010Detail>(Object.create(null));

  public readonly tableLoading = signal(!1);
  public readonly accLoading = signal(!1);
  public readonly venLoading = signal(!1);
  public readonly usrLoading = signal(!1);
  public readonly sys1000Loading = signal(!1);

  public readonly cru = signal<boolean>(!1);

  public readonly accNoList = signal<Option[]>([]);
  public readonly vendorList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly tblUserOrgidList = signal<Option[]>([]);
  public readonly remarkList = signal<Option[]>([]);
  public readonly sys1000List = signal<Option[]>([]);

  /** 傳票種類 */
  public readonly vouTypeOptions = signal<Option[]>([
    { value: '1', label: '現金收入傳票' },
    { value: '2', label: '現金支出傳票' },
    { value: '3', label: '轉帳傳票' }
  ]);
  /** 傳票型態 */
  public readonly voucherTypeOptions = signal<VoucherType[]>([]);
  /** 傳票狀態 */
  public readonly postFlagOptions = signal<Option[]>([
    { value: '0', label: '作廢' },
    { value: '1', label: '建立' },
    // { value: '2', label: '確認' },
    { value: '3', label: '過帳' },
  ]);
  public readonly INVOptions = signal<Option[]>([
    { value: 'N', label: '否' },
    { value: 'Y', label: '是' },
  ]);
  public readonly vouAccTypeOptions = signal<Option[]>([
    { value: '0', label: '共用' },
    { value: '1', label: 'ROC' },
    { value: '2', label: 'IFRS' },
    ...(this.cru() ? [] : [{ value: '3', label: '全部' }]),
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
  public readonly sys1000Map = computed(() =>
    new Map(this.sys1000List().map(item => [item.value, item]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN53010(payload: FIN53010Payload): Observable<BaseQueryResponse<FIN53010Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN53010Data>>(`${apiUrl}/queryFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN53010Data.set(res.Data)),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('查詢FIN53010結果:', [this.FIN53010Data()]);
      })
    );
  }

  public loadFIN53010Detail(id: number): Observable<FIN53010DataDetail> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<FIN53010DataDetail>(`${apiUrl}/queryFIN53010Detail`, { id }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN53010Detail.set(res.Data)),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('查詢FIN53010 Detail結果:', [this.FIN53010Detail()]);
      })
    );
  }

  public insertFIN53010Data(payload: FIN53010InsertPayload): Observable<FIN53010InsertResult> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<FIN53010InsertResult>(`${apiUrl}/insertFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.logger.debug('插入FIN53010結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public updateFIN53010Data(payload: FIN53010UpdatePayload): Observable<FIN53010UpdateResult> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<FIN53010UpdateResult>(`${apiUrl}/updateFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.logger.debug('更新FIN53010結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public deleteFIN53010Data(payload: number[]): Observable<FIN53010DeleteResult> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<FIN53010DeleteResult>(`${apiUrl}/deleteFIN53010`, { ids: payload }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.logger.debug('刪除FIN53010結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public getVoucherTypeOptions(): void {
    this.voucherTypeOptions.set([
      { id: 1, No: 'AA', Name: 'AAAA' },
      { id: 2, No: 'BB', Name: 'BBBB' },
      { id: 3, No: 'CC', Name: 'CCCC' },
      { id: 4, No: 'DD', Name: 'DDDD' },
      { id: 5, No: 'EE', Name: 'EEEE' },
      { id: 6, No: 'GL', Name: 'GL測試用' },
    ]);

    this.voucherTypeCancel$.next();
    this.http.post<BaseQueryResponse<VoucherType>>(`${apiUrl}/queryVoucherTypeDropdown`, {}).pipe(
      take(1),
      takeUntil(this.voucherTypeCancel$),
      tap(res => this.voucherTypeOptions.set(res.Data)),
      finalize(() => this.logger.debug('查詢VoucherTypeOptions結果:', [this.voucherTypeOptions()])),
    ).subscribe();
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
    this.orgIdCancel$.next();
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      takeUntil(this.orgIdCancel$),
      map(res => res?.map(item => ({ value: item['Org_ID'], label: item['Org_Name'] } as Option)) ?? []),
      tap(res => this.tblUserOrgidList.set(res)),
      finalize(() => this.logger.debug('查詢TblUserOrgidListList結果:', [this.tblUserOrgidList()])),
    ).subscribe();
  }

  public getAccNoList(): Observable<Option[]> {
    this.accNoCancel$.next();
    this.accLoading.set(!0);
    return this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      takeUntil(this.accNoCancel$),
      map(res => res.Data.map(item => ({ value: item.AccNo, label: item.AccCName } as Option))),
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

  public getSYS1000(SYS_Type: string): Observable<Option[]> {
    this.sys1000Cancel$.next();
    this.sys1000Loading.set(!0);
    return this.dropdownApi.querySys1000({ SYS_Type }).pipe(
      take(1),
      takeUntil(this.sys1000Cancel$),
      map(res => res?.map(item => ({ value: item['No'], label: item['Name'] } as Option)) ?? []),
      tap(res => this.sys1000List.set(res)),
      finalize(() => this.logger.debug('查詢SYS1000List結果:', [this.sys1000List()])),
    );
  }
}
