import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { catchError, EMPTY, finalize, of, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationService } from '../../../shared/component/notification-message/notification.service';
import { BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { ErrorHandlerService } from '../../system/error-handler.service';

interface Data {
  No: string;
  Name: string;
}

interface ECROption {
  ECR_No: string;
  ECR_Name: string;
}

interface TLTOption {
  tlt_no: string;
  tlt_name: string;
}


export const enum ApprovalStatus {
  未核准 = '0',
  已核准 = '1',
  刪除 = '9',
}

/**
 * @description
 * data_type: 1: 讀取收銀機主檔中統收機台, 2: 讀取預購活動主檔中的收銀機台
 * SYS3800s: 館別編號
 * SYS3900s: 樓層編號
 */
export interface PreorderECRListQuery {
  data_type: string;
  SYS3800s: { building_no: string; }[];
  SYS3900s: { floor_no: string; }[];
}

/**
 * @description
 * data_type: 1: 讀取收銀機主檔中統收機台, 2: 讀取預購活動主檔中的收銀機台
 * SYS3800s: 館別編號
 * SYS3900s: 樓層編號
 */
export interface TLTTALENTQuery {
  SYS3800s: { building_no: string; }[];
  SYS3900s: { floor_no: string; }[];
}

export interface TLS26010Query {
  ECR_Nos: string[];
  tlt_nos: string[];
  pod_sdate_S: string;
  pod_sdate_E: string;
  pod_edate_S: string;
  pod_edate_E: string;
}

export interface TLS26010 {
  Data: {
    pod_no: string;
    pod_desc: string;
    pod_sdate: string;
    pod_edate: string;
  }[];
  pod_status: '0' | '1' | '9';
  approved_usr_name: string;
  approved_date: string | null;
}

export interface TLS26010Data {
  pod_no: string;
  pod_desc: string;
  pod_sdate: string;
  pod_edate: string;
  pod_status: '0' | '1' | '9';
  approved_usr_name: string;
  approved_date: string | null;
}

const mock = !0;

@Injectable({ providedIn: 'root' })
export class TLS26010Service {
  apiUrl: string = environment.ApiUrl;

  public approvalData = signal<ApprovalStatus>(ApprovalStatus.未核准);

  // 儲存資料
  private sys3800Data = signal<Data[]>([]);
  private sys3900Data = signal<Data[]>([]);
  private preorderECRData = signal<Data[]>([]);
  private TLTTALENTData = signal<Data[]>([]);
  private TLS26010Data = signal<TLS26010[]>([]);

  private sys3800Loading = !1;
  private sys3900Loading = !1;
  private preorderECRLoading = !1;
  private TLTTALENTLoading = !1;
  private TLS26010Loading = !1;
  private approvalStatusLoading = !1;

  public sys3800List = computed(() => {
    const res = new Map<string, Data>();
    for (const item of this.sys3800Data()) res.set(item.No, item);
    return Array.from(res.values());
  });
  public sys3900List = computed(() => {
    const res = new Map<string, Data>();
    for (const item of this.sys3900Data()) res.set(item.No, item);
    return Array.from(res.values());
  });
  public ECRList = computed(() => {
    const res = new Map<string, Data>();
    for (const item of this.preorderECRData()) res.set(item.No, item);
    return Array.from(res.values());
  });
  public TLTList = computed(() => {
    const res = new Map<string, Data>();
    for (const item of this.TLTTALENTData()) res.set(item.No, item);
    return Array.from(res.values());
  });
  // public ECRList = computed(() => {
  //   const res = new Map<string, ECROption>();
  //   for (const item of this.preorderECRData()) {
  //     res.set(item.No, { ECR_No: item.No, ECR_Name: item.Name || '' });
  //   }
  //   return Array.from(res.values());
  // });
  // public TLTList = computed(() => {
  //   const res = new Map<string, TLTOption>();
  //   for (const item of this.TLTTALENTData()) {
  //     res.set(item.No, { tlt_no: item.No, tlt_name: item.Name || '' });
  //   }
  //   return Array.from(res.values());
  // });
  public TLS26010List = computed(() => {
    const res = new Map<string, TLS26010Data>();
    for (const item of this.TLS26010Data()) {
      for (const data of item.Data) res.set(data.pod_no, {
        pod_no: data.pod_no,
        pod_desc: data.pod_desc,
        pod_sdate: data.pod_sdate,
        pod_edate: data.pod_edate,
        pod_status: item.pod_status,
        approved_usr_name: item.approved_usr_name,
        approved_date: item.approved_date
      });
    }
    return Array.from(res.values());
  });

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
    private messageService: NotificationService,
  ) { }

  /** 取得館別 */
  loadSYS3800(query: any): void {
    if (this.sys3800Loading) return void (this.sys3800Loading = !1);
    this.sys3800Loading = !0;
    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/querySYS3800_DropDownList`, query).pipe(
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
  loadSYS3900(query: any): void {
    if (this.sys3900Loading) return void (this.sys3900Loading = !1);
    this.sys3900Loading = !0;
    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/querySYS3900_DropDownList`, query).pipe(
      take(1),
      tap(response => this.sys3900Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3900Loading = !1;
        console.log('樓層查詢結果:', this.sys3900Data());
      })
    ).subscribe();
  }

  /** 取得收銀機號 */
  loadPreorderECRList(query: PreorderECRListQuery): void {
    if (this.preorderECRLoading) return void (this.preorderECRLoading = !1);
    this.preorderECRLoading = !0;
    const mockData: BaseQueryResponse<Data> = {
      Error: void 0,
      Message: "成功",
      Meta: {
        Timestamp: "2025-01-20T10:00:00.0000000Z",
        RequestId: "test-request-id-12345"
      },
      Status: "0000",
      TotalCount: 3,
      TotalPage: 1,
      Data: [
        { No: '000001', Name: '000001' },
        { No: '000002', Name: '000002' },
        { No: '000003', Name: '000003' },
        { No: '000004', Name: '000004' },
        { No: '000005', Name: '000005' }
      ]
    };

    const api = mock
      ? of(mockData)
      : this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/queryPreorderECR_List`, query);

    api.pipe(
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
  loadTLTTALENT(query: TLTTALENTQuery): void {
    if (this.TLTTALENTLoading) return void (this.TLTTALENTLoading = !1);
    this.TLTTALENTLoading = !0;
    // if (query.building_no === '' && query.floor_no === '') return void (this.TLTTALENTLoading = !1);

    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/queryTLTTALENT_DropDownList`, query).pipe(
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
    if (this.TLS26010Loading) return void (this.TLS26010Loading = !1);
    this.TLS26010Loading = !0;
    const mockData: BaseQueryResponse<TLS26010> = {
      Error: void 0,
      Message: "成功",
      Meta: {
        Timestamp: "2025-01-20T10:00:00.0000000Z",
        RequestId: "test-request-id-12345"
      },
      Status: "0000",
      TotalCount: 3,
      TotalPage: 1,
      Data: [
        {
          Data: [
            { pod_no: 'TEST001', pod_desc: '測試預購活動1', pod_sdate: '2025-01-01', pod_edate: '2025-01-31' },
            { pod_no: 'TEST002', pod_desc: '測試預購活動2', pod_sdate: '2025-02-01', pod_edate: '2025-02-28' }
          ],
          pod_status: '0',
          approved_usr_name: '',
          approved_date: null
        },
        {
          Data: [
            { pod_no: 'TEST003', pod_desc: '測試預購活動3', pod_sdate: '2025-03-01', pod_edate: '2025-03-31' }
          ],
          pod_status: '1',
          approved_usr_name: '測試使用者B',
          approved_date: '2025-01-20'
        },
        {
          Data: [
            { pod_no: 'TEST004', pod_desc: '測試預購活動4', pod_sdate: '2025-04-01', pod_edate: '2025-04-30' },
            { pod_no: 'TEST005', pod_desc: '測試預購活動5', pod_sdate: '2025-05-01', pod_edate: '2025-05-31' },
            { pod_no: 'TEST006', pod_desc: '測試預購活動6', pod_sdate: '2025-06-01', pod_edate: '2025-06-30' }
          ],
          pod_status: '1',
          approved_usr_name: '測試使用者C',
          approved_date: '2025-01-25'
        },
        {
          Data: [
            { pod_no: 'TEST007', pod_desc: '測試預購活動7', pod_sdate: '2025-07-01', pod_edate: '2025-07-31' }
          ],
          pod_status: '9',
          approved_usr_name: '測試使用者D',
          approved_date: '2025-01-30'
        }
      ]
    };

    const api = mock
      ? of(mockData)
      : this.http.post<BaseQueryResponse<TLS26010>>(`${this.apiUrl}/queryTLS26010`, query);

    api.pipe(
      take(1),
      tap(response => this.TLS26010Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TLS26010Loading = !1;
        console.log('預購活動檔期查詢結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  /** 核准或反核准預購活動 */
  loadApproval(data: TLS26010Data): void {
    if (this.approvalStatusLoading) return void (this.approvalStatusLoading = !1);
    this.approvalStatusLoading = !0;
    const id = data.pod_no;

    this.http.post<BaseQueryResponse<{ Status: ApprovalStatus; }>>(
      `${this.apiUrl}${data.pod_status === ApprovalStatus.未核准 ? '/approvalTLS26010' : '/disapprovalTLS26010'}`,
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

  /** 上傳 */
  updateTLS26010(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<any>(`${this.apiUrl}/importTLS26010`, formData).pipe(
      take(1),
      catchError(() => { this.messageService.errorBubble('檔案上傳失敗，請稍後再試'); return EMPTY; }),
    ).subscribe(res => {
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
    });
  }

  /** 下載錯誤檔 */
  downloadErrorFile(filePath: string) {
    window.open(`${environment.ApiUrl}/${filePath}`, '_blank');
  }

  /** 刪除預購活動 */
  deleteTLS26010(data: TLS26010Data): void {
    if (this.TLS26010Loading) return void (this.TLS26010Loading = !1);
    this.TLS26010Loading = !0;
    const id = data.pod_no;
    const api = mock
      ? of(<BaseQueryResponse<any>>{
        Error: void 0,
        Message: "成功",
        Meta: { Timestamp: "2025-01-20T10:00:00.0000000Z", RequestId: "test-request-id-12345" },
        Status: "0000"
      })
      : this.http.post<BaseQueryResponse<any>>(`${this.apiUrl}/deleteTLS26010`, { id });

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
        this.TLS26010Loading = !1;
        console.log('刪除結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    // 服務銷毀時清除所有資料
    this.clearData();
  }

  clearData(): void {
    // 清除 signal 資料
    this.sys3800Data.set([]);
    this.sys3900Data.set([]);
    this.preorderECRData.set([]);
    this.TLTTALENTData.set([]);
    this.TLS26010Data.set([]);
  }

  // insertTLS26010
}
