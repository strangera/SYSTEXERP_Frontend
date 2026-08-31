import { formatDate } from '@angular/common';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { CampaignData, ExportTLS26080PDFRequest, QueryCampaignRequest, QueryTLS26080TLTTALENT_D16_D17Request, TLS26080Data, TLS26080DetailResult, TLS26080DetailTable, TLS26080InsertPayload, TLS26080Query, TLS26080TLTTALENT_D16_D17Row, TLS26080UpdatePayload, TLS26080UploadResponse, TLS26080UploadResult } from '@pages/tls/tls26080/tls26080.model';
import { IDropdownItem, Option, TalentOpenFlagItem, TalentOpenFlagQuery } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
export const enum ApprovalStatus {
  未核准 = '0',
  已核准 = '1',
  刪除 = '9',
}

const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS26080Service {
  private readonly d = (() => {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
  })();
  public readonly dateS: Date = this.d.start;
  public readonly dateE: Date = this.d.end;

  // 儲存資料（專櫃選項含 talent_id，供 saveDialog / executeFieldChange 使用）
  public readonly tltTalentOptions = signal<(Option & { talent_id: number })[]>([]);
  public readonly tltTalentChargeOptions = signal<Option[]>([]);

  public readonly tltTalentMap = computed(() => {
    return new Map<string, Option & { talent_id: number }>(this.tltTalentOptions().map(item => [item.value, item]));
  });
  public readonly tltTalentChargeMap = computed(() => {
    return new Map<string, Option>(this.tltTalentChargeOptions().map(item => [item.value, item]));
  });

  // 共享資料讀取狀態
  public readonly capItemsLoading = signal<boolean>(false);
  public readonly tltTalentOptionsLoading = signal<boolean>(false);
  public readonly tltTalentChargeOptionsLoading = signal<boolean>(false);

  // 下拉選單資料
  public departmentItems = signal<Option[]>([]);
  public capItems = signal<Option[]>([]);
  public podTypeItems = [
    { value: '1', label: '預售' },
    { value: '2', label: '滿千送百' },
    { value: '3', label: '滿千送百兌回' },
    { value: '8', label: '期間開放折扣' },
  ];
  public podStatusItems = [
    { value: ApprovalStatus.未核准, label: '未核准' },
    { value: ApprovalStatus.已核准, label: '已核准' },
    { value: ApprovalStatus.刪除, label: '刪除' },
  ];

  // 核准狀態顯示
  public approvalStatus(value: string): string {
    switch (value) {
      case ApprovalStatus.未核准: return '未核准';
      case ApprovalStatus.已核准: return '已核准';
      case ApprovalStatus.刪除: return '刪除';
      default: return value;
    }
  }

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdown: DropdownApiService,
  ) { }

  public loadAPS1003(cap_typeList: string[]): void {
    if (this.capItemsLoading()) {
      this.capItemsLoading.set(false);
      return;
    }
    this.capItemsLoading.set(true);
    this.http.post<ApiResponse<IDropdownItem[]>>(`${apiUrl}/queryAPS1003_DropDownList`, { cap_typeList }).pipe(
      take(1),
      tap(res => {
        this.capItems.set(res.Data?.map(item => ({ value: item.No, label: item.Name })) || []);
        this.logger.debug(`APS1003查詢結果:`, [res]);
      }),
      finalize(() => this.capItemsLoading.set(false))
    ).subscribe();
  }

  public queryTltTalentCharge(talent_id: number): Observable<Option[]> {
    this.tltTalentChargeOptionsLoading.set(true);
    return this.dropdown.queryTltTalentCharge({ talent_id }).pipe(
      take(1),
      tap(res => this.logger.debug(`queryTltTalentCharge:`, [res])),
      map(res => res?.length && res.map(item => ({
        ...item,
        label: `${item.tlt_id} - ${item.tlt_id_desc}`,
        value: item.tlt_id,
      }) as unknown as Option) || []),
      tap(res => this.tltTalentChargeOptions.set(res)),
      finalize(() => this.tltTalentChargeOptionsLoading.set(false)),
    );
  }

  /** 查詢資料 */
  public loadTLS26080(query: TLS26080Query): Observable<ApiResponse<TLS26080Data[]>> {
    return this.http.post<ApiResponse<TLS26080Data[]>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080`, query).pipe(
      take(1),
      tap(res => this.logger.debug(`TLS26080查詢結果:`, [res]))
    );
  };

  public insertTLS26080(data: TLS26080InsertPayload): Observable<ApiResponse<any[]>> {
    return this.http.post<ApiResponse<any[]>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26080`, data).pipe(
      take(1),
      tap(res => this.logger.debug(`TLS26080新增結果:`, [res]))
    );
  };

  public updateTLS26080(query: TLS26080UpdatePayload): Observable<ApiResponse<TLS26080Data[]>> {
    return this.http.post<ApiResponse<TLS26080Data[]>>(`${apiUrl}/TLS0000/TLS2000/updateTLS26080`, query).pipe(
      take(1),
      tap(res => this.logger.debug(`TLS26080更新結果:`, [res]))
    );
  };

  public deleteTLS26080(podNoList: string[]): Observable<ApiResponse<unknown[]>> {
    return this.http.post<ApiResponse<unknown[]>>(`${apiUrl}/TLS0000/TLS2000/deleteTLS26080`, { podNoList }).pipe(
      take(1)
    );
  }

  /** 更新活動審核狀態（連同底下明細一併更新，pod_status: '0'=未核准/反審核, '1'=已核准/審核） */
  public updateTLS26080Status(podNoList: string[], pod_status: ApprovalStatus): Observable<ApiResponse<unknown[]>> {
    return this.http.post<ApiResponse<unknown[]>>(`${apiUrl}/TLS0000/TLS2000/updateTLS26080Status`, { podNoList, pod_status }).pipe(
      take(1)
    );
  }

  /** 匯出活動單 PDF（查詢頁管理欄「列印」） */
  public exportTLS26080PDF(body: ExportTLS26080PDFRequest): Observable<HttpResponse<Blob>> {
    return this.http.post(`${apiUrl}/TLS0000/TLS2000/exportTLS26080PDF`, body, {
      observe: 'response',
      responseType: 'blob',
    }).pipe(
      take(1),
      tap(res => this.logger.debug(`exportTLS26080PDF:`, [res.status, res.body?.size])),
    );
  }

  /** 查詢環友資料 */
  public loadCampaignData(query: QueryCampaignRequest = {}): Observable<ApiResponse<CampaignData[]>> {
    return this.http.post<ApiResponse<CampaignData[]>>(`${apiUrl}/TLS0000/TLS2000/queryCampaign`, query).pipe(
      take(1),
      tap(res => this.logger.debug(`環友資料查詢結果:`, [res]))
    );
  };

  /** 專櫃活動 */
  public loadTLS26080Detail(query: string): Observable<ApiResponse<TLS26080DetailTable[]>> {
    return this.http.post<ApiResponse<TLS26080DetailTable[]>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080_Detail`, { pod_no: query, pageSize: 1 }).pipe(
      take(1),
      tap(res => this.logger.debug(`專櫃活動細節查詢結果:`, [res]))
    );
  }

  /** 查詢專櫃 D16/D17 費用比率 (cap_item、tpy_rate) */
  public queryTLS26080TLTTALENT_D16_D17(req: QueryTLS26080TLTTALENT_D16_D17Request): Observable<ApiResponse<TLS26080TLTTALENT_D16_D17Row>> {
    return this.http.post<ApiResponse<TLS26080TLTTALENT_D16_D17Row>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080TLTTALENT_D16_D17`, req).pipe(
      take(1),
      tap(res => this.logger.debug(`queryTLS26080TLTTALENT_D16_D17:`, [res]))
    );
  }

  public uploadFile(file: FormData): Observable<TLS26080UploadResult> {
    return this.http.post<TLS26080UploadResponse>(`${apiUrl}/TLS0000/TLS2000/uploadTLS26080`, file).pipe(
      take(1),
      map(res => {
        if (res.Status !== '0000') return Object.create(null);
        const { queryTLS26080_DetailResponses, ...rest } = res.Data;
        return {
          ...rest,
          queryTLS26080_DetailResponses: queryTLS26080_DetailResponses.map(v => ({
            ...v,
            tpy_rate_D16: Number(v.tpy_rate_D16.replace('%', '')).toString(),
            tpy_rate_D17: Number(v.tpy_rate_D17.replace('%', '')).toString(),
          } as TLS26080DetailResult)),
        };
      })
    );
  }

  public dealErrorFilePath(data: TLS26080UploadResult): void {
    const path = data.ErrorFilePath;
    if (path && !data.Success) globalThis.open(`${apiUrl}${path}`, '_blank', 'noopener noreferrer');
  }

  /**
   * `GET downloadTLS26080Template`：query `HaveData` 為 true 時下載含範例資料之檔案，false 為空白範本。
   */
  public downloadXLSXExample(
    haveData: boolean,
    queryDate?: { tlt_bdate?: Date | null; tlt_edate?: Date | null }
  ): Observable<Blob> {
    const bdate = queryDate?.tlt_bdate ?? this.dateS;
    const edate = queryDate?.tlt_edate ?? this.dateE;
    let params = new HttpParams();
    params = params.set('tlt_bdate', this.formatQueryDate(bdate) || '');
    params = params.set('tlt_edate', this.formatQueryDate(edate) || '');
    params = params.set('HaveData', haveData ? 'true' : 'false');

    return this.http.get(`${apiUrl}/TLS0000/TLS2000/downloadTLS26080Template`, {
      params,
      responseType: 'blob'
    }).pipe(
      take(1),
      tap(res => {
        const url = globalThis.URL.createObjectURL(res);
        const link = document.createElement('a');
        link.href = url;
        link.download = haveData ? 'TLS26080_範例檔案.xlsx' : 'TLS26080_空白範本.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        globalThis.URL.revokeObjectURL(url);
        this.logger.debug(haveData ? `範例下載` : `空白範本下載`);
      })
    );
  }

  private formatQueryDate(value?: Date | string | null): string | undefined {
    if (!value) return undefined;
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return undefined;
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  /** 專供 Dialog 查詢專櫃用——不更新 tltTalentOptions，不影響主表格下拉 */
  public searchTltTalentForDialog(query: { ven_no?: string; tlt_bdate?: Date | null; tlt_edate?: Date | null }): Observable<(Option & { talent_id: number })[]> {
    const payload: TalentOpenFlagQuery = {
      VEN_No: query.ven_no ?? '',
      ...(query.tlt_bdate != null && { tlt_bdate: this.formatQueryDate(query.tlt_bdate) }),
      ...(query.tlt_edate != null && { tlt_edate: this.formatQueryDate(query.tlt_edate) }),
    };
    return this.dropdown.queryTltTalentOpenFlag(payload).pipe(
      take(1),
      map(res => res?.map((item: TalentOpenFlagItem) => {
        const raw = item as unknown as Record<string, unknown>;
        const talentId = typeof item.talent_id === 'number' ? item.talent_id : Number(raw['Talent_ID']) || 0;
        return { ...item, value: item.No, label: `${item.No} - ${item.Name}`, talent_id: talentId } as Option & { talent_id: number };
      }) ?? [])
    );
  }

  public getTLTTalentOptions(query: { ven_no: string; tlt_bdate?: Date | null; tlt_edate?: Date | null }): Observable<(Option & { talent_id: number })[] | null> {
    this.tltTalentOptionsLoading.set(true);
    const payload: TalentOpenFlagQuery = {
      VEN_No: query.ven_no,
      ...(query.tlt_bdate != null && { tlt_bdate: this.formatQueryDate(query.tlt_bdate) }),
      ...(query.tlt_edate != null && { tlt_edate: this.formatQueryDate(query.tlt_edate) }),
    };

    return this.dropdown.queryTltTalentOpenFlag(payload).pipe(
      take(1),
      map(res => res?.map((item: TalentOpenFlagItem) => {
        const raw = item as unknown as Record<string, unknown>;
        const talentId = typeof item.talent_id === 'number' ? item.talent_id : Number(raw['Talent_ID']) || 0;
        return {
          ...item,
          value: item.No,
          label: `${item.No} - ${item.Name}`,
          talent_id: talentId,
        } as Option & { talent_id: number };
      }) ?? []),
      tap(res => {
        this.tltTalentOptions.set(res ?? []);
        this.logger.debug(`getTLTTalentOptions:`, [payload, res]);
      }),
      finalize(() => this.tltTalentOptionsLoading.set(false))
    );
  }

}
