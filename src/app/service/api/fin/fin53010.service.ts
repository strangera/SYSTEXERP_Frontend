import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { FIN52030Data, FIN52030DetailData, FIN52030DetailDataResponse, FIN52030Payload } from '@pages/fin/fin52030/fin52030.model';
import { AccDescOption, Aps2002DetailDataByInvoiceNoData, Aps4023DetailDataByInvoiceNumberData, FIN53010Data, FIN53010DataDetail, FIN53010DeleteResult, FIN53010DetailDataByVouNoForUpdateResult, FIN53010DetailDataByVouNoResult, FIN53010InsertResult, FIN53010Payload, FIN53010UpdateResult, GetCalculatedPayDateRequest, GetCalculatedPayDateResult, GetEmployeeBankAccountRequest, GetEmployeeBankAccountResult, EmployeeBankAccountItem, Gls1005Fin53010DropdownItem, InsertFIN53010Request, NoteDescResponse, Pos2013Fin53010DropdownItem, QueryAps2002DetailDataByInvoiceNoRequest, QueryAps2002OriginalInvoicesForAllowanceRequest, QueryAps2002PurchaseInvoicesForPickerRequest, QueryAps4023DetailDataByInvoiceNumberRequest, QueryAps4023OriginalInvoicesForAllowanceRequest, Pos4023DetailDataByInvoiceNumberData, QueryPos4023DetailDataByInvoiceNumberRequest, QuerySalesInvoicesForPickerRequest, QueryFIN53010DetailDataByVouNoForUpdateRequest, QueryFIN53010DetailDataByVouNoRequest, QueryPos2013Fin53010Request, QueryGLS3003AbatAcctRequest, QueryGLS3003AbatAcctResponse, CheckGLS3003PtaLockedRequest, CheckGLS3003PtaLockedResponse, UpdateFIN53010Request, VoidFIN53010Request } from '@pages/fin/fin53010/fin53010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { DropDownListService } from '@service/utility/dropDownList.service';
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
  /** 依發票號碼查 APS2002 原始進項發票（queryAPS2002DetailData_ByInvoiceNo） */
  public readonly aps2002ByInvoiceLoading = signal<boolean>(!1);
  /** 依廠商與立帳日期查預計付款日（getCalculatedPayDate） */
  public readonly calculatedPayDateLoading = signal<boolean>(!1);

  public readonly cru = signal<boolean>(!1);

  /** 科目 */
  public readonly accNoOptions = signal<Option[]>([]);
  /** 廠商 */
  public readonly vendorOptions = signal<Option[]>([]);
  /** 廠商統一編號（VEN_UNIFORM 去重） */
  public readonly vendorUniformOptions = signal<Option[]>([]);
  /** 廠商統一編號 → 廠商代號（VEN_No）對照 Map */
  public readonly vendorUniformToVenNoMap = signal<Map<string, string>>(new Map());
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
    { value: '2', label: '確認' },
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

  public loadFIN53010(payload: FIN53010Payload): Observable<ApiResponse<FIN53010Data[]>> {
    return this.http.post<ApiResponse<FIN53010Data[]>>(`${apiUrl}/queryFIN53010`, payload).pipe(
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

  private aps2002ByInvoiceRequestCount = 0;

  /** 依發票號碼查詢 APS2002 原始進項發票（格式 21/22/25），供進項折讓 blur 帶入 */
  public queryAps2002DetailDataByInvoiceNo(
    body: QueryAps2002DetailDataByInvoiceNoRequest
  ): Observable<ApiResponse<Aps2002DetailDataByInvoiceNoData | null>> {
    return defer(() => {
      this.aps2002ByInvoiceRequestCount++;
      this.aps2002ByInvoiceLoading.set(true);
      return this.http
        .post<ApiResponse<Aps2002DetailDataByInvoiceNoData | null>>(
          `${apiUrl}/queryAPS2002DetailData_ByInvoiceNo`,
          body
        )
        .pipe(
          take(1),
          tap(res => this.logger.debug('queryAPS2002DetailData_ByInvoiceNo:', [res])),
          finalize(() => {
            this.aps2002ByInvoiceRequestCount = Math.max(0, this.aps2002ByInvoiceRequestCount - 1);
            this.aps2002ByInvoiceLoading.set(this.aps2002ByInvoiceRequestCount > 0);
          }),
          catchError(err => {
            this.logger.error('API queryAPS2002DetailData_ByInvoiceNo 失敗:', err);
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
            } as ApiResponse<Aps2002DetailDataByInvoiceNoData | null>);
          }),
        );
    });
  }

  /** 查詢可折讓原始進項發票清單（格式 21/22/25），支援分頁 */
  public queryAps2002OriginalInvoicesForAllowance(
    body: QueryAps2002OriginalInvoicesForAllowanceRequest
  ): Observable<ApiResponse<Aps2002DetailDataByInvoiceNoData[]>> {
    return this.http
      .post<ApiResponse<Aps2002DetailDataByInvoiceNoData[]>>(
        `${apiUrl}/queryAPS2002OriginalInvoices_ForAllowance`,
        body
      )
      .pipe(
        take(1),
        catchError(err => {
          this.logger.error('API queryAPS2002OriginalInvoices_ForAllowance 失敗:', err);
          return of({ Status: '9999', Data: [], Message: '查詢失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<Aps2002DetailDataByInvoiceNoData[]>);
        }),
      );
  }

  /** 查詢可折讓原始銷項發票清單（格式 31/32/35），支援分頁 */
  public queryAps4023OriginalInvoicesForAllowance(
    body: QueryAps4023OriginalInvoicesForAllowanceRequest
  ): Observable<ApiResponse<Aps4023DetailDataByInvoiceNumberData[]>> {
    return this.http
      .post<ApiResponse<Aps4023DetailDataByInvoiceNumberData[]>>(
        `${apiUrl}/queryAPS4023OriginalInvoices_ForAllowance`,
        body
      )
      .pipe(
        take(1),
        catchError(err => {
          this.logger.error('API queryAPS4023OriginalInvoices_ForAllowance 失敗:', err);
          return of({ Status: '9999', Data: [], Message: '查詢失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<Aps4023DetailDataByInvoiceNumberData[]>);
        }),
      );
  }

  /** 依發票號碼查 POS4023 銷項發票主檔（格式 31/32），供雙擊帶出／傳票號碼提醒 */
  public queryPos4023DetailDataByInvoiceNumber(
    body: QueryPos4023DetailDataByInvoiceNumberRequest
  ): Observable<ApiResponse<Pos4023DetailDataByInvoiceNumberData | null>> {
    return this.http
      .post<ApiResponse<Pos4023DetailDataByInvoiceNumberData | null>>(
        `${apiUrl}/queryPOS4023DetailData_ByInvoiceNumber`,
        body
      )
      .pipe(
        take(1),
        catchError(err => {
          this.logger.error('API queryPOS4023DetailData_ByInvoiceNumber 失敗:', err);
          const eb = err?.error as ApiResponse<unknown> | undefined;
          return of({ Status: '9999', Data: null, Message: eb?.Message ?? '查詢失敗', Error: eb?.Error ?? null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<Pos4023DetailDataByInvoiceNumberData | null>);
        }),
      );
  }

  /** APS2002 一般進項發票清單（格式 21/22/25），供 picker 彈窗，分頁 */
  public queryAps2002PurchaseInvoicesForPicker(
    body: QueryAps2002PurchaseInvoicesForPickerRequest
  ): Observable<ApiResponse<Aps2002DetailDataByInvoiceNoData[]>> {
    return this.http
      .post<ApiResponse<Aps2002DetailDataByInvoiceNoData[]>>(
        `${apiUrl}/queryAPS2002PurchaseInvoices_ForPicker`,
        body
      )
      .pipe(
        take(1),
        catchError(err => {
          this.logger.error('API queryAPS2002PurchaseInvoices_ForPicker 失敗:', err);
          return of({ Status: '9999', Data: [], Message: '查詢失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<Aps2002DetailDataByInvoiceNoData[]>);
        }),
      );
  }

  /** POS4023 銷項發票清單（格式 31/32），供 picker 彈窗，分頁 */
  public queryPos4023SalesInvoicesForPicker(
    body: QuerySalesInvoicesForPickerRequest
  ): Observable<ApiResponse<Pos4023DetailDataByInvoiceNumberData[]>> {
    return this.http
      .post<ApiResponse<Pos4023DetailDataByInvoiceNumberData[]>>(
        `${apiUrl}/queryPOS4023SalesInvoices_ForPicker`,
        body
      )
      .pipe(
        take(1),
        catchError(err => {
          this.logger.error('API queryPOS4023SalesInvoices_ForPicker 失敗:', err);
          return of({ Status: '9999', Data: [], Message: '查詢失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<Pos4023DetailDataByInvoiceNumberData[]>);
        }),
      );
  }

  /** APS4023 銷項發票清單（格式 35），供 picker 彈窗，分頁 */
  public queryAps4023SalesInvoicesForPicker(
    body: QuerySalesInvoicesForPickerRequest
  ): Observable<ApiResponse<Aps4023DetailDataByInvoiceNumberData[]>> {
    return this.http
      .post<ApiResponse<Aps4023DetailDataByInvoiceNumberData[]>>(
        `${apiUrl}/queryAPS4023SalesInvoices_ForPicker`,
        body
      )
      .pipe(
        take(1),
        catchError(err => {
          this.logger.error('API queryAPS4023SalesInvoices_ForPicker 失敗:', err);
          return of({ Status: '9999', Data: [], Message: '查詢失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<Aps4023DetailDataByInvoiceNumberData[]>);
        }),
      );
  }

  /** 驗證銷項發票號碼是否在配號範圍內（31/32→APS2001，35→POS1017） */
  public validateSalesInvoice(
    body: { InvoiceType: string; InvoicePrefix: string; InvoiceNo: string }
  ): Observable<ApiResponse<boolean>> {
    return this.http
      .post<ApiResponse<boolean>>(`${apiUrl}/validateSalesInvoice`, body)
      .pipe(
        take(1),
        catchError(err => {
          this.logger.error('API validateSalesInvoice 失敗:', err);
          return of({ Status: '9999', Data: false, Message: '驗證失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<boolean>);
        }),
      );
  }

  public queryGLS3003AbatAcct(request: QueryGLS3003AbatAcctRequest): Observable<ApiResponse<QueryGLS3003AbatAcctResponse[]>> {
    return this.http.post<ApiResponse<QueryGLS3003AbatAcctResponse[]>>(`${apiUrl}/queryGLS3003AbatAcct`, request).pipe(
      take(1),
      catchError(err => {
        this.logger.error('API queryGLS3003AbatAcct 失敗:', err);
        return of({ Status: '9999', Data: [], Message: '查詢失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<QueryGLS3003AbatAcctResponse[]>);
      }),
    );
  }

  public checkGLS3003PtaLocked(request: CheckGLS3003PtaLockedRequest): Observable<ApiResponse<CheckGLS3003PtaLockedResponse[]>> {
    return this.http.post<ApiResponse<CheckGLS3003PtaLockedResponse[]>>(`${apiUrl}/checkGLS3003PtaLocked`, request).pipe(
      take(1),
      catchError(err => {
        this.logger.error('API checkGLS3003PtaLocked 失敗:', err);
        return of({ Status: '9999', Data: [], Message: '檢查失敗', Error: null, Meta: { Timestamp: '', RequestId: '' }, TotalCount: 0, TotalPage: 0 } as ApiResponse<CheckGLS3003PtaLockedResponse[]>);
      }),
    );
  }

  public checkRepYYYYMMAudited(repYYYYMM: string): Observable<boolean> {
    return this.http
      .post<ApiResponse<boolean>>(`${apiUrl}/checkRepYYYYMMAudited`, { RepYYYYMM: repYYYYMM })
      .pipe(
        map(res => res?.Data ?? false),
        catchError(() => of(false)),
      );
  }

  public getDefaultOrgId(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${apiUrl}/getDefaultOrgId`, {}).pipe(take(1));
  }

  public getCalculatedPayDate(payload: GetCalculatedPayDateRequest): Observable<GetCalculatedPayDateResult> {
    this.calculatedPayDateLoading.set(true);
    return this.http.post<GetCalculatedPayDateResult>(`${apiUrl}/getCalculatedPayDate`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('getCalculatedPayDate:', [payload, res])),
      catchError(err => {
        this.logger.error('API getCalculatedPayDate 失敗:', err);
        const body = err?.error as Partial<GetCalculatedPayDateResult> | undefined;
        const msg = typeof body?.Message === 'string' && body.Message
          ? body.Message
          : (typeof err?.message === 'string' && err.message ? err.message : '查詢預計付款日失敗');
        return of({
          Status: '9999',
          Data: null as string | null,
          Message: msg,
          Error: body?.Error ?? null,
          Meta: body?.Meta ?? { Timestamp: '', RequestId: '' },
          TotalCount: 0,
          TotalPage: 0,
        } as GetCalculatedPayDateResult);
      }),
      finalize(() => this.calculatedPayDateLoading.set(false)),
    );
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
              value: (item.AccNo ?? '').trim(),
              label: `${(item.AccNo ?? '').trim()} - ${item.AccCName ?? ''}`,
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
              // trim 防止 DB CHAR 欄位尾端空白導致後續 value 比對失敗
              value: (item.VEN_No ?? '').trim(),
              label: `${(item.VEN_No ?? '').trim()} - ${item.VEN_Name ?? ''}`,
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

  public deleteFIN53010Data(id: number): Observable<FIN53010DeleteResult> {
    return this.http.post<FIN53010DeleteResult>(`${apiUrl}/deleteFIN53010`, { id }).pipe(
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

  public getFin52030(payload: FIN52030Payload): Observable<ApiResponse<FIN52030Data[]>> {
    this.fin52030Loading.set(!0);
    return this.http.post<ApiResponse<FIN52030Data[]>>(`${apiUrl}/queryFIN52030`, { ...payload, PageSize: 9999, PageIndex: 1 }).pipe(
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
        // 全量清單重載時清除 hydration 快取，避免舊快取阻擋下次補水化
        this.fin53010VenHydrationKeys.clear();
        this.fin53010VenInflight.clear();
        this.vendorOptions.set(res);
        this.logger.debug('查詢VendorOptions結果:', [res]);
      }),
      finalize(() => this.venLoading.set(!1)),
    ).subscribe();
  }

  public getVendorUniformOptions(): void {
    this.dropdownApi.queryVendorNoGroup({ VEN_Flag: '' }).pipe(
      take(1),
      map(res => (res ?? []).map((item: any) => ({
        value: item.No,
        label: `${item.No} - ${item.Name}`,
        VEN_No: item.subItems?.[0]?.VEN_No as string | undefined,
      }))),
      tap(list => {
        this.vendorUniformOptions.set(list);
        const m = new Map<string, string>();
        for (const opt of list) {
          if (opt.VEN_No) m.set(String(opt.value), String(opt.VEN_No));
        }
        this.vendorUniformToVenNoMap.set(m);
      }),
    ).subscribe();
  }

  /** 由廠商代號取得已快取的 POS2013 選項（含 VEN_PayType、VEN_BNK_No 等欄位） */
  public findVendorOptionByVenNo(venNo: string | undefined | null): Option | undefined {
    const v = typeof venNo === 'string' ? venNo.trim() : '';
    if (!v) return undefined;
    return this.vendorOptions().find(o => String(o.value) === v);
  }

  /** 已成功取得並合併 FIN53010 廠商資料的廠商代號（有此 key 才算真正水化完成） */
  private readonly fin53010VenHydrationKeys = new Set<string>();
  /** 進行中的補水化請求（同一廠商併發時共用同一條 Observable，避免重複發請求、也避免提早完成） */
  private readonly fin53010VenInflight = new Map<string, Observable<void>>();

  /** 廠商代號是否已成功取得 FIN53010 補水化資料（VEN_PayConditionDay 等已合入 option） */
  public isVendorHydratedForFin53010(venNo: string): boolean {
    const key = typeof venNo === 'string' ? venNo.trim() : '';
    return !!key && this.fin53010VenHydrationKeys.has(key);
  }

  /**
   * 以 queryPOS2013_FIN53010_DropDownList 合併廠商主檔（含 VEN_PayType、VEN_BNK_No、帳號等），
   * 並與既有 queryPOS2013 全量清單併入同一筆 option。
   *
   * 併發保護：同一廠商在請求進行中時，所有呼叫者共用同一條 Observable，
   * 因此每個 subscribe 都會在「資料真的回來」之後才完成——這是修正「日期偶爾帶不進來」
   * 的關鍵（舊版用 attemptedKeys 讓後續呼叫者立即拿到 of(void 0)，導致其 subscribe 早於資料抵達）。
   */
  public ensureFin53010VendorForSteps(venNo: string): Observable<void> {
    const key = typeof venNo === 'string' ? venNo.trim() : '';
    if (!key) return of(void 0);
    // 已成功取得資料 → 直接返回
    if (this.fin53010VenHydrationKeys.has(key)) return of(void 0);
    // 請求進行中 → 回傳同一條，等它真正完成
    const inflight = this.fin53010VenInflight.get(key);
    if (inflight) return inflight;
    const req$ = this.queryPos2013Fin53010({ VEN_No: key }).pipe(
      take(1),
      tap(opts => {
        // value 已在 queryPos2013Fin53010 的 map 中 trim，這裡再加 .trim() 當保險
        const match = opts?.find(o => String(o.value).trim() === key);
        if (!match) return; // API 未回傳此廠商資料，不標記為成功水化，允許下次重試
        this.fin53010VenHydrationKeys.add(key);
        this.vendorOptions.update(list => {
          const idx = list.findIndex(o => String(o.value).trim() === key);
          if (idx >= 0) {
            const next = [...list];
            next[idx] = { ...next[idx], ...match };
            return next;
          }
          return [...list, { ...match, value: key }];
        });
      }),
      catchError(err => {
        this.logger.error('queryPOS2013_FIN53010_DropDownList 合併失敗', err);
        return of(null);
      }),
      map(() => void 0),
      // 請求結束（成功或失敗）後移除 inflight；成功者已進 hydrationKeys，失敗者可下次重試
      finalize(() => this.fin53010VenInflight.delete(key)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.fin53010VenInflight.set(key, req$);
    return req$;
  }

  /** 預計付款/收款日快取：key = `${venNo}|${yyyy-MM-dd}` → Date | null（null = 廠商無付款條件，不帶日期） */
  private readonly payDateCache = new Map<string, Date | null>();
  /** 進行中的 getCalculatedPayDate 請求，同 key 併發共用 */
  private readonly payDateInflight = new Map<string, Observable<Date | null>>();

  private payDateKey(venNo: string, dateKey: string): string {
    return `${(venNo ?? '').trim()}|${dateKey}`;
  }

  /**
   * 讀取已快取的預計付款/收款日。
   * 回傳 undefined = 尚未查詢（需呼叫 ensureCalculatedPayDate）；Date = 已算出；null = 廠商無付款條件。
   */
  public getCachedPayDate(venNo: string, dateKey: string): Date | null | undefined {
    const k = this.payDateKey(venNo, dateKey);
    return this.payDateCache.has(k) ? this.payDateCache.get(k) : undefined;
  }

  /**
   * 以後端 getCalculatedPayDate 為權威來源，確保 (廠商, 立帳日) 的預計付款/收款日已查詢並快取。
   * 每組 (venNo, dateKey) 僅打一次 API；失敗不寫快取，允許下次重試。
   */
  public ensureCalculatedPayDate(venNo: string, dateKey: string): Observable<Date | null> {
    const v = (venNo ?? '').trim();
    const k = this.payDateKey(v, dateKey);
    if (this.payDateCache.has(k)) return of(this.payDateCache.get(k)!);
    if (!v || !dateKey) return of(null);
    const inflight = this.payDateInflight.get(k);
    if (inflight) return inflight;
    const req$ = this.getCalculatedPayDate({ VenNo: v, _Date: dateKey }).pipe(
      map(res => {
        const raw = res?.Data;
        const d = raw ? new Date(raw) : null;
        const val = d && !isNaN(d.getTime()) ? d : null;
        this.payDateCache.set(k, val); // 含 null：確定無日期，避免重複查
        return val;
      }),
      catchError(() => of(null as Date | null)), // 失敗不寫快取，下次可重試
      finalize(() => this.payDateInflight.delete(k)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.payDateInflight.set(k, req$);
    return req$;
  }

  /** 員工銀行帳號快取：userNo → item | null（null = 查無，避免重複查） */
  private readonly employeeBankCache = new Map<string, EmployeeBankAccountItem | null>();
  /** 進行中的員工銀行帳號請求，同 userNo 併發共用 */
  private readonly employeeBankInflight = new Map<string, Observable<EmployeeBankAccountItem | null>>();

  /** 是否為員工付款對象（在員工清單，且非廠商）——員工銀行資料需改由 tblUser_BnkAcct 帶出 */
  public isEmployeePayee(no: string | null | undefined): boolean {
    const k = typeof no === 'string' ? no.trim() : '';
    return !!k && this.usrMap().has(k) && !this.vendorMap().has(k);
  }

  /** 讀取已快取員工銀行帳號；undefined=尚未查、null=查無、物件=有 */
  public getCachedEmployeeBank(userNo: string): EmployeeBankAccountItem | null | undefined {
    const k = (userNo ?? '').trim();
    return this.employeeBankCache.has(k) ? this.employeeBankCache.get(k) : undefined;
  }

  /**
   * 以後端 getEmployeeBankAccount 為權威來源，確保員工銀行帳號已查詢並快取。
   * 一員工一對一帳號；若多筆取 SEQ_NO 最小者為主帳號。失敗不寫快取，允許下次重試。
   */
  public ensureEmployeeBankAccount(userNo: string): Observable<EmployeeBankAccountItem | null> {
    const k = (userNo ?? '').trim();
    if (!k) return of(null);
    if (this.employeeBankCache.has(k)) return of(this.employeeBankCache.get(k)!);
    const inflight = this.employeeBankInflight.get(k);
    if (inflight) return inflight;
    const req$ = this.http
      .post<GetEmployeeBankAccountResult>(`${apiUrl}/getEmployeeBankAccount`, { UserNo: k } as GetEmployeeBankAccountRequest)
      .pipe(
        take(1),
        map(res => {
          const list = res?.Data ?? [];
          const first = list.length
            ? [...list].sort((a, b) => (a.SEQ_NO ?? 0) - (b.SEQ_NO ?? 0))[0]
            : null;
          this.employeeBankCache.set(k, first);
          return first;
        }),
        catchError(err => {
          this.logger.error('API getEmployeeBankAccount 失敗:', err);
          return of(null as EmployeeBankAccountItem | null); // 失敗不寫快取，下次可重試
        }),
        finalize(() => this.employeeBankInflight.delete(k)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    this.employeeBankInflight.set(k, req$);
    return req$;
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
