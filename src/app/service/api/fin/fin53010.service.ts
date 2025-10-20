import { HttpClient } from '@angular/common/http';
import { effect, Injectable, Query, signal } from '@angular/core';
import { AccNoList, FIN53010Data, FIN53010DataDetail, FIN53010DeleteResult, FIN53010Detail, FIN53010InsertPayload, FIN53010InsertResult, FIN53010Payload, FIN53010UpdatePayload, FIN53010UpdateResult, VendorList, VoucherType } from '@pages/fin/fin53010/fin53010.model';
import { IDropdownItem, Option, TblUserOrgidItem } from '@service/utility/dropdown-api.model';
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
  public readonly VoucherTypes = signal<VoucherType[]>([]);
  /** 傳票狀態 */
  public readonly postFlags = signal<Option[]>([]);
  public readonly orgNoList = signal<Option[]>([]);
  public readonly usrList = signal<Option[]>([]);
  public readonly tblUserOrgidList = signal<TblUserOrgidItem[]>([]);
  public readonly vouAccTypes = signal<Option[]>([]);
  public readonly INVOptions = signal<Option[]>([]);
  public readonly sys1000List = signal<IDropdownItem[]>([]);
  public readonly remarkOptions = signal<Option[]>([]);

  public accNoMap = new Map<string, AccNoList>([]);
  public vendorMap = new Map<string, VendorList>([]);
  public usrMap = new Map<string, Option>([]);
  public sys1000Map = new Map<string, IDropdownItem>([]);

  public usrEffect = effect(() => {
    this.usrMap = new Map(this.usrList().map(item => [item.value, item]));
  });
  public vendorEffect = effect(() => {
    this.vendorMap = new Map(this.vendorList().map(item => [item.VEN_No, item]));
  });
  public accNoEffect = effect(() => {
    this.accNoMap = new Map(this.accNoList().map(item => [item.AccNo, item]));
  });
  public sys1000Effect = effect(() => {
    this.sys1000Map = new Map(this.sys1000List().map(item => [item.No, item]));
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

  public loadFIN53010Detail(id: number): Observable<FIN53010DataDetail> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    const usr$ = this.getUsrList();
    const vendor$ = this.getVendorList();

    return forkJoin([usr$, vendor$]).pipe(
      concatMap(() =>
        this.http.post<FIN53010DataDetail>(`${apiUrl}/queryFIN53010Detail`, { id }).pipe(
          take(1),
          takeUntil(this.tableCancel$),
          tap(res => this.FIN53010Detail.set(res.Data.Details)),
          finalize(() => {
            this.tableLoading = !1;
            this.logger.debug('查詢FIN53010 Detail結果:', [this.FIN53010Detail()]);
          })
        )
      )
    );
  }

  public insertFIN53010Data(payload: FIN53010InsertPayload): Observable<FIN53010InsertResult> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<FIN53010InsertResult>(`${apiUrl}/insertFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.logger.debug('插入FIN53010結果:', [res])),
      finalize(() => this.tableLoading = !1)
    );
  }

  public updateFIN53010Data(payload: FIN53010UpdatePayload): Observable<FIN53010UpdateResult> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<FIN53010UpdateResult>(`${apiUrl}/updateFIN53010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.logger.debug('更新FIN53010結果:', [res])),
      finalize(() => this.tableLoading = !1)
    );
  }

  public deleteFIN53010Data(payload: number[]): Observable<FIN53010DeleteResult> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<FIN53010DeleteResult>(`${apiUrl}/deleteFIN53010`, { ids: payload }).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.logger.debug('刪除FIN53010結果:', [res])),
      finalize(() => this.tableLoading = !1)
    );
  }

  public getVoucherTypes(): void {
    this.VoucherTypes.set([
      { id: 1, No: 'AA', Name: 'AAAA' },
      { id: 2, No: 'BB', Name: 'BBBB' },
      { id: 3, No: 'CC', Name: 'CCCC' },
      { id: 4, No: 'DD', Name: 'DDDD' },
      { id: 5, No: 'EE', Name: 'EEEE' },
      { id: 6, No: 'GL', Name: 'GL測試用' },
    ]);

    this.http.post<BaseQueryResponse<VoucherType>>(`${apiUrl}/queryVoucherTypeDropdown`, {}).pipe(
      take(1),
      tap(res => this.VoucherTypes.set(res.Data)),
      finalize(() => this.logger.debug('查詢VoucherTypes結果:', [this.VoucherTypes()])),
    ).subscribe();
  }

  public getAccNoList(): void {
    this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      tap(res => this.accNoList.set(res.Data)),
      finalize(() => this.logger.debug('查詢AccNoList結果:', [this.accNoList()])),
    ).subscribe();
  }

  public getVendorList(): Observable<VendorList[]> {
    this.venLoading.set(!0);
    return !this.vendorList().length
      ? this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
        take(1),
        tap(res => this.vendorList.set(res.Data)),
        map(res => res.Data),
        finalize(() => {
          this.venLoading.set(!1);
          this.logger.debug('查詢VendorList結果:', [this.vendorList()]);
        }),
      )
      : of(<BaseQueryResponse<VendorList>>{ Data: this.vendorList() }).pipe(
        take(1),
        map(res => res.Data),
        finalize(() => this.venLoading.set(!1)));
  }

  public getUsrList(): Observable<Option[]> {
    this.usrLoading.set(!0);
    return !this.usrList().length
      ? this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
        take(1),
        // map(res => res?.filter(item => !RegExp(/^[0-9]/).test(item['value']))),
        map(res => res!.map(item => ({ value: item['VEN_No'], label: item['Name'], short: item['ShortName'] } as Option))),
        tap(res => this.usrList.set(res ?? [])),
        finalize(() => {
          this.usrLoading.set(!1);
          this.logger.debug('查詢UsrList結果:', [this.usrList()]);
        }),
      )
      : of(this.usrList()).pipe(
        take(1),
        finalize(() => this.usrLoading.set(!1)));
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

  public getSYS1000(SYS_Type: string): void {
    this.dropdownApi.querySys1000({ SYS_Type }).pipe(
      take(1),
      tap(res => this.sys1000List.set(res ?? [])),
      finalize(() => this.logger.debug('查詢SYS1000結果:', [this.sys1000List()])),
    ).subscribe();
  }
}
