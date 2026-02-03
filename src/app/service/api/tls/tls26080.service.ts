import { formatDate } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { CampaignData, TLS26080Data, TLS26080DetailResult, TLS26080DetailTable, TLS26080EditTable, TLS26080InsertPayload, TLS26080KeyInTable, TLS26080Query, TLS26080UpdatePayload, TLS26080UploadResponse, TLS26080UploadResult } from '@pages/tls/tls26080/tls26080.model';
import { Option, TalentQuery } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { filter, finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS26080Service {
  private readonly d = (() => {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
  })();
  public readonly dateS: Date = this.d.start;
  public readonly dateE: Date = this.d.end;

  // 儲存資料
  public readonly tltTalentOptions = signal<Option[]>([]);
  public readonly tltTalentChargeOptions = signal<Option[]>([]);

  public readonly tltTalentMap = computed(() => {
    return new Map<string, Option>(this.tltTalentOptions().map(item => [item.value, item]));
  });
  public readonly tltTalentChargeMap = computed(() => {
    return new Map<string, Option>(this.tltTalentChargeOptions().map(item => [item.value, item]));
  });

  // 共享資料讀取狀態
  public readonly capItemsLoading = signal<boolean>(!1);
  public readonly tltTalentOptionsLoading = signal<boolean>(!1);
  public readonly tltTalentChargeOptionsLoading = signal<boolean>(!1);

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

  // 核准狀態檢查
  private approvalCheck({ pod_status }: TLS26080EditTable) {
    return pod_status === ApprovalStatus.未核准 ? 'approveTLS26080' : 'disapproveTLS26080';
  }

  constructor(
    private readonly http: HttpClient,
    private readonly messageService: NotificationService,
    private readonly logger: NGXLogger,
    private readonly dropdown: DropdownApiService,
  ) { }

  public loadAPS1003(cap_typeList: string[]): void {
    if (this.capItemsLoading()) return void (this.capItemsLoading.set(!1));
    this.capItemsLoading.set(!0);
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/queryAPS1003_DropDownList`, { cap_typeList }).pipe(
      take(1),
      tap(res => {
        this.capItems.set(res.Data?.map(item => ({ value: item.No, label: item.Name })) || []);
        this.logger.debug(`APS1003查詢結果:`, [res]);
      }),
      finalize(() => this.capItemsLoading.set(!1))
    ).subscribe();
  }

  public queryTltTalentCharge(talent_id: number): Observable<Option[]> {
    this.tltTalentChargeOptionsLoading.set(!0);
    return this.dropdown.queryTltTalentCharge({ talent_id }).pipe(
      take(1),
      tap(res => this.logger.debug(`queryTltTalentCharge:`, [res])),
      map(res => res?.length && res.map(item => ({
        ...item,
        label: `${item.tlt_id} - ${item.tlt_id_desc}`,
        value: item.tlt_id,
      }) as unknown as Option) || []),
      tap(res => this.tltTalentChargeOptions.set(res)),
      finalize(() => this.tltTalentChargeOptionsLoading.set(!1)),
    );
  }

  /** 查詢資料 */
  public loadTLS26080(query: TLS26080Query): Observable<BaseQueryResponse<TLS26080Data>> {
    return this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080`, query).pipe(
      take(1),
      tap(res => this.logger.debug(`TLS26080查詢結果:`, [res]))
    );
  };

  public insertTLS26080(data: TLS26080InsertPayload): Observable<BaseQueryResponse<any>> {
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26080`, data).pipe(
      take(1),
      tap(res => this.logger.debug(`TLS26080新增結果:`, [res]))
    );
  };

  public updateTLS26080(query: TLS26080UpdatePayload): Observable<BaseQueryResponse<TLS26080Data>> {
    return this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/TLS0000/TLS2000/updateTLS26080`, query).pipe(
      take(1),
      tap(res => this.logger.debug(`TLS26080更新結果:`, [res]))
    );
  };

  public deleteTLS26080(idList: string[]): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/TLS0000/TLS2000/deleteTLS26080`, { idList }).pipe(
      take(1)
    );
  }


  /** 查詢環友資料 */
  public loadCampaignData(query: any = {}): Observable<BaseQueryResponse<CampaignData>> {
    return this.http.post<BaseQueryResponse<CampaignData>>(`${apiUrl}/TLS0000/TLS2000/queryCampaign`, query).pipe(
      take(1),
      tap(res => this.logger.debug(`環友資料查詢結果:`, [res]))
    );
  };

  /** 專櫃活動 */
  public loadTLS26080Detail(query: string): Observable<BaseQueryResponse<TLS26080DetailTable>> {
    return this.http.post<BaseQueryResponse<TLS26080DetailTable>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080_Detail`, { pod_no: query, pageSize: 1 }).pipe(
      take(1),
      tap(res => this.logger.debug(`專櫃活動細節查詢結果:`, [res]))
    );
  };

  /** 核准或反核准專櫃活動 */
  public loadApproval(data: TLS26080EditTable): Observable<{ newStatus: ApprovalStatus; }> {
    const api = this.approvalCheck(data);
    return this.http.post<BaseQueryResponse<{ Status: ApprovalStatus; }>>(`${apiUrl}/TLS0000/TLS2000/${api}`, { id: data.id }).pipe(
      take(1),
      filter(res => res.Status === '0000'),
      map(() => ({
        newStatus: api === 'approveTLS26080' ? ApprovalStatus.已核准 : ApprovalStatus.未核准
      })),
      tap(() =>
        this.messageService.successBubble(`${api === 'approveTLS26080' ? '核准' : '反核准'}成功`)
      )
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
          queryTLS26080_DetailResponses: queryTLS26080_DetailResponses.map(v => (<TLS26080DetailResult>{
            ...v,
            tpy_rate_D16: Number(v.tpy_rate_D16.replace('%', '')).toFixed(2),
            tpy_rate_D17: Number(v.tpy_rate_D17.replace('%', '')).toFixed(2),
          })),
        };
      })
    );
  }

  public dealErrorFilePath(data: TLS26080UploadResult): void {
    const path = data.ErrorFilePath;
    if (path && !data.Success) window.open(`${apiUrl}${path}`, '_blank', 'noopener noreferrer');
  }

  public downloadXLSXExample(): Observable<Blob> {
    return this.http.get(`${apiUrl}/TLS0000/TLS2000/downloadTLS26080Template`, { responseType: 'blob' }).pipe(
      take(1),
      tap(res => {
        // 建立下載連結
        const url = window.URL.createObjectURL(res);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TLS26080_範例檔案.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.logger.debug(`範例下載`);
      })
    );
  }

  private formatQueryDate(value?: Date | string | null): string | undefined {
    if (!value) return void 0;
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return void 0;
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  public getTLTTalentOptions(query: { tlt_bdate?: string | Date | null; tlt_edate?: string | Date | null; approve_status?: string } = {}): Observable<Option[]> {
    this.tltTalentOptionsLoading.set(!0);
    const tlt_bdate = this.formatQueryDate(query.tlt_bdate);
    const tlt_edate = this.formatQueryDate(query.tlt_edate);
    const payload: TalentQuery = {
      approve_status: query.approve_status ?? '2',
      ...(tlt_bdate ? { tlt_bdate } : {}),
      ...(tlt_edate ? { tlt_edate } : {}),
    };

    return this.dropdown.queryTalent(payload).pipe(
      take(1),
      map(res => res?.map(item => ({
        ...item,
        No: item.tlt_no,
        Name: item.tlt_name,
        value: item.tlt_no,
        label: `${item.tlt_no} - ${item.tlt_name}`,
      })) ?? []),
      tap(res => {
        this.tltTalentOptions.set(res ?? []);
        this.logger.debug(`getTLTTalentOptions:`, [payload, res]);
      }),
      finalize(() => this.tltTalentOptionsLoading.set(!1))
    );
  }

  public keyInTLS26080(data: TLS26080KeyInTable, currentTableData: TLS26080KeyInTable[]): Observable<TLS26080UploadResponse> {
    return this.http.post<TLS26080UploadResponse>(`${apiUrl}/TLS0000/TLS2000/keyInTLS26080`, {
      queryTLS26080_DetailResponses: currentTableData,
      keyiInTLS26080: data,
    }).pipe(
      take(1),
      finalize(() => this.logger.debug(`單筆鍵入檢查:`, [data]))
    );
  }

  public approveApprovalTLS26080(payload: TLS26080EditTable[]): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/TLS0000/TLS2000/approveTLS26080`, { payload }).pipe(
      take(1),
      finalize(() => this.logger.debug(`核准:`, [payload]))
    );
  }

  public revokeApprovalTLS26080(payload: TLS26080EditTable[]): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/TLS0000/TLS2000/revokeApprovalTLS26080`, { payload }).pipe(
      take(1),
      finalize(() => this.logger.debug(`反核准:`, [payload]))
    );
  }
}
