import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { CampaignData, TLS26080Data, TLS26080Detail, TLS26080Query, TLS26080UploadResponse, TLS26080UploadResult, TLS2608InsertPayload } from '@pages/tls/tls26080/tls26080.model';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { catchError, EMPTY, finalize, Observable, take, tap } from 'rxjs';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';
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

  public readonly totalRecords = signal<number>(0);
  public readonly detailTotalRecords = signal<number>(0);

  // 讀取狀態
  public readonly dataLoading = signal<boolean>(!1);
  public readonly approvalStatusLoading = signal<boolean>(!1);
  public readonly campaignLoading = signal<boolean>(!1);
  public readonly capItemsLoading = signal<boolean>(!1);
  public readonly fileUploadLoading = signal<boolean>(!1);
  public readonly exampleDownLoading = signal<boolean>(!1);


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
  ) { }

  public loadAPS1003(cap_typeList: string[]): void {
    if (this.capItemsLoading()) return void (this.capItemsLoading.set(!1));
    this.capItemsLoading.set(!0);
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/queryAPS1003_DropDownList`, { cap_typeList }).pipe(
      take(1),
      tap(response => this.capItems.set(response.Data || [])),
      finalize(() => {
        this.capItemsLoading.set(!1);
        console.log('APS1003查詢結果:', [this.capItems()]);
      })
    ).subscribe();
  }

  /** 查詢資料 */
  public loadTLS26080(query: TLS26080Query): void {
    if (this.dataLoading()) return void (this.dataLoading.set(!1));
    this.dataLoading.set(!0);
    this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080`, query).pipe(
      take(1),
      tap(response => this.totalRecords.set(response.TotalCount || 0)),
      tap(response => this.TLS26080Data.set(response.Data)),
      finalize(() => {
        this.dataLoading.set(!1);
        console.log('查詢結果:', [this.TLS26080Data()]);
      })
    ).subscribe();
  };

  /** 查詢環友資料 */
  public loadCampaignData(query: any = {}): void {
    if (this.campaignLoading()) return void (this.campaignLoading.set(!1));
    this.campaignLoading.set(!0);
    this.http.post<BaseQueryResponse<CampaignData>>(`${apiUrl}/TLS0000/TLS2000/queryCampaign`, query).pipe(
      take(1),
      tap(response => this.campaignData.set(response.Data)),
      catchError(error => { this.errorHandler.handleError(error); return EMPTY; }),
      finalize(() => console.log('查詢環友資料:', [this.campaignData()]))
    ).subscribe();
  };

  /** 專櫃活動 */
  public loadTLS26080Detail(query: string): void {
    if (this.dataLoading()) return void (this.dataLoading.set(!1));
    this.dataLoading.set(!0);
    this.http.post<BaseQueryResponse<TLS26080Detail>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080_Detail`, { pod_no: query }).pipe(
      take(1),
      tap(response => this.detailTotalRecords.set(response.TotalCount || 0)),
      tap(response => this.TLS26080Detail.set(response.Data)),
      finalize(() => {
        this.dataLoading.set(!1);
        console.log('專櫃活動細節查詢結果:', [this.TLS26080Detail()]);
      })
    ).subscribe();
  };

  public insertTLS26080(data: TLS2608InsertPayload): Observable<BaseQueryResponse<any>> {
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26080`, data).pipe(
      take(1),
    );
  }

  /** 核准或反核准專櫃活動 */
  public loadApproval(data: TLS26080Data): void {
    if (this.approvalStatusLoading()) return void (this.approvalStatusLoading.set(!1));
    this.approvalStatusLoading.set(!0);
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
        finalize(() => {
          this.approvalStatusLoading.set(!1);
          console.log('核准結果:', [this.approvalCheck(data).confirm]);
        })
      ).subscribe();
    this.messageService.successBubble(`${this.approvalCheck(data).confirm}成功`);
  }

  public uploadFile(file: FormData): void {
    this.fileUploadLoading.set(!0);
    this.http.post<TLS26080UploadResponse>(`${apiUrl}/TLS0000/TLS2000/uploadTLS26080`, file).pipe(
      take(1),
      tap(response => {
        const data = response.Data;
        console.log(`uploadFile:`, [response]);
        if (data.Success) {
          this.TLS26080Detail.set(
            data.queryTLS26080_DetailResponses.map(value => (<TLS26080Detail>{
              id: value.id,
              talent_id: value.talent_id,
              tlt_id: value.tlt_id,
              tlt_id_desc: value.tlt_id_desc,
              tlt_no: value.tlt_no,
              tlt_name: value.tlt_name,
              calc_date_type: value.calc_date_type,
              cap_item_D16: value.cap_item_D16,
              tpy_rate_D16: Number(value.tpy_rate_D16.replace('%', '')).toFixed(2),
              cap_item_D17: value.cap_item_D17,
              tpy_rate_D17: Number(value.tpy_rate_D17.replace('%', '')).toFixed(2),
              pod_status: value.pod_status,
            }))
          );
          !data.ErrorCount
            ? this.messageService.successBubble('上傳成功')
            : this.messageService.errorBox(`上傳失敗: ${data.ErrorCount} 筆資料錯誤`);
        } else {
          this.messageService.errorBox(`上傳失敗`);
        }
        this.dealErrorFilePath(data);
      }),
      finalize(() => {
        this.fileUploadLoading.set(!1);
        console.log('上傳檔案結果:', [file]);
      })
    ).subscribe();
  }

  public deleteTLS26080(idList: string[]): Observable<BaseQueryResponse<unknown>> {
    this.dataLoading.set(!0);
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/TLS0000/TLS2000/deleteTLS26080`, { idList }).pipe(
      take(1),
      finalize(() => this.dataLoading.set(!1))
    );
  }

  private dealErrorFilePath(data: TLS26080UploadResult): void {
    const path = data.ErrorFilePath;
    console.log(`dealErrorFilePath:`, [path, this.TLS26080Detail()]);
    if (!path || data.Success || !data.ErrorCount) return;
    window.open(`${apiUrl}${path}`, '_blank', 'noopener noreferrer');
    // this.http.get(`${apiUrl}${path}`, { responseType: 'blob' }).pipe(
    //   take(1),
    //   tap(response => {
    //     // 建立下載連結
    //     const url = window.URL.createObjectURL(response);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = path.split('/').pop() || 'error_file.xlsx';
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //     window.URL.revokeObjectURL(url);
    //   }),
    //   catchError(error => this.errorHandler.handleError(error)),
    //   finalize(() => console.log('錯誤檔案下載'))
    // ).subscribe();
  }

  public downloadXLSXExample(): void {
    this.exampleDownLoading.set(!0);
    this.http.get(`${apiUrl}/TLS0000/TLS2000/downloadTLS26080Template`, { responseType: 'blob' }).pipe(
      take(1),
      tap(response => {
        // 建立下載連結
        const url = window.URL.createObjectURL(response);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TLS26080_範例檔案.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }),
      finalize(() => {
        this.exampleDownLoading.set(!1);
        console.log('範例下載');
      })
    ).subscribe();
  }

  public keyInTLS26080(data: TLS26080Detail): void {
    this.http.post<TLS26080UploadResponse>(`${apiUrl}/TLS0000/TLS2000/keyInTLS26080`, {
      queryTLS26080_DetailResponses: this.TLS26080Detail(),
      keyiInTLS26080: data,
    }).pipe(
      take(1),
      tap(response => {
        const d = response.Data;
        if (!d.Success) {
          this.dealErrorFilePath(d);
          this.TLS26080Detail.update(v => v.filter(i => i.id !== data.id)); // 更新參照
          console.log(`keyInTLS26080 fail:`, [response, this.TLS26080Detail()]);
          this.messageService.errorBox(response.Message || '鍵入失敗');
        } else {
          this.TLS26080Detail.update(val => [data, ...val.filter(i => i.id !== data.id)]);
          console.log(`keyInTLS26080 success:`, [response, this.TLS26080Detail()]);
        }
      }),
      finalize(() => {
        console.log(`單筆鍵入檢查:`, [data]);
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
  }
}
