import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { FIN52030Data, FIN52030DetailData, FIN52030DetailDataResponse, FIN52030Payload } from '@pages/fin/fin52030/fin52030.model';
import { AccDescOption, AccNoList, FIN53010Data, FIN53010DataDetail, FIN53010DeleteResult, FIN53010InsertPayload, FIN53010InsertResult, FIN53010Payload, FIN53010UpdatePayload, FIN53010UpdateResult, NoteDescResponse, VendorList, VoucherType } from '@pages/fin/fin53010/fin53010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN53010Service {

  public readonly tableLoading = signal<boolean>(!1);
  public readonly accLoading = signal<boolean>(!1);
  public readonly venLoading = signal<boolean>(!1);
  public readonly usrLoading = signal<boolean>(!1);
  public readonly orgNoLoading = signal<boolean>(!1);
  public readonly sys1000Loading = signal<boolean>(!1);
  public readonly voucherTypeLoading = signal<boolean>(!1);
  public readonly refNameLoading = signal<boolean>(!1);
  public readonly noteDescLoading = signal<boolean>(!1);
  public readonly fin52030Loading = signal<boolean>(!1);
  public readonly vocTempLoading = signal<boolean>(!1);

  public readonly cru = signal<boolean>(!1);

  /** 科目 */
  public readonly accNoList = signal<Option[]>([]);
  /** 廠商 */
  public readonly vendorList = signal<(Option & { short: string; })[]>([]);
  /** 員工 */
  public readonly usrList = signal<Option[]>([]);
  /** 組織代號 */
  public readonly orgNoList = signal<Option[]>([]);
  /** sys1000 */
  public readonly sys1000List = signal<Option[]>([]);
  /** 傳票型態 */
  public readonly voucherTypeList = signal<Option[]>([]);
  /** 對象別 */
  public readonly refNameList = signal<Option[]>([]);
  /** 摘要 */
  public readonly noteDescList = signal<AccDescOption[]>([]);
  /** 常用傳票 */
  public readonly voucherTemplateList = signal<FIN52030Data[]>([]);
  /** 常用傳票明細 */
  public readonly voucherTemplateDetail = signal<FIN52030DetailData>(Object.create(null));

  /** 傳票種類 */
  public readonly vouTypeOptions = [
    { value: '1', label: '現金收入傳票' },
    { value: '2', label: '現金支出傳票' },
    { value: '3', label: '轉帳傳票' }
  ];
  /** 傳票狀態 */
  public readonly postFlagOptions = [
    { value: '0', label: '作廢' },
    { value: '1', label: '建立' },
    // { value: '2', label: '確認' },
    { value: '3', label: '過帳' },
  ];
  /** 發票選項 */
  public readonly INVOptions = [
    { value: 'N', label: '否' },
    { value: 'Y', label: '是' },
  ];
  /** 傳票型態 */
  public readonly vouAccTypeOptions = [
    { value: '0', label: 'ROC' },
    { value: '1', label: 'IFRS' },
    ...(this.cru() ? [] : [{ value: void 0, label: '全部' }]),
  ];

  public readonly accNoMap = computed(() =>
    new Map(this.accNoList().map(item => [item.value, item]))
  );
  public readonly vendorMap = computed(() =>
    new Map(this.vendorList().map(item => [item.value, item]))
  );
  public readonly usrMap = computed(() =>
    new Map(this.usrList().map(item => [item.value, item]))
  );
  public readonly orgMap = computed(() =>
    new Map(this.orgNoList().map(item => [item.value, item]))
  );
  public readonly noteDescMap = computed(() =>
    new Map(this.noteDescList().map(item => [item.value, item]))
  );
  public readonly voucherTypeMap = computed(() =>
    new Map(this.voucherTypeList().map(item => [item.value, item]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN53010(payload: FIN53010Payload): Observable<BaseQueryResponse<FIN53010Data>> {
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN53010Data>>(`${apiUrl}/queryFIN53010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN53010結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public loadFIN53010Detail(id: number): Observable<FIN53010DataDetail> {
    this.tableLoading.set(!0);
    return this.http.post<FIN53010DataDetail>(`${apiUrl}/queryFIN53010Detail`, { id }).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN53010 Detail結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public insertFIN53010Data(payload: FIN53010InsertPayload): Observable<FIN53010InsertResult> {
    this.tableLoading.set(!0);
    return this.http.post<FIN53010InsertResult>(`${apiUrl}/insertFIN53010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('插入FIN53010結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public updateFIN53010Data(payload: FIN53010UpdatePayload): Observable<FIN53010UpdateResult> {
    this.tableLoading.set(!0);
    return this.http.post<FIN53010UpdateResult>(`${apiUrl}/updateFIN53010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN53010結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public deleteFIN53010Data(payload: number[]): Observable<FIN53010DeleteResult> {
    this.tableLoading.set(!0);
    return this.http.post<FIN53010DeleteResult>(`${apiUrl}/deleteFIN53010`, { ids: payload }).pipe(
      take(1),
      tap(res => this.logger.debug('刪除FIN53010結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public getFin52030(payload: FIN52030Payload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.fin52030Loading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/queryFIN52030`, { ...payload, PageSize: 9999, PageIndex: 1 }).pipe(
      take(1),
      tap(res => {
        this.voucherTemplateList.set(res.Data);
        this.logger.debug('查詢FIN52030結果:', [res]);
      }),
      finalize(() => this.fin52030Loading.set(!1)),
    );
  }

  public getFin52030Detail(TempNo: string, CompNo: string, Mid = 0): Observable<FIN52030DetailDataResponse> {
    this.vocTempLoading.set(!0);
    return this.http.post<FIN52030DetailDataResponse>(`${apiUrl}/GetFIN52030Detail`, { TempNo, CompNo, Mid }).pipe(
      take(1),
      tap(res => {
        this.voucherTemplateDetail.set(res.Data);
        this.logger.debug('查詢VoucherTemplateList結果:', [res]);
      }),
      finalize(() => this.vocTempLoading.set(!1)),
    );
  }

  public getVoucherTypeList(): void {
    this.voucherTypeLoading.set(!0);
    this.http.post<BaseQueryResponse<VoucherType>>(`${environment.ApiUrl}/FIN50000/FIN52020/queryFIN52020`, { PageSize: 9999, PageIndex: 1 }).pipe(
      take(1),
      map(res => res.Data?.map(item => ({ value: item.VoucherKind.trim(), label: item.VoucherName } as Option)) ?? []),
      tap(res => {
        this.voucherTypeList.set(res);
        this.logger.debug('查詢VoucherTypeList結果:', [res]);
      }),
      finalize(() => this.voucherTypeLoading.set(!1)),
    ).subscribe();
  }

  public getSYS1000List(): void {
    this.sys1000Loading.set(!0);
    this.dropdownApi.querySys1000({ SYS_Type: 'Voucher_Type' }).pipe(
      take(1),
      map(res => res?.map(item => ({ value: item.No, label: item.Name } as Option)) ?? []),
      tap(res => {
        this.sys1000List.set(res);
        this.logger.debug('查詢SYS1000List結果:', [res]);
      }),
      finalize(() => this.sys1000Loading.set(!1)),
    ).subscribe();
  }

  public getRefNameList(): void {
    this.refNameLoading.set(!0);
    this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      map(res => res.Data?.map(item => ({ value: item.VEN_No, label: item.VEN_Name } as Option)) ?? []),
      tap(res => {
        this.refNameList.set(res);
        this.logger.debug('查詢RefNameList結果:', [res]);
      }),
      finalize(() => this.refNameLoading.set(!1)),
    ).subscribe();
  }

  public getAccDescList(AccNo: string[]): void {
    this.noteDescLoading.set(!0);
    this.http.post<NoteDescResponse>(`${apiUrl}/queryAccNoNoteDescDropdown`, { AccNo: Array.from(new Set(AccNo)) }).pipe(
      take(1),
      map(res => Object.entries(res.Data.AccNoNoteDesc).map(([key, value]) =>
        ({ value: key, label: value[0], data: value.map((v, i) => ({ value: String(i), label: v })) } as AccDescOption)) ?? []),
      tap(res => {
        this.noteDescList.set(res);
        this.logger.debug('查詢NoteDescList結果:', [res]);
      }),
      finalize(() => this.noteDescLoading.set(!1)),
    ).subscribe();
  }

  public getOrgNoList(): void {
    this.orgNoLoading.set(!0);
    this.dropdownApi.querySys3100().pipe(
      take(1),
      tap(res => {
        this.orgNoList.set(res ?? []);
        this.logger.debug('查詢OrgNoList結果:', [res]);
      }),
      finalize(() => this.orgNoLoading.set(!1)),
    ).subscribe();
  }

  public getAccNoList(): void {
    this.accLoading.set(!0);
    this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      map(res => res.Data.map(item => ({ value: item.AccNo, label: item.AccCName, templateLabel: `${item.AccNo} - ${item.AccCName}` } as Option))),
      tap(res => {
        this.accNoList.set(res);
        this.logger.debug('查詢AccNoList結果:', [res]);
      }),
      finalize(() => this.accLoading.set(!1)),
    ).subscribe();
  }

  public getVendorList(): void {
    this.venLoading.set(!0);
    this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      map(res => res.Data.map(item => ({ value: item.VEN_No, label: item.VEN_Name, short: item.VEN_ShortName } as Option))),
      tap(res => {
        this.vendorList.set(res as (Option & { short: string; })[]);
        this.logger.debug('查詢VendorList結果:', [res]);
      }),
      finalize(() => this.venLoading.set(!1)),
    ).subscribe();
  }

  public getUsrList(): void {
    this.usrLoading.set(!0);
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      map(res => res?.map(item => ({ value: item['user_No'], label: item['user_Name'] } as Option)) ?? []),
      tap(res => {
        this.usrList.set(res);
        this.logger.debug('查詢UsrList結果:', [res]);
      }),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();
  }
}
