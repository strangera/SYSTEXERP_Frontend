import { HttpClient } from '@angular/common/http';
import { effect, Injectable, signal } from '@angular/core';
import { CampaignAccountingType, CampaignAccountingTypes, CampaignData, TLS26080Data, TLS26080Query } from '@pages/tls/tls26080/tls26080.model';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ConfirmationService } from 'primeng/api';
import { catchError, EMPTY, finalize, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS26080Service {

  // 儲存資料
  public TLS26080List = signal<TLS26080Data[]>([]);
  public campaignData = signal<CampaignData>({} as CampaignData);
  private TLS26080Data = signal<TLS26080Data[]>([]);

  // 讀取狀態
  private tableLoading = !1;
  private approvalStatusLoading = !1;
  private campaignLoading = !1;

  // 下拉選單資料
  public readonly departmentItems = signal<DropdownOption[]>([]);
  public readonly capItems = signal<DropdownOption[]>(Array.from(CampaignAccountingType.values()));
  public readonly podStatusItems = signal<DropdownOption[]>([
    { No: ApprovalStatus.未核准, Name: '未核准' },
    { No: ApprovalStatus.已核准, Name: '已核准' },
    { No: ApprovalStatus.刪除, Name: '刪除' },
  ]);

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
  private approvalCheck({ pod_status }: TLS26080Data) {
    return pod_status === ApprovalStatus.未核准
      ? { api: `approveTLS26080`, confirm: `核准` }
      : { api: `disapproveTLS26080`, confirm: `反核准` };
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

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private messageService: NotificationService,
    private confirmationService: ConfirmationService,
  ) { }

  /** 查詢資料 */
  loadTLS26080(query: TLS26080Query = {}): void {
    if (this.tableLoading) return void (this.tableLoading = !1);
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080`, query).pipe(
      take(1),
      tap(response => this.TLS26080Data.set(response.Data.map(item => ({
        ...item,
        pod_type: CampaignAccountingTypes[Number(item.pod_type)] || item.pod_type,
      })))),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢結果:', this.TLS26080Data());
      })
    ).subscribe();
  }

  /** 查詢環友資料 */
  loadCampaignData(query: any): void {
    if (this.campaignLoading) return void (this.campaignLoading = !1);
    this.campaignLoading = !0;
    this.http.post<BaseQueryResponse<CampaignData>>(`${apiUrl}/queryCampaignData`, query).pipe(
      take(1),
      tap(response => this.campaignData.set(response.Data[0] || {} as CampaignData)),
      catchError(error => { this.errorHandler.handleError(error); return EMPTY; }),
      finalize(() => { console.log('查詢環友資料:', this.campaignData()); })
    ).subscribe();
  }

  /** 核准或反核准預購活動 */
  loadApproval(data: TLS26080Data): void {
    if (this.approvalStatusLoading) return void (this.approvalStatusLoading = !1);
    this.approvalStatusLoading = !0;
    this.confirmationService.confirm({
      message: `是否確定${this.approvalCheck(data).confirm}選取項目？`,
      accept: () => {
        const id = data.id;
        this.http.post<BaseQueryResponse<{ Status: ApprovalStatus; }>>(
          `${apiUrl}/TLS0000/TLS2000/${this.approvalCheck(data).api}`, { id }).pipe(
            take(1),
            tap(() => this.TLS26080Data.update(currentData => {
              const index = currentData.findIndex(item => item.id === id);
              if (index !== -1) currentData[index].pod_status = this.approvalCheck(data).confirm === '核准'
                ? ApprovalStatus.已核准
                : ApprovalStatus.未核准;
              return currentData;
            })),
            catchError(error => this.errorHandler.handleError(error)),
            finalize(() => {
              this.approvalStatusLoading = !1;
              console.log('核准結果:',);
            })
          ).subscribe();
        this.messageService.successBubble(`${this.approvalCheck(data).confirm}成功`);
      },
      reject: () => this.messageService.infoBubble(`${this.approvalCheck(data).confirm}已取消`)
    });
  }

  ngOnDestroy(): void {
    this.fetchTLS26080List.destroy();
  }
}
