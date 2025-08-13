import { HttpClient } from '@angular/common/http';
import { effect, Injectable, OnDestroy, signal } from '@angular/core';
import { DependentDataQuery, EcrTable, PodRequest, TLS26010Data, TLS26010Detail, TLS26010DetailResponse, TLS26010Query, TltTable } from '@pages/tls/tls26010/tls26010.model';
import { AuthService } from '@service/system/auth.service';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { ConfirmationService } from 'primeng/api';
import { catchError, finalize, Observable, of, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS26010Service implements OnDestroy {
  private readonly d = (() => {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
  })();
  public readonly dateS: Date = this.d.start;
  public readonly dateE: Date = this.d.end;

  public readonly isRowSelectable = (rowData: TLS26010Data) =>
    (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  // 儲存資料
  public readonly TLS26010Data = signal<TLS26010Data[]>([]);
  public readonly TLS26010Detail = signal<TLS26010Detail | undefined>(void 0);
  public readonly sys3800Data = signal<DropdownOption[]>([]);
  public readonly sys3900Data = signal<DropdownOption[]>([]);
  public readonly sys3A00Data = signal<DropdownOption[]>([]);
  public readonly ecrData = signal<EcrTable[]>([]);
  public readonly tltData = signal<TltTable[]>([]);

  // 讀取狀態
  public sys3800Loading = !1;
  public sys3900Loading = !1;
  public sys3A00Loading = !1;
  public ecrLoading = !1;
  public tltLoading = !1;
  public tableLoading = !1;
  public approvalStatusLoading = !1;

  // Request cancellation subjects
  private readonly sys3800Cancel$ = new Subject<void>();
  private readonly sys3900Cancel$ = new Subject<void>();
  private readonly sys3A00Cancel$ = new Subject<void>();
  private readonly ecrCancel$ = new Subject<void>();
  private readonly tltCancel$ = new Subject<void>();
  private readonly queryCancel$ = new Subject<void>();
  private readonly detailCancel$ = new Subject<void>();

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
  private approvalCheck({ pod_status }: TLS26010Data) {
    return pod_status === ApprovalStatus.未核准
      ? { api: `approveTLS26010`, confirm: `核准` }
      : { api: `disapproveTLS26010`, confirm: `反核准` };
  }

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private errorHandler: ErrorHandlerService,
    private messageService: NotificationService,
    private confirmationService: ConfirmationService,
  ) { }

  /** 取得館別 */
  public loadSYS3800(): void {
    this.sys3800Cancel$.next();
    this.sys3800Loading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/querySYS3800_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.sys3800Cancel$),
      tap(response => this.sys3800Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3800Loading = !1;
        console.log('館別查詢結果:', this.sys3800Data());
      })
    ).subscribe();
  }

  /** 取得樓層 */
  public loadSYS3900(): void {
    this.sys3900Cancel$.next();
    this.sys3900Loading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/querySYS3900_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.sys3900Cancel$),
      tap(response => this.sys3900Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3900Loading = !1;
        console.log('樓層查詢結果:', this.sys3900Data());
      })
    ).subscribe();
  }

  /** 取得區域代碼 */
  public loadSYS3A00(): void {
    this.sys3A00Cancel$.next();
    this.sys3A00Loading = !0;
    this.http.post<any>(`${apiUrl}/querySYS3A00_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.sys3A00Cancel$),
      tap(response => this.sys3A00Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3A00Loading = !1;
        console.log('區域代碼查詢結果:', this.sys3A00Data());
      })
    ).subscribe();
  }

  /** 取得收銀機號 */
  public loadPreorderECRList(query: DependentDataQuery & { ecr_type: string; }): void {
    this.ecrCancel$.next();
    this.ecrData.set([]);
    this.ecrLoading = !0;
    this.http.post<BaseQueryResponse<EcrTable>>(`${apiUrl}/queryECRDropDownList`, query).pipe(
      take(1),
      takeUntil(this.ecrCancel$),
      tap(response => this.ecrData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.ecrLoading = !1;
        console.log('收銀機號查詢結果:', this.ecrData());
      }),
    ).subscribe();
  }

  /** 取得專櫃編號 */
  public loadTLTTALENT(query: DependentDataQuery): void {
    this.tltCancel$.next();
    this.tltData.set([]);
    this.tltLoading = !0;
    this.http.post<BaseQueryResponse<TltTable>>(`${apiUrl}/queryTalentDropDownList`, query).pipe(
      take(1),
      takeUntil(this.tltCancel$),
      tap(response => this.tltData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tltLoading = !1;
        console.log('專櫃編號查詢結果:', this.tltData());
      })
    ).subscribe();
  }

  /** 查詢預購活動檔期 */
  public loadTLS26010(query: TLS26010Query): void {
    this.queryCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<TLS26010Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26010`, query).pipe(
      take(1),
      takeUntil(this.queryCancel$),
      tap(response => this.TLS26010Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('預購活動檔期查詢結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  /** 查詢預購活動檔期 */
  public loadTLS26010Detail(query: { pod_no: string; }): void {
    this.detailCancel$.next();
    this.tableLoading = !0;
    this.http.post<TLS26010DetailResponse>(`${apiUrl}/TLS0000/TLS2000/queryTLS26010Detail`, query).pipe(
      take(1),
      takeUntil(this.detailCancel$),
      tap(response => this.TLS26010Detail.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('預購活動檔期細節查詢結果:', this.TLS26010Detail());
      })
    ).subscribe();
  }

  /** 新增預購活動 */
  public insertTLS26010(payload: PodRequest): Observable<BaseQueryResponse<any>> {
    if (this.tableLoading) { this.tableLoading = !1; return of(); };
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26010`, payload).pipe(
      take(1),
      tap(() => { }),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('新增結果:', this.TLS26010Data());
      })
    );
  }

  /** 更新預購活動 */
  public updateTLS26010(data: PodRequest): Observable<BaseQueryResponse<any>> {
    if (this.tableLoading) { this.tableLoading = !1; return of(); };
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/updateTLS26010`, data).pipe(
      take(1),
      tap((response) => {
        if (response.Status === '0000') {
          // 更新本地數據
          this.TLS26010Data.update(currentData => {
            const info = data.pod_info;
            const index = currentData.findIndex(item => item.pod_no === info.pod_no);
            console.log(`update data:`, [currentData, info, index]);
            if (index !== -1 && currentData[index]) {
              const updatedData: TLS26010Data = {
                ...currentData[index],
                pod_desc: info.pod_desc,
                pod_sdate: info.pod_sdate,
                pod_edate: info.pod_edate,
                pod_status: currentData[index].pod_status === ApprovalStatus.已核准
                  ? ApprovalStatus.未核准
                  : ApprovalStatus.已核准,
                tlt_nos: data.talent_list.map(t => t.tlt_no),
                ecr_nos: data.ecr_list.map(e => e.ecr_no),
              };
              currentData[index] = updatedData;
            }
            return [...currentData];
          });
          this.messageService.successBubble('更新成功');
        } else {
          this.messageService.errorBubble('更新失敗: ' + response.Message);
        }
      }),
      catchError(error => {
        this.messageService.errorBubble('更新失敗，請稍後再試');
        return this.errorHandler.handleError(error);
      }),
      finalize(() => {
        this.tableLoading = !1;
        console.log('更新結果:', this.TLS26010Data());
      })
    );
  }

  /** 刪除預購活動 */
  public deleteTLS26010({ id }: TLS26010Data): void {
    this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/deleteTLS26010`, { id }).pipe(
      take(1),
      tap(() => this.TLS26010Data.set(this.TLS26010Data())),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('刪除結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  /** 核准或反核准預購活動 */
  public loadApproval(data: TLS26010Data): void {
    if (this.approvalStatusLoading) return;
    this.approvalStatusLoading = !0;
    this.confirmationService.confirm({
      message: `是否確定${this.approvalCheck(data).confirm}選取項目？`,
      accept: () => {
        const id = data.id;
        this.http.post<BaseQueryResponse<{ Status: ApprovalStatus; }>>(
          `${apiUrl}/TLS0000/TLS2000/${this.approvalCheck(data).api}`, { id }).pipe(
            take(1),
            tap(() => this.TLS26010Data.update(currentData => {
              const index = currentData.findIndex(item => item.id === id);
              const usr = this.auth.getUserInfo();
              const approval = this.approvalCheck(data).confirm === '核准';
              if (index !== -1) {
                currentData[index].approved_usr_name = approval ? usr!.user_Name : null;
                currentData[index].approved_date = approval ? new Date() : null;
                currentData[index].pod_status = approval ? ApprovalStatus.已核准 : ApprovalStatus.未核准;
              }
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
    this.sys3800Cancel$.complete();
    this.sys3900Cancel$.complete();
    this.sys3A00Cancel$.complete();
    this.ecrCancel$.complete();
    this.tltCancel$.complete();
    this.queryCancel$.complete();
    this.detailCancel$.complete();
  }
}
