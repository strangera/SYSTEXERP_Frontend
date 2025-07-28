import { HttpClient } from '@angular/common/http';
import { computed, effect, Injectable, signal } from '@angular/core';
import { ECRTableData, mockPreorderECRList, mockQueryTLS26010, QueryPayload, TLS26010, TLS26010Data, TLS26010Payload, TLS26010Query, TLTTALENTData } from '@pages/tls/tls26010/tls26010.model';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { ApprovalStatus } from '@shared/models';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import saveAs from 'file-saver';
import { catchError, EMPTY, finalize, Observable, of, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const mock = !1;
const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS26010Service {

  // 儲存資料
  public approvalData = signal<ApprovalStatus>(ApprovalStatus.未核准);
  public ECRTableData = signal<ECRTableData[]>([]);
  public TLTTableData = signal<TLTTALENTData[]>([]);
  public TLS26010List = signal<TLS26010Data[]>([]);
  private sys3800Data = signal<DropdownOption[]>([]);
  private sys3900Data = signal<DropdownOption[]>([]);
  private sys3A00Data = signal<DropdownOption[]>([]);
  private preorderECRData = signal<DropdownOption[]>([]);
  private TLTTALENTData = signal<DropdownOption[]>([]);
  private TLS26010Data = signal<TLS26010[]>([]);

  // 讀取狀態
  private sys3800Loading = !1;
  private sys3900Loading = !1;
  private sys3A00Loading = !1;
  private preorderECRLoading = !1;
  private TLTTALENTLoading = !1;
  private TableLoading = !1;
  private approvalStatusLoading = !1;
  private importLoading = !1;
  private downloadLoading = !1;

  // 下拉選單資料
  public ECRMap = new Map<string, DropdownOption>([]);
  public TLTMap = new Map<string, DropdownOption>([]);
  public ECRTableMap = new Map<string, ECRTableData>([]);
  public TLTTableMap = new Map<string, TLTTALENTData>([]);

  public get ECRList() { return Array.from(this.ECRMap.values()); };
  public get TLTList() { return Array.from(this.TLTMap.values()); };

  public approvalStatus(value: string): string {
    switch (value) {
      case ApprovalStatus.未核准: return '未核准';
      case ApprovalStatus.已核准: return '已核准';
      case ApprovalStatus.刪除: return '刪除';
      default: return value;
    }
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
  private ECRs = effect(() => {
    this.ECRMap.clear();
    for (const item of this.preorderECRData()) this.ECRMap.set(item.No, item);
  });

  private TLTs = effect(() => {
    this.TLTMap.clear();
    for (const item of this.TLTTALENTData()) this.TLTMap.set(item.No, item);
  });
  private fetchData = effect(() => {
    const ecrData = this.preorderECRData();
    const tltData = this.TLTTALENTData();

    // 用for loop改善效能並減少記憶體
    for (const tltItem of tltData) this.TLTTableMap.set(tltItem.No, {
      tlt_no: tltItem.No,
      tlt_name: tltItem.Name || '',
    });

    for (const ecrItem of ecrData) {
      for (const tltItem of tltData) this.ECRTableMap.set(ecrItem.No + '/' + tltItem.No, {
        ECR_No: ecrItem.No,
        tlt_no: tltItem.No,
        tlt_name: tltItem.Name || '',
      });
    }

    this.ECRTableData.set(Array.from(this.ECRTableMap.values()));
    this.TLTTableData.set(Array.from(this.TLTTableMap.values()));
  }, { allowSignalWrites: true });
  private fetchTLS26010List = effect(() => {
    const res = new Map<string, TLS26010Data>();
    const tlsData = this.TLS26010Data();
    for (const item of tlsData) {
      if (!item.Data || !item.Data.length) continue;
      for (const data of item.Data) {
        if (res.has(data.pod_no)) continue;
        res.set(data.pod_no, {
          ECR_Nos: data.ECR_Nos || [],
          tlt_nos: data.tlt_nos || [],
          talent_id: data.talent_id || 0,
          build_no: data.build_no || '',
          floor_no: data.floor_no || '',
          area_no: data.area_no || '',
          pod_no: data.pod_no,
          pod_desc: data.pod_desc,
          pod_sdate: data.pod_sdate,
          pod_edate: data.pod_edate,
          pod_status: item.pod_status,
          approved_usr_name: item.approved_usr_name,
          approved_date: item.approved_date,
        });
      }
    }
    this.TLS26010List.set(Array.from(res.values()));
  }, { allowSignalWrites: true });

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private messageService: NotificationService,
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
  loadSYS3900(): void {
    if (this.sys3900Loading) return void (this.sys3900Loading = !1);
    this.sys3900Loading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/querySYS3900_DropDownList`, {}).pipe(
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
  loadPreorderECRList(query: QueryPayload): Observable<any> {
    if (this.preorderECRLoading) return of(void (this.preorderECRLoading = !1));
    this.preorderECRLoading = !0;

    const api = mock
      ? of(mockPreorderECRList)
      : this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/queryPreorderECR_List`, query);

    return api.pipe(
      take(1),
      tap(() => this.preorderECRData.set([])),
      tap(response => this.preorderECRData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.preorderECRLoading = !1;
        console.log('收銀機號查詢結果:', this.preorderECRData());
      }),
    );
  }

  /** 取得專櫃編號 */
  loadTLTTALENT(query: QueryPayload): Observable<any> {
    if (this.TLTTALENTLoading) return of(void (this.TLTTALENTLoading = !1));
    this.TLTTALENTLoading = !0;
    // if (query.building_no === '' && query.floor_no === '') return void (this.TLTTALENTLoading = !1);

    return this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/queryTLTTALENT_DropDownList`, query).pipe(
      take(1),
      tap(() => this.TLTTALENTData.set([])),
      tap(response => this.TLTTALENTData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TLTTALENTLoading = !1;
        console.log('專櫃編號查詢結果:', this.TLTTALENTData());
      })
    );
  }

  /** 查詢預購活動檔期 */
  loadTLS26010(query: TLS26010Query): void {
    if (this.TableLoading) return void (this.TableLoading = !1);
    this.TableLoading = !0;

    const api = mock
      ? of(mockQueryTLS26010)
      : this.http.post<BaseQueryResponse<TLS26010>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26010`, query);

    api.pipe(
      take(1),
      tap(response => this.TLS26010Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TableLoading = !1;
        console.log('預購活動檔期查詢結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  /** 新增預購活動 */
  insertTLS26010(payload: TLS26010Payload): Observable<BaseQueryResponse<any>> {
    if (this.TableLoading) { this.TableLoading = !1; return of(); };
    this.TableLoading = !0;

    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26010`, payload).pipe(
      take(1),
      tap(() => { }),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TableLoading = !1;
        console.log('新增結果:', this.TLS26010Data());
      })
    );
  }

  /** 更新預購活動 */
  updateTLS26010(data: TLS26010Payload): Observable<BaseQueryResponse<any>> {
    if (this.TableLoading) { this.TableLoading = !1; return of(); };
    this.TableLoading = !0;

    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/updateTLS26010`, data).pipe(
      take(1),
      tap((response) => {
        if (response.Status === 'Success') {
          // 更新本地數據
          this.TLS26010Data.update(currentData => {
            const index = currentData.findIndex(item => item.Data?.[0]?.pod_no === data.pod_no);
            if (index !== -1) {
              // 更新找到的項目
              if (currentData[index].Data && currentData[index].Data[0]) {
                currentData[index].Data[0] = { ...currentData[index].Data[0], ...data };
              }
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
        this.TableLoading = !1;
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
    if (this.TableLoading) return void (this.TableLoading = !1);
    this.TableLoading = !0;
    const id = data.pod_no;
    const api = mock
      ? of(<BaseQueryResponse<any>>{
        Error: void 0,
        Message: "成功",
        Meta: { Timestamp: "2025-01-20T10:00:00.0000000Z", RequestId: "test-request-id-12345" },
        Status: "0000"
      })
      : this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/deleteTLS26010`, { id });

    api.pipe(
      take(1),
      tap(() => {
        const updatedData = this.TLS26010Data().map(item => ({
          ...item,
          Data: item.Data.filter(data => data.pod_no !== id)
        })).filter(item => item.Data.length);
        this.TLS26010Data.set(updatedData);
      }),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TableLoading = !1;
        console.log('刪除結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  /** 核准或反核准預購活動 */
  loadApproval(data: TLS26010Data): void {
    if (this.approvalStatusLoading) return void (this.approvalStatusLoading = !1);
    this.approvalStatusLoading = !0;
    const id = data.pod_no;

    this.http.post<BaseQueryResponse<{ Status: ApprovalStatus; }>>(
      `${apiUrl}/TLS0000/TLS2000${data.pod_status === ApprovalStatus.未核准 ? '/approvalTLS26010' : '/disapprovalTLS26010'}`,
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

  /** 清除所有資料 */
  clearData(): void {
    this.sys3800Data.set([]);
    this.sys3900Data.set([]);
    this.preorderECRData.set([]);
    this.TLTTALENTData.set([]);
    this.TLS26010Data.set([]);
    this.TLS26010List.set([]);
    this.ECRMap.clear();
    this.TLTMap.clear();
    this.ECRTableMap.clear();
    this.TLTTableMap.clear();
    this.ECRs.destroy();
    this.TLTs.destroy();
    this.fetchData.destroy();
    this.fetchTLS26010List.destroy();
  }
}
