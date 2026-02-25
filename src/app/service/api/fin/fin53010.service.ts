import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { FIN52030Data, FIN52030DetailData, FIN52030DetailDataResponse, FIN52030Payload } from '@pages/fin/fin52030/fin52030.model';
import { AccDescOption, FIN53010Data, FIN53010DataDetail, FIN53010DeleteResult, FIN53010InsertPayload, FIN53010InsertResult, FIN53010Payload, FIN53010UpdatePayload, FIN53010UpdateResult, NoteDescResponse } from '@pages/fin/fin53010/fin53010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN53010Service {

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
  public readonly accNoOptions = signal<Option[]>([]);
  /** 廠商 */
  public readonly vendorOptions = signal<Option[]>([]);
  /** 員工 */
  public readonly usrOptions = signal<Option[]>([]);
  /** 組織代號 */
  public readonly orgNoOptions = signal<Option[]>([]);
  /** sys1000 */
  public readonly sys1000Options = signal<Option[]>([]);
  /** 傳票型態 */
  public readonly voucherTypeOptions = signal<Option[]>([]);
  /** 對象別 */
  public readonly refNameOptions = signal<Option[]>([]);
  /** 摘要 */
  public readonly noteDescOptions = signal<AccDescOption[]>([]);
  /** 常用傳票 */
  public readonly voucherTemplateOptions = signal<FIN52030Data[]>([]);
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
    new Map(this.accNoOptions().map(item => [item.value, item]))
  );
  public readonly vendorMap = computed(() =>
    new Map(this.vendorOptions().map(item => [item.value, item]))
  );
  public readonly usrMap = computed(() =>
    new Map(this.usrOptions().map(item => [item.value, item]))
  );
  public readonly orgMap = computed(() =>
    new Map(this.orgNoOptions().map(item => [item.value, item]))
  );
  public readonly noteDescMap = computed(() =>
    new Map(this.noteDescOptions().map(item => [item.value, item]))
  );
  public readonly voucherTypeMap = computed(() =>
    new Map(this.voucherTypeOptions().map(item => [item.value, item]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) { }

  public loadFIN53010(payload: FIN53010Payload): Observable<BaseQueryResponse<FIN53010Data>> {
    return this.http.post<BaseQueryResponse<FIN53010Data>>(`${apiUrl}/queryFIN53010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN53010結果:', [res])),
    );
  }

  public loadFIN53010Detail(id: number): Observable<FIN53010DataDetail> {
    return this.http.post<FIN53010DataDetail>(`${apiUrl}/queryFIN53010Detail`, { id }).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN53010 Detail結果:', [res])),
    );
  }

  public insertFIN53010Data(payload: FIN53010InsertPayload): Observable<FIN53010InsertResult> {
    return this.http.post<FIN53010InsertResult>(`${apiUrl}/insertFIN53010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('插入FIN53010結果:', [res])),
    );
  }

  public updateFIN53010Data(payload: FIN53010UpdatePayload): Observable<FIN53010UpdateResult> {
    return this.http.post<FIN53010UpdateResult>(`${apiUrl}/updateFIN53010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN53010結果:', [res])),
    );
  }

  public deleteFIN53010Data(payload: number[]): Observable<FIN53010DeleteResult> {
    return this.http.post<FIN53010DeleteResult>(`${apiUrl}/deleteFIN53010`, { ids: payload }).pipe(
      take(1),
      tap(res => this.logger.debug('刪除FIN53010結果:', [res])),
    );
  }

  public getFin52030(payload: FIN52030Payload): Observable<BaseQueryResponse<FIN52030Data>> {
    this.fin52030Loading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/queryFIN52030`, { ...payload, PageSize: 9999, PageIndex: 1 }).pipe(
      take(1),
      tap(res => {
        this.voucherTemplateOptions.set(res.Data);
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
        this.logger.debug('查詢VoucherTemplateOptions結果:', [res]);
      }),
      finalize(() => this.vocTempLoading.set(!1)),
    );
  }

  public getVoucherTypeOptions(): void {
    this.voucherTypeLoading.set(!0);
    this.dropDownListService.queryGLS1010_DropDownList().pipe(
      take(1),
      map(res => (res?.Data || []).map(item => ({ value: item.No, label: `${item.No}-${item.Name}` } as Option))),
      tap(res => {
        this.voucherTypeOptions.set(res);
        this.logger.debug('查詢VoucherTypeOptions結果:', [res]);
      }),
      finalize(() => this.voucherTypeLoading.set(!1)),
    ).subscribe();
  }

  public getSYS1000Options(): void {
    this.sys1000Loading.set(!0);
    this.dropdownApi.querySys1000({ SYS_Type: 'Voucher_Type' }).pipe(
      take(1),
      map(res => res?.map(item => ({ value: item.No, label: item.Name } as Option)) ?? []),
      tap(res => {
        this.sys1000Options.set(res);
        this.logger.debug('查詢SYS1000Options結果:', [res]);
      }),
      finalize(() => this.sys1000Loading.set(!1)),
    ).subscribe();
  }

  public getRefNameOptions(): void {
    this.refNameLoading.set(!0);
    this.dropdownApi.queryGLS1016().pipe(
      take(1),
      map(res => res ?? []),
      tap(res => {
        this.refNameOptions.set(res);
        this.logger.debug('查詢RefNameOptions結果:', [res]);
      }),
      finalize(() => this.refNameLoading.set(!1)),
    ).subscribe();
  }

  public getAccDescOptions(AccNo: string[] = []): void {
    this.noteDescLoading.set(!0);
    this.http.post<NoteDescResponse>(`${apiUrl}/queryAccNoNoteDescDropdown`, { AccNo: Array.from(new Set(AccNo)) }).pipe(
      take(1),
      map(res => Object.entries(res.Data.AccNoNoteDesc).map(([key, value]) =>
        ({ value: key, label: value[0], data: value.map((v, i) => ({ value: String(i), label: v })) } as AccDescOption)) ?? []),
      tap(res => {
        this.noteDescOptions.set(res);
        this.logger.debug('查詢NoteDescOptions結果:', [res]);
      }),
      finalize(() => this.noteDescLoading.set(!1)),
    ).subscribe();
  }

  public getOrgNoOptions(): void {
    this.orgNoLoading.set(!0);
    this.dropdownApi.querySys3100().pipe(
      take(1),
      tap(res => {
        this.orgNoOptions.set(res ?? []);
        this.logger.debug('查詢OrgNoOptions結果:', [res]);
      }),
      finalize(() => this.orgNoLoading.set(!1)),
    ).subscribe();
  }

  public getAccNoOptions(): void {
    this.accLoading.set(!0);
    this.dropdownApi.queryGls1005_ledgerMD().pipe(
      take(1),
      map(res => res as Option[] ?? []),
      tap(res => {
        this.accNoOptions.set(res);
        this.logger.debug('查詢AccNoOptions結果:', [res]);
      }),
      finalize(() => this.accLoading.set(!1)),
    ).subscribe();
  }

  public getVendorOptions(): void {
    this.venLoading.set(!0);
    this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
      take(1),
      map(res => res ?? []),
      tap(res => {
        this.vendorOptions.set(res);
        this.logger.debug('查詢VendorOptions結果:', [res]);
      }),
      finalize(() => this.venLoading.set(!1)),
    ).subscribe();
  }

  public getUsrOptions(): void {
    this.usrLoading.set(!0);
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      map(res => res?.map(item => ({ value: item['user_No'], label: item['user_No'] + ' - ' + item['user_Name'] } as Option)) ?? []),
      tap(res => {
        this.usrOptions.set(res);
        this.logger.debug('查詢UsrOptions結果:', [res]);
      }),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();
  }
}
