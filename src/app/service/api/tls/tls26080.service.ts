import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { ECRTableData, mockQueryTLS26010, TLS26010, TLS26010Data, TLS26010Payload, TLS26010Query, TLTTALENTData } from '@pages/tls/tls26010/tls26010.model';
import { mockQueryTLS26080, TLS26080Data, TLS26080Query } from '@pages/tls/tls26080/tls26080.model';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ApprovalStatus } from '@shared/models';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { catchError, EMPTY, finalize, Observable, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const mock = !0;
const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS26080Service {

  public approvalData = signal<ApprovalStatus>(ApprovalStatus.未核准);

  private TLS26080Data = signal<TLS26080Data[]>([]);

  public TLS26080List = signal<TLS26080Data[]>([]);

  private TableLoading = !1;
  private approvalStatusLoading = !1;

  public approvalStatus(value: ApprovalStatus): string {
    switch (value) {
      case ApprovalStatus.未核准: return '未核准';
      case ApprovalStatus.已核准: return '已核准';
      case ApprovalStatus.刪除: return '刪除';
      default: return value;
    }
  }

  private fetchTLS26080List = effect(() => {
    const res = new Map<string, TLS26080Data>();
    const tlsData = this.TLS26080Data();
    for (const item of tlsData) {
      if (res.has(item.pod_no)) continue;
      res.set(item.pod_no, item);
    }
    this.TLS26080List.set(Array.from(res.values()));
  }, { allowSignalWrites: true });

  public readonly departmentItems = signal<DropdownOption[]>([
    { No: 'DEPT001', Name: '營運部' },
    { No: 'DEPT002', Name: '行銷部' },
    { No: 'DEPT003', Name: '財務部' },
    { No: 'DEPT004', Name: '人事部' },
    { No: 'DEPT005', Name: '資訊部' },
  ]);
  public readonly capItems = signal<DropdownOption[]>([
    { No: '1', Name: '預售' },
    { No: '2', Name: '滿千送百發行' },
    { No: '3', Name: '滿千送百兌回' },
    { No: '4', Name: '會員卡集點-銷售 (不用)' },
    { No: '5', Name: '會員卡集點-點數 (不用)' },
    { No: '6', Name: '全館消費滿額集點-銷售' },
    { No: '7', Name: '全館消費滿額集點-點數' },
    { No: '8', Name: '期間開放折扣' },
  ]);
  public readonly podStatusItems = signal<DropdownOption[]>([
    { No: ApprovalStatus.未核准, Name: '未核准' },
    { No: ApprovalStatus.已核准, Name: '已核准' },
    { No: ApprovalStatus.刪除, Name: '刪除' },
  ]);

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private messageService: NotificationService,
  ) { }

  loadTLS26080(query: TLS26080Query): void {
    if (this.TableLoading) return void (this.TableLoading = !1);
    this.TableLoading = !0;

    const api = mock
      ? of(mockQueryTLS26080)
      : this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/queryTLS26080`, query);

    api.pipe(
      take(1),
      tap(response => this.TLS26080Data.set(response.Data.map(item => {
        const match = item.org_id?.match(/^(.+)\(([^)]+)\)$/);
        const [org_name, org_id] = match ? [match[1], match[2]] : ['', ''];
        return {
          ...item,
          org_id,
          org_name,
          pod_name: item.pod_desc,
          cap_no: item.pod_type,
          cap_name: item.cap_item,
        };
      }))),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TableLoading = !1;
        console.log('查詢結果:', this.TLS26080Data());
      })
    ).subscribe();
  }

  /** 核准或反核准預購活動 */
  loadApproval(data: TLS26010Data): void {
    if (this.approvalStatusLoading) return void (this.approvalStatusLoading = !1);
    this.approvalStatusLoading = !0;
    const id = data.pod_no;

    this.http.post<BaseQueryResponse<{ Status: ApprovalStatus; }>>(
      `${apiUrl}${data.pod_status === ApprovalStatus.未核准 ? '/approvalTLS26010' : '/disapprovalTLS26010'}`,
      { id }).pipe(
        take(1),
        tap(() => this.approvalData.set(ApprovalStatus.未核准)),
        tap(response =>
          this.approvalData.set(response['Status'] as ApprovalStatus || response.Data[0].Status)),
        catchError(error => this.errorHandler.handleError(error)),
        finalize(() => {
          this.approvalStatusLoading = !1;
          console.log('核准結果:', this.approvalData());
        })
      ).subscribe();
  }

  ngOnDestroy(): void {
    // 服務銷毀時清除所有資料
    this.clearData();
  }

  clearData(): void {
    // 清除 signal 資料
    this.TLS26080Data.set([]);
    this.TLS26080List.set([]);
    this.approvalData.set(ApprovalStatus.未核准);
    this.fetchTLS26080List.destroy();
  }
}
