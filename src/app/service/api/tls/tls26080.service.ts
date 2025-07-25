import { HttpClient } from '@angular/common/http';
import { effect, Injectable, signal } from '@angular/core';
import { TLS26010Data } from '@pages/tls/tls26010/tls26010.model';
import { CampainAccountingType, CampainAccountingTypes, mockQueryTLS26080, TLS26080Data, TLS26080Query } from '@pages/tls/tls26080/tls26080.model';
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

  public TLS26080List = signal<TLS26080Data[]>([]);
  public approvalData = signal<ApprovalStatus>(ApprovalStatus.未核准);
  private TLS26080Data = signal<TLS26080Data[]>([]);


  private TableLoading = !1;
  private approvalStatusLoading = !1;

  public approvalStatus(value: string): string {
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

  public readonly departmentItems = signal<DropdownOption[]>([]);
  public readonly capItems = signal<DropdownOption[]>(Array.from(CampainAccountingType.values()));
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
      ? mockQueryTLS26080
      : this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/queryTLS26080`, query);

    api.pipe(
      take(1),
      tap(response => this.TLS26080Data.set(response.Data.map(item => ({
        ...item,
        pod_type: CampainAccountingTypes[Number(item.pod_type)] || item.pod_type,
      })))),
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
