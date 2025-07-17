import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { catchError, finalize, Observable, of, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BaseQueryResponse } from '../../../shared/models/api/base-api.interface';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { ECRNoService } from './../../basic/ECRNo.service';

interface Data {
  No: string;
  Name: string;
}

/**
 * @description
 * data_type: 1: 讀取收銀機主檔中統收機台, 2:讀取預購活動主檔中的收銀機台
 * building_no: 館別編號
 * floor_no: 樓層編號
 */
export interface PreorderECRListQuery {
  data_type: string;
  building_no: string;
  floor_no: string;
}

/**
 * @description
 * data_type: '1' 讀取收銀機主檔中統收機台, '2' 讀取預購活動主檔中的收銀機台
 * building_no: 館別編號
 * floor_no: 樓層編號
 */
export interface TLTTALENTQuery {
  building_no: string;
  floor_no: string;
}

export interface TLS26010Query {
  ECR_No: string[];
  tlt_no: string[];
  pod_sdate_S: string;
  pod_sdate_E: string;
  pod_edate_S: string;
  pod_edate_E: string;
}

export interface TLS26010 {
  Data: { pod_no: string; pod_desc: string; pod_sdate: string; pod_edate: string; }[];
  pod_status: string;
  approved_usr_name: string;
  approved_date: string;
}

const mock = !0;

@Injectable({ providedIn: 'root' })
export class TLS26010Service {
  apiUrl: string = environment.ApiUrl;

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

  readonly sys3800List = computed(() => {
    let res = [];
    for (const item of this.sys3800Data()) { res.push({ label: item.Name || '', value: item.No }); }
    return res;
  });
  readonly sys3900List = computed(() => {
    let res = [];
    for (const item of this.sys3900Data()) { res.push({ label: item.Name || '', value: item.No }); }
    return res;
  });
  readonly preorderECRList = computed(() =>
    mock ? this.preorderECRData().map(item => ({ label: item.Name || '', value: item.No }))
      : this.preorderECRData()
  );
  readonly TLTTALENTList = computed(() => {
    let res = [];
    for (const item of this.TLTTALENTData()) { res.push({ label: item.Name || '', value: item.No }); }
    return res;
  });
  readonly TLS26010List = computed(() =>
    mock ? this.TLS26010Data().flatMap(item => item.Data.map(data => ({
      pod_no: data.pod_no,
      pod_desc: data.pod_desc,
      pod_sdate: data.pod_sdate,
      pod_edate: data.pod_edate,
      pod_status: item.pod_status,
      approved_usr_name: item.approved_usr_name,
      approved_date: item.approved_date
    }))) : this.TLS26010Data()
  );

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) { }

  // 取得館別
  loadSYS3800(query: any): void {
    if (this.sys3800Loading) return; else (this.sys3800Loading = !0);
    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/querySYS3800_DropDownList`, query).pipe(
      take(1),
      tap(response => this.sys3800Data.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3800Loading = !1;
        console.log('館別查詢結果:', this.sys3800Data());
      })
    ).subscribe();
  }

  // 取得樓層
  loadSYS3900(query: any): void {
    if (this.sys3900Loading) return; else (this.sys3900Loading = !0);
    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/querySYS3900_DropDownList`, query).pipe(
      take(1),
      tap(response => this.sys3900Data.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => {
        this.sys3900Loading = !1;
        console.log('樓層查詢結果:', this.sys3900Data());
      })
    ).subscribe();
  }

  // 取得收銀機號
  loadPreorderECRList(query: PreorderECRListQuery): void {
    console.log(`loadPreorderECRList:`, [this.preorderECRLoading, query]);
    if (this.preorderECRLoading) return; else (this.preorderECRLoading = !0);
    if (query.building_no === '' && query.floor_no === '') return void (this.preorderECRLoading = !1);
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
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => {
        this.preorderECRLoading = !1;
        console.log('收銀機號查詢結果:', this.preorderECRData());
      }),
    ).subscribe();
  }

  // 取得專櫃編號
  loadTLTTALENT(query: TLTTALENTQuery): void {
    console.log(`loadTLTTALENT:`, [this.TLTTALENTLoading, query]);
    if (this.TLTTALENTLoading) return; else (this.TLTTALENTLoading = !0);
    if (query.building_no === '' && query.floor_no === '') return void (this.TLTTALENTLoading = !1);

    this.http.post<BaseQueryResponse<Data>>(`${this.apiUrl}/queryTLTTALENT_DropDownList`, query).pipe(
      take(1),
      tap(() => this.TLTTALENTData.set([])),
      tap(response => this.TLTTALENTData.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TLTTALENTLoading = !1;
        console.log('專櫃編號查詢結果:', this.TLTTALENTData());
      })
    ).subscribe();
  }

  // 查詢預購活動檔期
  loadTLS26010(query: TLS26010Query): void {
    console.log(`loadTLS26010:`, [this.TLS26010Loading, query]);
    if (this.TLS26010Loading) return; else (this.TLS26010Loading = !0);
    const mockData: BaseQueryResponse<TLS26010> = {
      Error: undefined,
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
          pod_status: '測試中',
          approved_usr_name: '測試使用者A',
          approved_date: '2025-01-15'
        },
        {
          Data: [
            { pod_no: 'TEST003', pod_desc: '測試預購活動3', pod_sdate: '2025-03-01', pod_edate: '2025-03-31' }
          ],
          pod_status: '待測試',
          approved_usr_name: '測試使用者B',
          approved_date: '2025-01-20'
        },
        {
          Data: [
            { pod_no: 'TEST004', pod_desc: '測試預購活動4', pod_sdate: '2025-04-01', pod_edate: '2025-04-30' },
            { pod_no: 'TEST005', pod_desc: '測試預購活動5', pod_sdate: '2025-05-01', pod_edate: '2025-05-31' },
            { pod_no: 'TEST006', pod_desc: '測試預購活動6', pod_sdate: '2025-06-01', pod_edate: '2025-06-30' }
          ],
          pod_status: '已核准',
          approved_usr_name: '測試使用者C',
          approved_date: '2025-01-25'
        }
      ]
    };

    const api = mock
      ? of(mockData)
      : this.http.post<BaseQueryResponse<TLS26010>>(`${this.apiUrl}/queryTLS26010`, query);

    api.pipe(
      take(1),
      tap(response => this.TLS26010Data.set(response.Data)),
      catchError((error) => this.errorHandler.handleError(error)),
      finalize(() => {
        this.TLS26010Loading = !1;
        console.log('預購活動檔期查詢結果:', this.TLS26010Data());
      })
    ).subscribe();
  }

  clearData(): void {
    this.TLS26010Data.set([]);
  }

  // insertTLS26010
  // updateTLS26010
  // deleteTLS26010
  // approvalTLS26010
  // disapprovalTLS26010
  // importTLS26010
}
