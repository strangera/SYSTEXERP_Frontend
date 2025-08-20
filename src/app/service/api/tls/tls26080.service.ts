import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { CampaignData, TLS26080Data, TLS26080Detail, TLS26080Query, TLS2608InsertPayload } from '@pages/tls/tls26080/tls26080.model';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ConfirmationService } from 'primeng/api';
import { catchError, EMPTY, finalize, map, Subject, take, takeUntil, tap } from 'rxjs';
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
  public TLS26080Data = signal<TLS26080Data[]>([]);
  public TLS26080Detail = signal<TLS26080Detail[]>([]);
  public campaignData = signal<CampaignData[]>([]);

  // 讀取狀態
  public tableLoading = !1;
  public approvalStatusLoading = !1;
  public campaignLoading = !1;
  public capItemsLoading = !1;
  public fileUploadLoading = !1;

  private readonly fileUploadCancel$ = new Subject<void>();

  // 下拉選單資料
  public departmentItems = signal<DropdownOption[]>([]);
  public capItems = signal<DropdownOption[]>([]);
  public podTypeItems = signal<DropdownOption[]>([
    { No: '1', Name: '預售' },
    { No: '2', Name: '滿千送百' },
    { No: '8', Name: '期間開放折扣' },
  ]);
  public podStatusItems = signal<DropdownOption[]>([
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

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private messageService: NotificationService,
    private confirmationService: ConfirmationService,
  ) { }

  public loadAPS1003(cap_typeList: string[]): void {
    if (this.capItemsLoading) return void (this.capItemsLoading = !1);
    this.capItemsLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/queryAPS1003_DropDownList`, { cap_typeList }).pipe(
      take(1),
      tap(response => this.capItems.set(response.Data || [])),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.capItemsLoading = !1;
        console.log('APS1003查詢結果:', [this.capItems()]);
      })
    ).subscribe();
  }

  /** 查詢資料 */
  public loadTLS26080(query: TLS26080Query): void {
    if (this.tableLoading) return void (this.tableLoading = !1);
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080`, query).pipe(
      take(1),
      tap(response => this.TLS26080Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢結果:', [this.TLS26080Data()]);
      })
    ).subscribe();
  };

  /** 查詢環友資料 */
  public loadCampaignData(query: any = {}): void {
    if (this.campaignLoading) return void (this.campaignLoading = !1);
    this.campaignLoading = !0;
    this.http.post<BaseQueryResponse<CampaignData>>(`${apiUrl}/TLS0000/TLS2000/queryCampaign`, query).pipe(
      take(1),
      tap(response => this.campaignData.set(response.Data)),
      catchError(error => { this.errorHandler.handleError(error); return EMPTY; }),
      finalize(() => console.log('查詢環友資料:', [this.campaignData()]))
    ).subscribe();
  };

  /** 專櫃活動 */
  public loadTLS26080Detail(query: string): void {
    if (this.tableLoading) return void (this.tableLoading = !1);
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<TLS26080Detail>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080_Detail`, { pod_no: query }).pipe(
      take(1),
      tap(response => this.TLS26080Detail.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('專櫃活動細節查詢結果:', [this.TLS26080Detail()]);
      })
    ).subscribe();
  };

  public insertTLS26080(data: TLS2608InsertPayload): void {
    this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26080`, data).pipe(
      take(1),
      tap(response => {
        console.log(`insertTLS26080:`, [response]);
        this.messageService.successBubble('新增成功');
      }),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => console.log('新增專櫃活動結果:', [data]))
    ).subscribe();
  }

  /** 核准或反核准專櫃活動 */
  public loadApproval(data: TLS26080Data): void {
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
              console.log('核准結果:', [this.approvalCheck(data).confirm]);
            })
          ).subscribe();
        this.messageService.successBubble(`${this.approvalCheck(data).confirm}成功`);
      },
      reject: () => this.messageService.infoBubble(`${this.approvalCheck(data).confirm}已取消`)
    });
  }

  public uploadFile(file: FormData): void {
    this.fileUploadLoading = !0;
    this.fileUploadCancel$.next();
    this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/uploadTLS26080`, file).pipe(
      take(1),
      takeUntil(this.fileUploadCancel$),
      map(response => {
        console.log(`uploadFile:`, [response]);
        this.messageService.successBubble('上傳成功');
        return response.Data as unknown as { 'queryTLS26080_DetailResponses': any[]; };
      }),
      tap(response =>
        this.TLS26080Detail.set(response.queryTLS26080_DetailResponses || [])
      ),
      catchError(this.errorHandler.handleError),
      finalize(() => {
        console.log('上傳檔案結果:', [file]);
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.fileUploadCancel$.next();
  }
}
