import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { DeleteFIN52080Request, FIN52080ClassNo, FIN52080Data, FIN52080Query, FIN52080Tree, UpdateFIN52080Request, UpdateFIN52080Response } from '@pages/fin/fin52080/fin52080.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52080Service {

  public readonly classNoOptions = signal<Option[]>([]);
  public readonly classNoLoading = signal<boolean>(!1);

  public readonly accNoOptions = signal<Option[]>([]);
  public readonly accNoLoading = signal<boolean>(!1);

  public accNoFilter = /^\d{1,8}$/;

  public readonly classNoMap = computed(() => new Map(this.classNoOptions().map(item => [item.value, item])));
  public readonly voucherTypeMap = computed(() => new Map(this.voucherTypeOption.map(item => [item.value, item.label])));

  /** 借/貸 */
  public readonly accDCOption: Option[] = [
    { value: 'D', label: '借' },
    { value: 'C', label: '貸' }
  ];

  /** 統制/明細 */
  public readonly ledgerMDOption: Option[] = [
    { value: '0', label: '統制' },
    { value: '1', label: '明細' }
  ];

  /** 是否 */
  public readonly whetherOption: Option[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' }
  ];

  /** 傳票格式 */
  public readonly voucherTypeOption: Option[] = [
    { value: '0', label: '無特定' },
    { value: '1', label: '應付票據' },
    { value: '2', label: '應收票據' },
    { value: '3', label: '應付帳款' },

    { value: '4', label: '應收帳款' },
    { value: '5', label: '進項稅額' },
    { value: '6', label: '銷項稅額' },
    { value: '7', label: '銀行存款' },

    { value: 'A', label: '應付費用' },
    { value: 'B', label: '代收稅款' },
    { value: 'C', label: '固定資產' },
    { value: 'D', label: '現金' },
    { value: 'E', label: '應收保證票據' }
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN52080(payload: FIN52080Query): Observable<ApiResponse<FIN52080Data[]>> {
    return this.http.post<ApiResponse<FIN52080Data[]>>(`${apiUrl}/queryFIN52080`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN52080結果:', [res])),
      map(res => ({
        ...res,
        Data: res.Data.map(item => ({
          ...item,
          AccDC: typeof item.AccDC === 'string' && item.AccDC.length > 0 ? item.AccDC.toUpperCase().trim() : void 0,
          Ledger_MD: typeof item.Ledger_MD === 'string' && item.Ledger_MD.length > 0 ? item.Ledger_MD.toUpperCase().trim() : void 0,
          Budget_YN: typeof item.Budget_YN === 'string' && item.Budget_YN.length > 0 ? item.Budget_YN.toUpperCase().trim() : void 0,
          Org_YN: typeof item.Org_YN === 'string' && item.Org_YN.length > 0 ? item.Org_YN.toUpperCase().trim() : void 0,
          Input_YN: typeof item.Input_YN === 'string' && item.Input_YN.length > 0 ? item.Input_YN.toUpperCase().trim() : void 0,
        }))
      }) as unknown as ApiResponse<FIN52080Data[]>),
      tap(res => this.logger.debug('格式化FIN52080結果:', [res])),
    );
  };

  public getClassNos(): void {
    this.classNoLoading.set(!0);
    this.http.post<ApiResponse<FIN52080ClassNo[]>>(`${apiUrl}/queryClassNoDropdown`, {}).pipe(
      take(1),
      map(res => res.Data.map(item => ({ value: item.ClassNo, label: `${item.ClassNo} - ${item.ClassCName}`, ...item }))),
      tap(res => {
        this.classNoOptions.set(res);
        this.logger.debug('查詢ClassNo結果:', [res]);
      }),
      finalize(() => this.classNoLoading.set(!1))
    ).subscribe();
  };

  public getFIN52080Tree(): Observable<ApiResponse<FIN52080Tree[]>> {
    return this.http.post<ApiResponse<FIN52080Tree[]>>(`${apiUrl}/queryFIN52080_tree_DropDownList`, {}).pipe(
      take(1),
      tap(res => this.logger.debug('查詢ClassNo樹狀結構結果:', [res])),
    );
  }

  /** 存檔 (目前暫無update) */
  public saveFIN52080(payload: FIN52080Query, action: 'insert' | 'update' = 'insert'): Observable<ApiResponse<unknown[]>> {
    const suffix = action === 'insert' ? 'insertFIN52080' : 'updateFIN52080';
    const logLabel = action === 'insert' ? '插入FIN52080結果:' : '更新FIN52080結果:';

    return this.http.post<ApiResponse<unknown[]>>(`${apiUrl}/${suffix}`, payload).pipe(
      take(1),
      tap(res => this.logger.debug(logLabel, [res])),
    );
  };

  /** 更新 */
  public updateFIN52080(payload: UpdateFIN52080Request): Observable<ApiResponse<UpdateFIN52080Response[]>> {
    return this.http.post<ApiResponse<UpdateFIN52080Response[]>>(`${apiUrl}/updateFIN52080`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN52080結果:', [res])),
    );
  }

  /** 刪除 */
  public deleteFIN52080(payload: DeleteFIN52080Request): Observable<ApiResponse<unknown[]>> {
    return this.http.post<ApiResponse<unknown[]>>(`${apiUrl}/deleteFIN52080`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('刪除FIN52080結果:', [res])),
    );
  };

  /** 載入會計科目下拉（供 DEPRE_AccNo / ACCUDEPRE_AccNo 使用，限「明細」科目 Ledger_MD='1'） */
  public getAccNoOptions(): void {
    if (this.accNoOptions().length > 0) return;
    this.accNoLoading.set(!0);
    this.dropdownApi.queryGls1005ByLedgerMD('1').pipe(
      take(1),
      tap(opts => this.accNoOptions.set(opts ?? [])),
      finalize(() => this.accNoLoading.set(!1)),
    ).subscribe();
  }

  /** 檢查科目代號是否已存在 */
  public checkAccNoExists(accNo: string): Observable<ApiResponse<boolean[]>> {
    return this.http.post<ApiResponse<boolean[]>>(`${apiUrl}/checkAccNoExists`, { AccNo: accNo }).pipe(
      take(1),
      tap(res => this.logger.debug('檢查科目代號結果:', [res])),
    );
  }
}
