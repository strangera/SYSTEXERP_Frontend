import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { AccDescOption, AccNoList, FIN52030Data, FIN52030DetailData, FIN52030DetailDataResponse, FIN52030InsertPayload, FIN52030Payload, FIN52030UpdatePayload, NoteDescResponse, VendorList } from '@pages/fin/fin52030/fin52030.model';
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
  private readonly RefNameCancel$ = new Subject<void>();
  private readonly noteDescCancel$ = new Subject<void>();

  public readonly FIN52030Data = signal<FIN52030Data[]>([]);
  public readonly FIN52030Detail = signal<FIN52030DetailData>(Object.create(null));

  public readonly totalRecords = signal<number>(0);

  public readonly tableLoading = signal(!1);
  public readonly accLoading = signal(!1);
  public readonly venLoading = signal(!1);
  public readonly usrLoading = signal(!1);
  public readonly RefNameLoading = signal(!1);
  public readonly noteDescLoading = signal(!1);

  public readonly accNoList = signal<Option[]>([]);
  public readonly vendorList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly refNameList = signal<Option[]>([]);
  public readonly noteDescList = signal<AccDescOption[]>([]);

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
  public readonly noteDescMap = computed(() =>
    new Map(this.noteDescList().map(item => [item.value, item]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN52030(payload: FIN52030Payload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.FIN52030Data.set([]);
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/queryFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.totalRecords.set(res.TotalCount || 0)),
      tap(res => this.FIN52030Data.set(res.Data)),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('查詢FIN52030結果:', [this.FIN52030Data()]);
      })
    );
  }

  public loadFIN52030Detail(id: number): Observable<FIN52030DetailDataResponse> {
    return this.http.post<FIN52030DetailDataResponse>(`${apiUrl}/queryFIN52030Detail`, { id }).pipe(
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

  public getRefNameList(): void {
    this.RefNameCancel$.next();
    this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      takeUntil(this.RefNameCancel$),
      map(res => res.Data?.map(item => ({ value: item.VEN_No, label: item.VEN_Name } as Option)) ?? []),
      tap(res => this.refNameList.set(res)),
      finalize(() => this.logger.debug('查詢RefNameList結果:', [this.refNameList()])),
    ).subscribe();
  }

  public getAccDescList(AccNo: string[]): void {
    this.noteDescCancel$.next();
    this.noteDescLoading.set(!0);
    this.http.post<NoteDescResponse>(`${apiUrl}/queryAccNoNoteDescDropdown`, { AccNo: Array.from(new Set(AccNo)) }).pipe(
      take(1),
      takeUntil(this.noteDescCancel$),
      tap(res => this.noteDescList.set(Object.entries(res.Data.AccNoNoteDesc).map(([key, value]) =>
        ({ value: key, label: (value as string[])[0], data: (value as string[]).map((v: string, i: number) => ({ value: String(i), label: v })) } as AccDescOption)))),
      finalize(() => {
        this.noteDescLoading.set(!1);
        this.logger.debug('查詢NoteDescList結果:', [this.noteDescList()]);
      }),
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

  public getAccNoList(): void {
    this.accNoCancel$.next();
    this.accLoading.set(!0);
    this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      takeUntil(this.accNoCancel$),
      tap(res => this.accNoList.set(res.Data.map(item => ({ value: item.AccNo, label: item.AccCName, templateLabel: `${item.AccNo} - ${item.AccCName}` } as Option)))),
      finalize(() => {
        this.accLoading.set(!1);
        this.logger.debug('查詢AccNoList結果:', [this.accNoList()]);
      }),
    ).subscribe();
  }

  public getVendorList(): void {
    this.vendorCancel$.next();
    this.venLoading.set(!0);
    this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
      take(1),
      takeUntil(this.vendorCancel$),
      tap(res => this.vendorList.set(res?.map(item => ({ value: item['VEN_No'], label: item['Name'], short: item['ShortName'] } as Option)) ?? [])),
      finalize(() => {
        this.venLoading.set(!1);
        this.logger.debug('查詢VendorList結果:', [this.vendorList()]);
      }),
    ).subscribe();
  }

  public getUsrList(): void {
    this.usrCancel$.next();
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      takeUntil(this.usrCancel$),
      tap(res => this.usrList.set(res?.map(item => ({ value: item.Org_ID, label: item.Org_Name } as Option)) ?? [])),
      finalize(() => this.logger.debug('查詢TblUserOrgidList結果:', [this.usrList()])),
    ).subscribe();
  }
}
