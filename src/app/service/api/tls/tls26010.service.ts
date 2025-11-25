import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal, WritableSignal } from '@angular/core';
import { DependentDataQuery, EcrItem, PodRequest, TLS26010Data, TLS26010DetailResponse, TLS26010Query, TltItem } from '@pages/tls/tls26010/tls26010.model';
import { AuthService } from '@service/system/auth.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
// 預購活動檔期設定
export class TLS26010Service {
  private readonly d = (() => {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
  })();
  public readonly dateS: Date = this.d.start;
  public readonly dateE: Date = this.d.end;

  public readonly isRowSelectable = (rowData: TLS26010Data) =>
    (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  // 儲存資料
  public readonly sys3800Options = signal<DropdownOption[]>([]);
  public readonly sys3900Options = signal<DropdownOption[]>([]);
  public readonly sys3A00Options = signal<DropdownOption[]>([]);
  public readonly ecrOptions = signal<EcrItem[]>([]);
  public readonly tltOptions = signal<TltItem[]>([]);

  // 讀取狀態
  public readonly sys3800Loading = signal<boolean>(false);
  public readonly sys3900Loading = signal<boolean>(false);
  public readonly sys3A00Loading = signal<boolean>(false);
  public readonly ecrLoading = signal<boolean>(false);
  public readonly tltLoading = signal<boolean>(false);
  public readonly tableLoading = signal<boolean>(false);
  public readonly approvalStatusLoading = signal<boolean>(false);

  public readonly ecrDataMap = computed(() => {
    return new Map<string, EcrItem>(this.ecrOptions().map(ecr => ([ecr.ecr_no!, ecr])));
  });

  public readonly tltDataMap = computed(() => {
    return new Map<string, TltItem>(this.tltOptions().map(tlt => ([tlt.tlt_no!, tlt])));
  });

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
    private readonly http: HttpClient,
    private readonly auth: AuthService,
    private readonly messageService: NotificationService,
    private readonly logger: NGXLogger,
  ) { }

  /** 取得館別 */
  public loadSYS3800(): void {
    this.sys3800Loading.set(true);
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/querySYS3800_DropDownList`, {}).pipe(
      take(1),
      tap(res => {
        this.sys3800Options.set(res.Data);
        this.logger.debug(`館別查詢結果:`, [res]);
      }),
      finalize(() => this.sys3800Loading.set(false))
    ).subscribe();
  }

  /** 取得樓層 */
  public loadSYS3900(): void {
    this.sys3900Loading.set(true);
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/querySYS3900_DropDownList`, {}).pipe(
      take(1),
      tap(res => {
        this.sys3900Options.set(res.Data);
        this.logger.debug(`樓層查詢結果:`, [res]);
      }),
      finalize(() => this.sys3900Loading.set(false))
    ).subscribe();
  }

  /** 取得區域代碼 */
  public loadSYS3A00(): void {
    this.sys3A00Loading.set(true);
    this.http.post<any>(`${apiUrl}/querySYS3A00_DropDownList`, {}).pipe(
      take(1),
      tap(res => {
        this.sys3A00Options.set(res.Data);
        this.logger.debug(`區域代碼查詢結果:`, [res]);
      }),
      finalize(() => this.sys3A00Loading.set(false))
    ).subscribe();
  }

  /** 取得收銀機號 */
  public queryECRDropDownList(query: DependentDataQuery & { ecr_type: string; }): void {
    this.ecrLoading.set(true);
    this.http.post<BaseQueryResponse<any>>(`${apiUrl}/queryECRDropDownList`, query).pipe(
      take(1),
      tap(res => {
        const mapped = (res.Data ?? []).map(item => ({
          ...item,
        }));
        this.ecrOptions.set(mapped);
        console.log('收銀機號查詢 request 💡:', query);
        console.log(`收銀機號查詢結果:`, res.Data);
      }),
      finalize(() => this.ecrLoading.set(false)),
    ).subscribe();
  }

  /** 取得專櫃編號 */
  public queryTalentDropDownList(query: DependentDataQuery): void {
    this.tltLoading.set(true);
    this.http.post<BaseQueryResponse<TltItem>>(`${apiUrl}/queryTalentDropDownList`, query).pipe(
      take(1),
      tap(res => {
        this.tltOptions.set(res.Data);
        console.log('專櫃編號查詢 request 💡:', query);
        console.log('專櫃編號查詢 response:', res.Data);
      }),
      finalize(() => this.tltLoading.set(false))
    ).subscribe();
  }

  /** 查詢預購活動檔期 */
  public loadTLS26010(query: TLS26010Query): Observable<BaseQueryResponse<TLS26010Data>> {
    this.tableLoading.set(true);
    return this.http.post<BaseQueryResponse<TLS26010Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26010`, query).pipe(
      take(1),
      tap(res => this.logger.debug(`預購活動檔期查詢結果:`, res)),
      finalize(() => this.tableLoading.set(false))
    );
  }

  /** 查詢預購活動檔期 */
  public loadTLS26010Detail(query: { pod_no: string; }): Observable<TLS26010DetailResponse> {
    this.tableLoading.set(true);
    return this.http.post<TLS26010DetailResponse>(`${apiUrl}/TLS0000/TLS2000/queryTLS26010Detail`, query).pipe(
      take(1),
      tap(res => {
        console.log('預購活動檔期細節 request 💡:', query);
        console.log('預購活動檔期細節 response:', res.Data);
      }
      ),
      finalize(() => this.tableLoading.set(false))
    );
  }

  /** 新增預購活動 */
  public insertTLS26010(payload: PodRequest): Observable<BaseQueryResponse<any>> {
    if (this.tableLoading()) { this.tableLoading.set(false); return of(); };
    this.tableLoading.set(true);
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug(`新增結果:`, [res])),
      finalize(() => this.tableLoading.set(false)),
    );
  }

  /** 更新預購活動 */
  public updateTLS26010(data: PodRequest, tableData: WritableSignal<TLS26010Data[]>): Observable<BaseQueryResponse<any>> {
    if (this.tableLoading()) { this.tableLoading.set(false); return of(); };
    this.tableLoading.set(true);
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/updateTLS26010`, data).pipe(
      take(1),
      tap((res) => {
        if (res.Status === '0000') {
          // 更新本地數據
          tableData.update(currentData => {
            const info = data.pod_info;
            const index = currentData.findIndex(item => item.pod_no === info.pod_no);
            this.logger.debug(`update data:`, [currentData, data, info, index]);
            if (index !== -1 && currentData[index]) {
              const updatedData: TLS26010Data = {
                ...currentData[index],
                pod_desc: info.pod_desc,
                pod_sdate: info.pod_sdate,
                pod_edate: info.pod_edate,
                pod_status: currentData[index].pod_status === ApprovalStatus.已核准
                  ? ApprovalStatus.未核准
                  : ApprovalStatus.已核准,
                talent_list: data.talent_list.map(t => t.tlt_no!),
                ecr_list: data.ecr_list.map(e => e.ecr_no!),
              };
              currentData[index] = updatedData;
            }
            return [...currentData];
          });
          this.messageService.successBubble('更新成功');
        } else {
          this.messageService.errorBox('更新失敗: ' + res.Message);
        }
        this.logger.debug(`更新結果:`, [res]);
      }),
      finalize(() => this.tableLoading.set(false))
    );
  }

  /** 刪除預購活動 */
  public deleteTLS26010({ id }: TLS26010Data): Observable<BaseQueryResponse<any>> {
    this.tableLoading.set(true);
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/deleteTLS26010`, { id }).pipe(
      take(1),
      tap(res => this.logger.debug(`刪除結果:`, [res])),
      finalize(() => this.tableLoading.set(false))
    );
  }

  /** 核准或反核准預購活動 */
  public loadApproval(data: TLS26010Data, tableData: WritableSignal<TLS26010Data[]>): void {
    if (this.approvalStatusLoading()) return;
    this.approvalStatusLoading.set(true);
    const id = data.id;
    this.http.post<BaseQueryResponse<{ Status: ApprovalStatus; }>>(
      `${apiUrl}/TLS0000/TLS2000/${this.approvalCheck(data).api}`, { id }).pipe(
        take(1),
        tap(() => tableData.update(currentData => {
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
        tap(res => {
          if (res.Status !== '0000') return void this.messageService.errorBubble(`${this.approvalCheck(data).confirm}失敗: ${res.Message}`);
          this.messageService.successBubble(`${this.approvalCheck(data).confirm}成功`);
        }),
        finalize(() => this.approvalStatusLoading.set(false))
      ).subscribe();
  }
}
