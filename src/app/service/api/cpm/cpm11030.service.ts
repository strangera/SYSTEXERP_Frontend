import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FavoriteService } from '@service/system/favorite.service';
import { Option } from '@service/utility/dropdown-api.model';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { Observable, forkJoin } from 'rxjs';
import { finalize, shareReplay, take, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/** =========================
 *  Common
 *  ========================= */
export interface SortItem { field: string; order: number }

/** =========================
 *  Query: /queryCPM11030
 *  ========================= */
export interface QueryCPM11030Request {
  PageSize: number;
  PageIndex: number;
  SortBy?: SortItem[];

  Loan_No?: string;
  Loan_BDate?: string; // ISO string
  Loan_EDate?: string; // ISO string
  User_Name?: string;
  Loan_USR_No?: string;
  Loan_Phone?: string;
  Cert_Type?: string;
  Cert_No?: string;
  Device_Name?: string;
  Device_ID?: string;
  Service_Id?: string;

  [key: string]: any;
}

export interface QueryCPM11030Row {
  ID: number;
  Loan_No: string;
  Service_Id: string;

  Loan_Date: string;   // ISO datetime
  Loan_Time: string;   // string
  Loan_Status: string; // string

  User_Name: string;
  Cert_Type: string;
  Cert_No: string;
  Loan_Phone: string;

  Device_ID: string;
  Device_Name: string;

  Loan_USR_No?: string;

  [key: string]: any;
}

/** =========================
 *  Daily Equip Availability
 *  ========================= */
export interface QueryDailyEquipAvailabilityRequest {
  Service_Id: string;
}

export interface DailyEquipAvailabilityRow {
  Device_ID: string;
  Device_Name: string;
  Device_Qty: number;
}

export interface InsertDailyEquipAvailabilityRequest {
  CSS_Date: string; // ISO string
  Service_Id: string;
  Device_ID: string;
  CSS_PriorQty: number;
  CSS_LendQty: number;
  CSS_ReturnQty: number;
  CSS_CurrentQty: number;
}

/** =========================
 *  CRU: insert/update CPM11030
 *  ========================= */
export interface InsertCPM11030Request {
  Service_Id: string;
  Loan_Date: string;   // ISO datetime
  Loan_Time: string;   // string
  Loan_Status: string; // string
  User_Name: string;
  Cert_Type: string;
  Cert_No: string;
  Loan_Phone: string;
  Device_ID: string;
  Device_Name: string;
}

export interface UpdateCPM11030Request extends InsertCPM11030Request {
  ID: number;
  Loan_No: string;
}

export interface DropDownItem {
  No: string;
  Name: string;
}

export interface DropDownListResponse {
  Status?: string;
  Data?: DropDownItem[];
  Message?: string;
  TotalCount?: number;
  TotalPage?: number;
  Error?: {
    Code?: string;
    Message?: string;
    Details?: string;
  };
  Meta?: {
    Timestamp?: string;
    RequestId?: string;
  };
}

/** 轉成前端 dropdown options 用 */
export interface OptionItem { value: string; label: string }

@Injectable({ providedIn: 'root' })
export class Cpm11030Service {
  private apiUrl = `${environment.ApiUrl}/CPM0000/CPM1000`;
  private DLapiUrl = `${environment.ApiUrl}`;

  public readonly usrLoading = signal<boolean>(!1);
  // TODO: 三種 usr 列表 (全部 | 建立人 | 更新人) 看之後要用哪格
  public readonly usrOptions = signal<Option[]>([]);
  public readonly crtUsrOptions = signal<Option[]>([]);
  public readonly updUsrOptions = signal<Option[]>([]);

  /** ✅ 下拉快取：Query/CRU 共用同一份（只會真的打一次） */
  private dropdownOnce$?: Observable<{
    css1001: DropDownListResponse;
    sys1000: DropDownListResponse;
    css2001: DropDownListResponse;
  }>;

  constructor(private http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly fav: FavoriteService,
  ) { }

  /** ✅ 給 Query/CRU 共用的下拉（只打一次） */
  getDropdownsOnce(): Observable<{
    css1001: DropDownListResponse;
    sys1000: DropDownListResponse;
    css2001: DropDownListResponse;
  }> {
    if (!this.dropdownOnce$) {
      this.dropdownOnce$ = forkJoin({
        css1001: this.queryCSS1001_DropDownList(),
        sys1000: this.queryCPM11030_SYS1000_DropDownList(),
        css2001: this.queryCSS2001_DropDownList(),
      }).pipe(shareReplay(1));
    }
    return this.dropdownOnce$;
  }

  /** 列表查詢：/queryCPM11030 */
  queryCPM11030(body: QueryCPM11030Request): Observable<ApiResponse<QueryCPM11030Row[]>> {
    return this.http.post<ApiResponse<QueryCPM11030Row[]>>(`${this.apiUrl}/queryCPM11030`, body);
  }

  /** 每日設備可出借量：查詢 /queryCPM11030_DailyEquipAvailability */
  queryCPM11030_DailyEquipAvailability(
    body: QueryDailyEquipAvailabilityRequest
  ): Observable<ApiResponse<DailyEquipAvailabilityRow[]>> {
    return this.http.post<ApiResponse<DailyEquipAvailabilityRow[]>>(
      `${this.apiUrl}/queryCPM11030_DailyEquipAvailability`,
      body
    );
  }

  /** 每日設備可出借量：新增 /insertCPM11030_DailyEquipAvailability（一次一筆） */
  insertCPM11030_DailyEquipAvailability(
    body: InsertDailyEquipAvailabilityRequest
  ): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertCPM11030_DailyEquipAvailability`, body);
  }

  /** 新增：/insertCPM11030 */
  insertCPM11030(body: InsertCPM11030Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/insertCPM11030`, body);
  }

  /** 更新：/updateCPM11030 */
  updateCPM11030(body: UpdateCPM11030Request): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/updateCPM11030`, body);
  }

  // ================= 匯出 =================

  /** 匯出 PDF（不分頁） */
  exportCPM11030PDF(body: QueryCPM11030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportCPM11030_PDF`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /** 匯出 Excel（不分頁） */
  exportCPM11030Excel(body: QueryCPM11030Request): Observable<HttpResponse<Blob>> {
    const url = `${this.apiUrl}/exportCPM11030_Excel`;
    const payload = this.stripPaging(body);
    return this.http.post(url, payload, {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  /**
   * 工具：移除分頁相關欄位（匯出不需要）
   * - 同時移除大小寫鍵：pageSize/pageIndex/orderBy/offset 與 PageSize/PageIndex/OrderBy/Offset
   * - 保留 SortBy
   */
  private stripPaging<T extends Record<string, any>>(input: T): Omit<
    T,
    | 'PageSize'
    | 'PageIndex'
    | 'OrderBy'
    | 'Offset'
    | 'pageSize'
    | 'pageIndex'
    | 'orderBy'
    | 'offset'
  > {
    if (!input) return input as any;
    const { PageSize, PageIndex, OrderBy, Offset, pageSize, pageIndex, orderBy, offset, ...rest } = input as any;
    return rest as any;
  }

  /** ✅ 服務台位置編號：/queryCSS1001_DropDownList */
  queryCSS1001_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryCSS1001_DropDownList`, body ?? {});
  }

  /** ✅ 證件類型：/queryCPM11030_SYS1000_DropDownList */
  queryCPM11030_SYS1000_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryCPM11030_SYS1000_DropDownList`, body ?? {});
  }

  /** ✅ 設備名稱：/queryCSS2001_DropDownList */
  queryCSS2001_DropDownList(body?: any): Observable<DropDownListResponse> {
    return this.http.post<DropDownListResponse>(`${this.DLapiUrl}/queryCSS2001_DropDownList`, body ?? {});
  }

  public getUsrOptions(): void {
    this.usrLoading.set(!0);
    this.fav.getFavorites().pipe(
      take(1),
      tap(res => this.logger.debug('getUsrOptions:', [res])),
      tap(res => {
        const data = res.Data as UserFavorite[];
        const set = new Set<string>();
        // 去重
        const dedup = (options: Option[]) => options.filter(option => {
          if (set.has(option.value)) return !1;
          set.add(option.value);
          return !0;
        });
        this.usrOptions.set(dedup(data.map(item => ({ value: item.USER_No, label: item.CRT_USR_Name } as Option))));
        this.crtUsrOptions.set(dedup(data.map(item => ({ value: item.CRT_USR_No, label: item.CRT_USR_Name } as Option)) ?? []));
        this.updUsrOptions.set(dedup(data.map(item => ({ value: item.UPD_USR_No, label: item.UPD_USR_Name } as Option)) ?? []));
      }),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();

    // 保留原本的 API
    // this.dropdownApi.queryTblUserOrgid().pipe(
    //   take(1),
    //   tap(res => this.usrOptions.set(res?.map(item => ({ value: item['Org_ID'], label: item['Org_Name'] } as Option)) ?? [])),
    //   finalize(() => this.logger.debug('查詢TblUserOrgidOptions結果:', [this.usrOptions()])),
    // ).subscribe();
  }
}

interface UserFavorite {
  CRT_Date: string;
  CRT_USR_Name: string;
  CRT_USR_No: string;
  FVT_SeqNo: number;
  ID: number;
  PROG_No: string;
  UPD_Date: string | null;
  UPD_USR_Name: string | null;
  UPD_USR_No: string | null;
  USER_No: string;
}

export { ApiResponse };

