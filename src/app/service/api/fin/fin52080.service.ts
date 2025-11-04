import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { FIN52080ClassNo, FIN52080Data, FIN52080Query, FIN52080Tree } from '@pages/fin/fin52080/fin52080.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52080Service {

  public readonly FIN52080Data = signal<FIN52080Data[]>([]);
  public readonly classNoOption = signal<FIN52080ClassNo[]>([]);
  public readonly FIN52080Tree = signal<FIN52080Tree[]>([]);

  private readonly tableCancel$ = new Subject<void>();
  private readonly classNoCancel$ = new Subject<void>();
  private readonly treeCancel$ = new Subject<void>();

  public tableLoading = signal<boolean>(!1);
  public classNoLoading = signal<boolean>(!1);
  public treeLoading = signal<boolean>(!1);

  public accNoFilter = /^\d{1,8}$/;

  public readonly classNoMap = computed(() => new Map(this.classNoOption().map(item => [item.ClassNo, item.ClassCName])));

  /** 借/貸 */
  public readonly accDCOption: apiOption[] = [
    { No: 'D', Name: '借' },
    { No: 'C', Name: '貸' }
  ];

  /** 統制/明細 */
  public readonly ledgerMDOption: apiOption[] = [
    { No: '0', Name: '統制' },
    { No: '1', Name: '明細' }
  ];

  /** 是否 */
  public readonly whetherOption: apiOption[] = [
    { No: 'Y', Name: '是' },
    { No: 'N', Name: '否' }
  ];

  /** 傳票格式 */
  public readonly voucherTypeOption: apiOption[] = [
    { No: '0', Name: '無特定' },
    { No: '1', Name: '應付票據' },
    { No: '2', Name: '應收票據' },
    { No: '3', Name: '應付帳款' },

    { No: '4', Name: '應收帳款' },
    { No: '5', Name: '進項稅額' },
    { No: '6', Name: '銷項稅額' },
    { No: '7', Name: '銀行存款' },

    { No: 'A', Name: '應付費用' },
    { No: 'B', Name: '代收稅款' },
    { No: 'C', Name: '固定資產' },
    { No: 'D', Name: '現金' },
    { No: 'E', Name: '應收保證票據' }
  ];
  private readonly treeColumn = [
    { value: 'T10Label', label: '大分類' },
    { value: 'T20Label', label: '中分類' },
    { value: 'T30Label', label: '小分類' },
  ];

  private readonly LeaveLabel = 't_name';
  private readonly listTitle = '科目圖';

  public readonly TreeElements = {
    treeColumn: this.treeColumn,
    LeaveLabel: this.LeaveLabel,
    listTitle: this.listTitle,
  };

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN52080(payload: FIN52080Query): Observable<BaseQueryResponse<FIN52080Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52080Data>>(`${apiUrl}/queryFIN52080`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52080Data.set(res.Data)),
      tap(() => this.logger.debug('查詢FIN52080結果:', [this.FIN52080Data()])),
      finalize(() => this.tableLoading.set(!1))
    );
  };

  public getClassNos(): void {
    this.classNoCancel$.next();
    this.classNoLoading.set(!0);
    this.http.post<BaseQueryResponse<FIN52080ClassNo>>(`${apiUrl}/queryClassNoDropdown`, {}).pipe(
      take(1),
      takeUntil(this.classNoCancel$),
      tap(res => this.classNoOption.set(res.Data)),
      tap(() => this.logger.debug('查詢ClassNo結果:', [this.classNoOption(), this.classNoMap()])),
      finalize(() => this.classNoLoading.set(!1))
    ).subscribe();
  };

  public getFIN52080Tree(): void {
    this.treeCancel$.next();
    this.treeLoading.set(!0);
    this.http.post<BaseQueryResponse<FIN52080Tree>>(`${apiUrl}/queryFIN52080_tree_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.treeCancel$),
      tap(res => this.FIN52080Tree.set(res.Data)),
      tap(() => this.treeLoading.set(!1)),
      tap(() => this.logger.debug('查詢ClassNo樹狀結構結果:', [this.FIN52080Tree()])),
      finalize(() => this.treeLoading.set(!1))
    ).subscribe();
  }

  /** 存檔 (目前暫無update) */
  public saveFIN52080(payload: FIN52080Query, action: 'insert' | 'update' = 'insert'): Observable<BaseQueryResponse<unknown>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    const suffix = action === 'insert' ? 'insertFIN52080' : 'updateFIN52080';
    const logLabel = action === 'insert' ? '插入FIN52080結果:' : '更新FIN52080結果:';

    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/${suffix}`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.logger.debug(logLabel, [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  };
}
