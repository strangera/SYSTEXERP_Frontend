import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { FIN52080ClassNo, FIN52080Data, FIN52080Query, FIN52080Tree } from '@pages/fin/fin52080/fin52080.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52080Service {

  public readonly classNoOptions = signal<FIN52080ClassNo[]>([]);

  public readonly classNoLoading = signal<boolean>(!1);

  public accNoFilter = /^\d{1,8}$/;

  public readonly classNoMap = computed(() => new Map(this.classNoOptions().map(item => [item.ClassNo, item.ClassCName])));

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
    return this.http.post<BaseQueryResponse<FIN52080Data>>(`${apiUrl}/queryFIN52080`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN52080結果:', [res])),
    );
  };

  public getClassNos(): void {
    this.classNoLoading.set(!0);
    this.http.post<BaseQueryResponse<FIN52080ClassNo>>(`${apiUrl}/queryClassNoDropdown`, {}).pipe(
      take(1),
      tap(res => {
        this.classNoOptions.set(res.Data);
        this.logger.debug('查詢ClassNo結果:', [res]);
      }),
      finalize(() => this.classNoLoading.set(!1))
    ).subscribe();
  };

  public getFIN52080Tree(): Observable<BaseQueryResponse<FIN52080Tree>> {
    return this.http.post<BaseQueryResponse<FIN52080Tree>>(`${apiUrl}/queryFIN52080_tree_DropDownList`, {}).pipe(
      take(1),
      tap(res => this.logger.debug('查詢ClassNo樹狀結構結果:', [res])),
    );
  }

  /** 存檔 (目前暫無update) */
  public saveFIN52080(payload: FIN52080Query, action: 'insert' | 'update' = 'insert'): Observable<BaseQueryResponse<unknown>> {
    const suffix = action === 'insert' ? 'insertFIN52080' : 'updateFIN52080';
    const logLabel = action === 'insert' ? '插入FIN52080結果:' : '更新FIN52080結果:';

    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/${suffix}`, payload).pipe(
      take(1),
      tap(res => this.logger.debug(logLabel, [res])),
    );
  };
}
