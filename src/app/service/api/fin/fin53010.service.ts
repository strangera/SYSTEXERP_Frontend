import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { FIN52030Data, FIN52030DetailData, FIN52030DetailDataResponse, FIN52030Payload } from '@pages/fin/fin52030/fin52030.model';
import { AccDescOption, Aps4023DetailDataByInvoiceNumberData, FIN53010Data, FIN53010DataDetail, FIN53010DeleteResult, FIN53010DetailDataByVouNoForUpdateResult, FIN53010DetailDataByVouNoResult, FIN53010InsertResult, FIN53010Payload, FIN53010UpdateResult, Gls1005Fin53010DropdownItem, InsertFIN53010Request, NoteDescResponse, Pos2013Fin53010DropdownItem, QueryAps4023DetailDataByInvoiceNumberRequest, QueryFIN53010DetailDataByVouNoForUpdateRequest, QueryFIN53010DetailDataByVouNoRequest, QueryPos2013Fin53010Request, UpdateFIN53010Request, VoidFIN53010Request } from '@pages/fin/fin53010/fin53010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { catchError, defer, finalize, map, Observable, of, take, tap } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';
/** FIN53010 根路徑 API（與 DropdownApiService 相同，非 `/FIN0000/GLS1000` 前綴） */
const fin53010RootApiUrl = environment.ApiUrl;

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
  /** 傳票關聯六表（queryFIN53010DetailData_ByVouNo） */
  public readonly detailByVouNoLoading = signal<boolean>(!1);
  /** 編輯步驟用（queryFIN53010DetailData_ByVouNo_forupdate） */
  public readonly detailByVouNoForUpdateLoading = signal<boolean>(!1);
  /** 依發票號碼查 APS4023（queryAPS4023DetatilData_ByInvoiceNumber） */
  public readonly aps4023ByInvoiceLoading = signal<boolean>(!1);

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
  /** 付款方式 */
  public readonly venPayTypeOptions = signal<Option[]>([]);
  /** 是/否 */
  public readonly yesNoOptions = signal<Option[]>([]);
  /** 課稅別 */
  public readonly taxTypeOptions = signal<Option[]>([]);
  /** 扣抵代號 */
  public readonly purDiscNoOptions = signal<Option[]>([]);
  /** 類別區分 */
  public readonly purTypeOptions = signal<Option[]>([]);
  /** 發票格式 */
  public readonly purGUIPaperOptions = signal<Option[]>([]);
  /** 發票用途 */
  public readonly purDirectTypeOptions = signal<Option[]>([]);
  /** 資產註記 */
  public readonly assetTypeOptions = signal<Option[]>([]);
  /** APS1001 銀行代號（無分行），與 fin32010 匯款銀行代號來源一致 */
  public readonly bankNoLoading = signal<boolean>(!1);
  public readonly bankNoOptions = signal<Option[]>([]);
  public readonly ptaOptions = signal<Map<string, Option[]>>(new Map());

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
  public readonly accVoucherTypeMap = computed(() =>
    new Map(this.accNoOptions().map(item => [String(item.value), String(item['Voucher_Type'] ?? item['voucherType'] ?? '')]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
    private readonly dropDownListService: DropDownListService,
  ) {}

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

  /** 傳票號碼對應應收／應付／進銷項等關聯明細 */
  public queryFIN53010DetailDataByVouNo(payload: QueryFIN53010DetailDataByVouNoRequest): Observable<FIN53010DetailDataByVouNoResult> {
    this.detailByVouNoLoading.set(!0);
    return this.http.post<FIN53010DetailDataByVouNoResult>(`${apiUrl}/queryFIN53010DetailData_ByVouNo`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('queryFIN53010DetailData_ByVouNo:', [res])),
      finalize(() => this.detailByVouNoLoading.set(!1)),
    );
  }

  /** 編輯頁「下一步」步驟表資料 */
  public queryFIN53010DetailDataByVouNoForUpdate(
    payload: QueryFIN53010DetailDataByVouNoForUpdateRequest,
  ): Observable<FIN53010DetailDataByVouNoForUpdateResult> {
    this.detailByVouNoForUpdateLoading.set(!0);
    return this.http.post<FIN53010DetailDataByVouNoForUpdateResult>(
      `${apiUrl}/queryFIN53010DetailData_ByVouNo_forupdate`,
      payload,
    ).pipe(
      take(1),
      tap(res => this.logger.debug('queryFIN53010DetailData_ByVouNo_forupdate:', [res])),
      finalize(() => this.detailByVouNoForUpdateLoading.set(!1)),
    );
  }

  private aps4023ByInvoiceRequestCount = 0;

  /** 依發票號碼查詢 APS4023 發票主檔（完整 ApiResponse，供 UI 判斷 Status／Message） */
  public queryAps4023DetailDataByInvoiceNumber(
    body: QueryAps4023DetailDataByInvoiceNumberRequest
  ): Observable<ApiResponse<Aps4023DetailDataByInvoiceNumberData | null>> {
    return defer(() => {
      this.aps4023ByInvoiceRequestCount++;
      this.aps4023ByInvoiceLoading.set(true);
      return this.http
        .post<ApiResponse<Aps4023DetailDataByInvoiceNumberData | null>>(
          `${apiUrl}/queryAPS4023DetatilData_ByInvoiceNumber`,
          body
        )
        .pipe(
          take(1),
          tap(res => this.logger.debug('queryAPS4023DetatilData_ByInvoiceNumber:', [res])),
          finalize(() => {
            this.aps4023ByInvoiceRequestCount = Math.max(0, this.aps4023ByInvoiceRequestCount - 1);
            this.aps4023ByInvoiceLoading.set(this.aps4023ByInvoiceRequestCount > 0);
          }),
          catchError(err => {
            this.logger.error('API queryAPS4023DetatilData_ByInvoiceNumber 失敗:', err);
            const body = err?.error as ApiResponse<unknown> | undefined;
            const msg = body?.Message
              ?? (typeof err?.message === 'string' ? err.message : '')
              ?? '查詢失敗';
            return of({
              Status: '9999',
              Data: null,
              Message: msg,
              Error: body?.Error ?? null,
              Meta: { Timestamp: '', RequestId: '' },
              TotalCount: 0,
              TotalPage: 0,
            } as ApiResponse<Aps4023DetailDataByInvoiceNumberData | null>);
          }),
        );
    });
  }

  /** 查詢會計科目（GLS1005 FIN53010 專用下拉） */
  public queryGls1005Fin53010(): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<Gls1005Fin53010DropdownItem[]>>(
        `${fin53010RootApiUrl}/queryGLS1005_FIN53010_DropDownList`,
        {}
      )
      .pipe(
        map(response => {
          const data = response?.Data;
          return data
            ? data.map(item => ({
              ...item,
              value: item.AccNo ?? '',
              label: `${item.AccNo ?? ''} - ${item.AccCName ?? ''}`,
            }))
            : null;
        }),
        catchError(err => {
          console.error('API /queryGLS1005_FIN53010_DropDownList 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  /** 查詢廠商（POS2013 FIN53010 專用下拉） */
  public queryPos2013Fin53010(body: QueryPos2013Fin53010Request = {}): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<Pos2013Fin53010DropdownItem[]>>(
        `${fin53010RootApiUrl}/queryPOS2013_FIN53010_DropDownList`,
        body
      )
      .pipe(
        map(response => {
          const data = response?.Data;
          return data
            ? data.map(item => ({
              ...item,
              value: item.VEN_No ?? '',
              label: `${item.VEN_No ?? ''} - ${item.VEN_Name ?? ''}`,
            }))
            : null;
        }),
        catchError(err => {
          console.error('API /queryPOS2013_FIN53010_DropDownList 失敗:', err);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }

  /** 查詢立沖代號 (GLS3003 FIN53010 專用下拉) */
  public queryGls3003Fin53010(body: { AccNo: string }): Observable<Option[] | null> {
    return this.http
      .post<ApiResponse<{ No: string; Name: string }[]>>(
        `${fin53010RootApiUrl}/queryGLS3003_FIN53010_DropDownList`,
        body
      )
      .pipe(
        map(response => {
          const data = response?.Data;
          return data
            ? data.map(item => ({
              ...item,
              value: item.No ?? '',
              label: `${item.No ?? ''} - ${item.Name ?? ''}`,
            }))
            : null;
        }),
        catchError(err => {
          console.error('API /queryGLS3003_FIN53010_DropDownList 失敗:', err);
          return of(null);
        }),
      );
  }

  public getPTADropdownOptions(accNo: string): void {
    if (!accNo || this.ptaOptions().has(accNo)) return;
    this.queryGls3003Fin53010({ AccNo: accNo }).pipe(take(1)).subscribe({
      next: res => {
        if (res) {
          this.ptaOptions.update(map => {
            const newMap = new Map(map);
            newMap.set(accNo, res);
            return newMap;
          });
        }
      }
    });
  }

  public insertFIN53010Data(payload: InsertFIN53010Request): Observable<FIN53010InsertResult> {
    return this.http.post<FIN53010InsertResult>(`${apiUrl}/insertFIN53010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('插入FIN53010結果:', [res])),
    );
  }

  public updateFIN53010Data(payload: UpdateFIN53010Request): Observable<FIN53010UpdateResult> {
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

  // 作廢
  public voidFIN53010Data(payload: number[]): Observable<FIN53010DeleteResult> {
    const body: VoidFIN53010Request = {
      GLS3001_IDList: payload.join(','),
    };

    return this.http.post<FIN53010DeleteResult>(`${apiUrl}/updateStatusFIN53010`, body).pipe(
      take(1),
      tap(res => this.logger.debug('作廢FIN53010結果:', [res])),
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
    this.queryGls1005Fin53010().pipe(
      take(1),
      map(res => (res ?? []).map(item => ({
        ...item,
        Voucher_Type: item['Voucher_Type'] ?? item['voucherType'],
        voucherType: item['voucherType'] ?? item['Voucher_Type'],
      } as Option))),
      tap(res => {
        this.accNoOptions.set(res);
        this.logger.debug('查詢AccNoOptions結果:', [res]);
      }),
      finalize(() => this.accLoading.set(!1)),
    ).subscribe();
  }

  /** 銀行代號下拉（queryAPS1001NoBranch_DropDownList） */
  public getBankNoOptions(): void {
    this.bankNoLoading.set(!0);
    this.dropdownApi.queryAps1001NoBranch().pipe(
      take(1),
      map(res => res ?? []),
      tap(res => {
        this.bankNoOptions.set(res);
        this.logger.debug('查詢BankNoOptions(APS1001)結果:', [res]);
      }),
      finalize(() => this.bankNoLoading.set(!1)),
    ).subscribe();
  }

  public getStepDropdownOptions(): void {
    this.getSYS1000ByType('VEN_PayType', this.venPayTypeOptions, 'nameOnly');
    this.getSYS1000ByType('YES_NO', this.yesNoOptions, 'nameOnly');
    this.getSYS1000ByType('PUR_TaxType', this.taxTypeOptions);
    this.getSYS1000ByType('PUR_DiscNo', this.purDiscNoOptions);
    this.getSYS1000ByType('PUR_GUIPaper', this.purGUIPaperOptions);
    this.getSYS1000ByType('PUR_Type', this.purTypeOptions);
    this.getSYS1000ByType('PUR_DirectType', this.purDirectTypeOptions);
    this.getSYS1000ByType('AssetType', this.assetTypeOptions);
  }

  private getSYS1000ByType(
    type: string,
    target: { set: (v: Option[]) => void; },
    labelMode: 'noAndName' | 'nameOnly' = 'noAndName',
  ): void {
    this.dropDownListService.querySYS1000_DropDownList({ SYS_Type: type }).pipe(
      take(1),
      map(res => (res?.Data ?? []).map(item => ({
        value: item.No,
        label: labelMode === 'nameOnly'
          ? (item.Name ?? item.No ?? '')
          : `${item.No} - ${item.Name}`,
      } as Option))),
      tap(list => target.set(list)),
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

  /** 由廠商代號取得已快取的 POS2013 選項（含 VEN_PayType、VEN_BNK_No 等欄位） */
  public findVendorOptionByVenNo(venNo: string | undefined | null): Option | undefined {
    const v = typeof venNo === 'string' ? venNo.trim() : '';
    if (!v) return undefined;
    return this.vendorOptions().find(o => String(o.value) === v);
  }

  /** 已以 queryPOS2013_FIN53010_DropDownList 合併過的廠商代號（每鍵僅請求一次） */
  private readonly fin53010VenHydrationKeys = new Set<string>();

  /**
   * 以 queryPOS2013_FIN53010_DropDownList 合併廠商主檔（含 VEN_PayType、VEN_BNK_No、帳號等），
   * 並與既有 queryPOS2013 全量清單併入同一筆 option。每個廠商代號僅請求一次。
   */
  public ensureFin53010VendorForSteps(venNo: string): Observable<void> {
    const key = typeof venNo === 'string' ? venNo.trim() : '';
    if (!key) return of(void 0);
    if (this.fin53010VenHydrationKeys.has(key)) return of(void 0);
    return this.queryPos2013Fin53010({ VEN_No: key }).pipe(
      take(1),
      tap(opts => {
        this.fin53010VenHydrationKeys.add(key);
        const match = opts?.find(o => String(o.value) === key);
        this.vendorOptions.update(list => {
          const idx = list.findIndex(o => String(o.value) === key);
          if (match) {
            if (idx >= 0) {
              const next = [...list];
              next[idx] = { ...next[idx], ...match };
              return next;
            }
            return [...list, match];
          }
          if (idx < 0) return [...list, { value: key, label: key } as Option];
          return list;
        });
      }),
      catchError(err => {
        this.logger.error('queryPOS2013_FIN53010_DropDownList 合併失敗', err);
        return of(null);
      }),
      map(() => void 0),
    );
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
