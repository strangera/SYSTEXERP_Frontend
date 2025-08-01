import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { DependentDataQuery, PodRequest, TLS26010Data, TLS26010Detail, TLS26010DetailResponse, TLS26010Query } from '@pages/tls/tls26010/tls26010.model';
import { AuthService } from '@service/system/auth.service';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import saveAs from 'file-saver';
import { ConfirmationService } from 'primeng/api';
import { catchError, EMPTY, finalize, Observable, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS26010Service {

  // 儲存資料
  public TLS26010Data = signal<TLS26010Data[]>([]);
  public TLS26010Detail = signal<TLS26010Detail | undefined>(undefined);
  private sys3800Data = signal<DropdownOption[]>([]);
  private sys3900Data = signal<DropdownOption[]>([]);
  private sys3A00Data = signal<DropdownOption[]>([]);
  private preorderECRData = signal<DropdownOption[]>([]);
  private TLTTALENTData = signal<DropdownOption[]>([]);

  // 讀取狀態
  private sys3800Loading = !1;
  private sys3900Loading = !1;
  private sys3A00Loading = !1;
  private preorderECRLoading = !1;
  private TLTTALENTLoading = !1;
  private tableLoading = !1;
  private approvalStatusLoading = !1;
  private importLoading = !1;
  private downloadLoading = !1;

  // 下拉選單資料
  public ECRMap = new Map<string, DropdownOption>([]);
  public TLTMap = new Map<string, DropdownOption>([]);
  public get ECRList() { return Array.from(this.ECRMap.values()); };
  public get TLTList() { return Array.from(this.TLTMap.values()); };

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

  // 取得館別、樓層、區域代碼等下拉選單資料，用 map 去重
  public sys3800List = computed(() => {
    const res = new Map<string, DropdownOption>();
    for (const item of this.sys3800Data()) res.set(item.No, item);
    return Array.from(res.values());
  });
  public sys3900List = computed(() => {
    const res = new Map<string, DropdownOption>();
    for (const item of this.sys3900Data()) res.set(item.No, item);
    return Array.from(res.values());
  });
  public sys3A00List = computed(() => {
    const res = new Map<string, DropdownOption>();
    for (const item of this.sys3A00Data()) res.set(item.No, item);
    return Array.from(res.values());
  });

  // 變化監聽
  private ECRsEffect = effect(() => {
    this.ECRMap.clear();
    for (const item of this.preorderECRData()) this.ECRMap.set(item.No, item);
  });
  private TLTsEffect = effect(() => {
    this.TLTMap.clear();
    for (const item of this.TLTTALENTData()) this.TLTMap.set(item.No, item);
  });

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private errorHandler: ErrorHandlerService,
    private messageService: NotificationService,
    private confirmationService: ConfirmationService,
  ) { }

  /** 取得館別 */
  loadSYS3800(): void {
    if (this.sys3800Loading) return void (this.sys3800Loading = !1);
    this.sys3800Loading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/querySYS3800_DropDownList`, {}).pipe(
      take(1),
      tap(response => this.sys3800Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3800Loading = !1;
        console.log('館別查詢結果:', this.sys3800Data());
      })
    ).subscribe();
  }

  /** 取得樓層 */
  loadSYS3900(building_no?: string | null): void {
    if (this.sys3900Loading) return void (this.sys3900Loading = !1);
    this.sys3900Loading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/querySYS3900_DropDownList`, building_no?.length ? { building_no } : {}).pipe(
      take(1),
      tap(response => this.sys3900Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3900Loading = !1;
        console.log('樓層查詢結果:', this.sys3900Data());
      })
    ).subscribe();
  }

  /** 取得區域代碼 */
  loadSYS3A00(): void {
    if (this.sys3A00Loading) return void (this.sys3A00Loading = !1);
    this.sys3A00Loading = !0;
    this.http.post<any>(`${apiUrl}/querySYS3A00_DropDownList`, {}).pipe(
      take(1),
      tap(() => this.sys3A00Data.set([])),
      tap(response => this.sys3A00Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3A00Loading = !1;
        console.log('區域代碼查詢結果:', this.sys3A00Data());
      })
    ).subscribe();
  }

  /** 取得收銀機號 */
  loadPreorderECRList(query: DependentDataQuery & { data_type: string; }): void {
    if (this.preorderECRLoading) return void (this.preorderECRLoading = !1);
    this.preorderECRLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/QueryECRDropDownList`, query).pipe(
      take(1),
      tap(() => this.preorderECRData.set([])),
      tap(response => this.preorderECRData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.preorderECRLoading = !1;
        console.log('收銀機號查詢結果:', this.preorderECRData());
      }),
    ).subscribe();
  }

  /** 取得專櫃編號 */
  loadTLTTALENT(query: DependentDataQuery): void {
    if (this.TLTTALENTLoading) return void (this.TLTTALENTLoading = !1);
    this.TLTTALENTLoading = !0;
    // if (query.building_no === '' && query.floor_no === '') return void (this.TLTTALENTLoading = !1);

    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/queryTLTTALENT_DropDownList`, query).pipe(
      take(1),
      tap(() => this.TLTTALENTData.set([])),
      tap(response => this.TLTTALENTData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TLTTALENTLoading = !1;
        console.log('專櫃編號查詢結果:', this.TLTTALENTData());
      })
    ).subscribe();
  }

  /** 查詢預購活動檔期 */
  loadTLS26010(query: TLS26010Query): void {
    if (this.tableLoading) return void (this.tableLoading = !1);
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<TLS26010Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26010`, query).pipe(
      take(1),
      tap(response => this.TLS26010Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('預購活動檔期查詢結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  /** 查詢預購活動檔期 */
  loadTLS26010Detail(query: { pod_no: string; }): void {
    if (this.tableLoading) return void (this.tableLoading = !1);
    this.tableLoading = !0;
    this.http.post<TLS26010DetailResponse>(`${apiUrl}/TLS0000/TLS2000/queryTLS26010Detail`, query).pipe(
      take(1),
      tap(response => this.TLS26010Detail.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('預購活動檔期細節查詢結果:', this.TLS26010Detail());
      })
    ).subscribe();
  }

  /** 新增預購活動 */
  insertTLS26010(payload: PodRequest): Observable<BaseQueryResponse<any>> {
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
  updateTLS26010(data: PodRequest): Observable<BaseQueryResponse<any>> {
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
                ECR_Nos: data.ecr_list.map(e => e.ECR_No),
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

  /** 上傳 */
  importTLS26010(file: File): void {
    if (this.importLoading) return void (this.importLoading = !1);
    this.importLoading = !0;
    if (!file) return void (this.importLoading = !1);
    console.log(`file upload:`, [file]);
    // if (file.size > 10 * 1024 * 1024) {
    //   this.messageService.errorBubble('檔案大小超過限制，請選擇小於10MB的檔案');
    //   this.importLoading = !1;
    //   return;
    // }
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      this.messageService.errorBubble(`請上傳有效的 Excel 檔案`);
      this.importLoading = !1;
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<any>(`${apiUrl}/TLS0000/TLS2000/importTLS26010`, formData).pipe(
      take(1),
      tap(res => {
        const data: any = res?.Data;
        const cb = (item: any) => {
          if (item.ErrorFilePath) {
            // 有錯誤檔：顯示錯誤提示
            this.messageService.errorBubble(`部分資料匯入失敗，請下載錯誤檔檢查`);
            // 自動下載錯誤檔
            this.downloadErrorFile(item.ErrorFilePath);
          } else {
            // 沒有錯誤檔：顯示成功筆數
            this.messageService.infoBubble(`匯入成功，筆數：${item.SuccessCount}`);
          }
        };
        if (!Array.isArray(data)) cb(data);
        else for (const item of data) { cb(item); }
      }),
      catchError(() => { this.messageService.errorBubble('檔案上傳失敗，請稍後再試'); return EMPTY; }),
      finalize(() => {
        this.importLoading = !1;
        console.log('上傳結果:', this.TLS26010Data());
      }),
    ).subscribe();
  }

  /** 下載範例檔 */
  downloadTemplate(): void {
    if (this.downloadLoading) return void (this.downloadLoading = !1);
    this.downloadLoading = !0;
    this.http.get(`${apiUrl}/TLS0000/TLS2000/downloadTLS26010Template`, { responseType: 'blob', })
      .pipe(
        take(1),
        tap((res: Blob) => {
          const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          saveAs(blob, 'TLS26010_Template.xlsx');
        }),
        catchError(() => {
          this.messageService.errorBubble('下載範例檔案失敗，請稍後再試');
          return EMPTY;
        }),
        finalize(() => {
          this.downloadLoading = !1;
          console.log('下載範例檔結果:', this.TLS26010Data());
        }),
      ).subscribe();
  }

  /** 下載錯誤檔 */
  downloadErrorFile(filePath: string) {
    window.open(`${apiUrl}/TLS0000/TLS2000/${filePath}`, '_blank');
  }

  /** 刪除預購活動 */
  deleteTLS26010(data: TLS26010Data): void {
    if (this.tableLoading) return void (this.tableLoading = !1);
    this.tableLoading = !0;
    const id = data.pod_no;
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
  loadApproval(data: TLS26010Data): void {
    if (this.approvalStatusLoading) return void (this.approvalStatusLoading = !1);
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
    this.ECRMap.clear();
    this.TLTMap.clear();
    this.ECRsEffect.destroy();
    this.TLTsEffect.destroy();
  }
}
