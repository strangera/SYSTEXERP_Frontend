import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { CampaignData, TLS26080Data, TLS26080Detail, TLS26080Query, TLS26080UploadResponse, TLS26080UploadResult, TLS2608InsertPayload } from '@pages/tls/tls26080/tls26080.model';
import { Option, TalentChargeItem } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { ApprovalStatus } from '@shared/models/tls/approval-status.model';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
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
  public readonly TLS26080Data = signal<TLS26080Data[]>([]);
  public readonly TLS26080Detail = signal<TLS26080Detail[]>([]);
  public readonly campaignData = signal<CampaignData[]>([]);
  public readonly tltTalentOptions = signal<Option[]>([]);

  public readonly tltTalentMap = computed(() => {
    const map = new Map<string, string>();
    this.tltTalentOptions().forEach(item => map.set(item.value, item.label));
    return map;
  });

  public tltTalentChargeMap = new Map<string, Option[]>();

  public readonly totalRecords = signal<number>(0);
  public readonly detailTotalRecords = signal<number>(0);

  // 讀取狀態
  public readonly dataLoading = signal<boolean>(!1);
  public readonly approvalStatusLoading = signal<boolean>(!1);
  public readonly campaignLoading = signal<boolean>(!1);
  public readonly capItemsLoading = signal<boolean>(!1);
  public readonly fileUploadLoading = signal<boolean>(!1);
  public readonly exampleDownLoading = signal<boolean>(!1);
  public readonly tltTalentOptionsLoading = signal<boolean>(!1);
  public readonly tltTalentChargeOptionsLoading = signal<boolean>(!1);

  // 下拉選單資料
  public departmentItems = signal<Option[]>([]);
  public capItems = signal<Option[]>([]);
  public podTypeItems = [
    { value: '1', label: '預售' },
    { value: '2', label: '滿千送百' },
    { value: '8', label: '期間開放折扣' },
  ];
  public podStatusItems = [
    { value: ApprovalStatus.未核准, label: '未核准' },
    { value: ApprovalStatus.已核准, label: '已核准' },
    { value: ApprovalStatus.刪除, label: '刪除' },
  ];

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
    private messageService: NotificationService,
    private logger: NGXLogger,
    private dropdown: DropdownApiService,
  ) { }

  public loadAPS1003(cap_typeList: string[]): void {
    if (this.capItemsLoading()) return void (this.capItemsLoading.set(!1));
    this.capItemsLoading.set(!0);
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/queryAPS1003_DropDownList`, { cap_typeList }).pipe(
      take(1),
      tap(res => {
        this.capItems.set(res.Data?.map(item => ({ value: item.No, label: item.Name })) || []);
        this.logger.debug(`APS1003查詢結果:`, [res]);
      }),
      finalize(() => this.capItemsLoading.set(!1))
    ).subscribe();
  }

  /** 查詢資料 */
  public loadTLS26080(query: TLS26080Query): void {
    if (this.dataLoading()) return void (this.dataLoading.set(!1));
    this.dataLoading.set(!0);
    this.http.post<BaseQueryResponse<TLS26080Data>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080`, query).pipe(
      take(1),
      tap(res => {
        this.TLS26080Data.set(res.Data);
        this.totalRecords.set(res.TotalCount || 0);
        this.logger.debug(`TLS26080查詢結果:`, [res]);
      }),
      finalize(() => this.dataLoading.set(!1))
    ).subscribe();
  };

  /** 查詢環友資料 */
  public loadCampaignData(query: any = {}): void {
    if (this.campaignLoading()) return void (this.campaignLoading.set(!1));
    this.campaignLoading.set(!0);
    this.http.post<BaseQueryResponse<CampaignData>>(`${apiUrl}/TLS0000/TLS2000/queryCampaign`, query).pipe(
      take(1),
      tap(res => {
        this.campaignData.set(res.Data);
        this.logger.debug(`環友資料查詢結果:`, [res]);
      }),
      finalize(() => this.campaignLoading.set(!1))
    ).subscribe();
  };

  /** 專櫃活動 */
  public loadTLS26080Detail(query: string): void {
    this.TLS26080Detail.set([]);
    if (this.dataLoading()) return void (this.dataLoading.set(!1));
    this.dataLoading.set(!0);
    this.http.post<BaseQueryResponse<TLS26080Detail>>(`${apiUrl}/TLS0000/TLS2000/queryTLS26080_Detail`, { pod_no: query }).pipe(
      take(1),
      map(res => (<BaseQueryResponse<TLS26080Detail>>{
        ...res,
        Data: res.Data.map<TLS26080Detail>(item => ({
          ...item,
          tpy_rate_D16: Number(item.tpy_rate_D16) * 100,
          tpy_rate_D17: Number(item.tpy_rate_D17) * 100,
        }))
      })),
      tap(res => {
        this.TLS26080Detail.set(res.Data);
        this.detailTotalRecords.set(res.TotalCount || 0);
        this.logger.debug(`專櫃活動細節查詢結果:`, [res]);
      }),
      finalize(() => this.dataLoading.set(!1))
    ).subscribe();
  };

  public insertTLS26080(data: TLS2608InsertPayload): Observable<BaseQueryResponse<any>> {
    return this.http.post<BaseQueryResponse<any>>(`${apiUrl}/TLS0000/TLS2000/insertTLS26080`, data).pipe(
      take(1),
    );
  };

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
          this.logger.debug(`核准結果:`, [this.approvalCheck(data).confirm]);
          return currentData;
        })),
        finalize(() => {
          this.approvalStatusLoading.set(!1);
          this.messageService.successBubble(`${this.approvalCheck(data).confirm}成功`);
        })
      ).subscribe();
  }

  public uploadFile(file: FormData): void {
    this.fileUploadLoading.set(!0);
    this.http.post<TLS26080UploadResponse>(`${apiUrl}/TLS0000/TLS2000/uploadTLS26080`, file).pipe(
      take(1),
      tap(res => {
        const data = res.Data;
        this.logger.debug(`uploadFile:`, [res]);
        if (data.Success) {
          this.TLS26080Detail.update(current =>
            data.queryTLS26080_DetailResponses.map(value => (<TLS26080Detail>{
              id: value.id,
              talent_id: value.talent_id,
              tlt_id: value.tlt_id,
              tlt_id_desc: value.tlt_id_desc,
              tlt_no: value.tlt_no,
              tlt_name: value.tlt_name,
              calc_date_type: value.calc_date_type,
              cap_item_D16: value.cap_item_D16,
              tpy_rate_D16: (Number(value.tpy_rate_D16.replace('%', '')) / 100).toFixed(2),
              cap_item_D17: value.cap_item_D17,
              tpy_rate_D17: (Number(value.tpy_rate_D17.replace('%', '')) / 100).toFixed(2),
              pod_status: value.pod_status,
            }))
          );
          this.messageService.successBubble('上傳成功');
        } else {
          this.messageService.errorBubble(data.Errors[0], '上傳失敗');
        }
        this.dealErrorFilePath(data);
        this.logger.debug(`上傳檔案結果:`, [file]);
      }),
      finalize(() => this.fileUploadLoading.set(!1))
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
    this.logger.debug(`dealErrorFilePath:`, [path, this.TLS26080Detail()]);
    if (!path || data.Success || !data.ErrorCount) return;
    window.open(`${apiUrl}${path}`, '_blank', 'noopener noreferrer');
    // this.http.get(`${apiUrl}${path}`, { resType: 'blob' }).pipe(
    //   take(1),
    //   tap(res => {
    //     // 建立下載連結
    //     const url = window.URL.createObjectURL(res);
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.download = path.split('/').pop() || 'error_file.xlsx';
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    //     window.URL.revokeObjectURL(url);
    //   }),
    //   catchError(error => this.errorHandler.handleError(error)),
    //   finalize(() => this.logger.debug(`錯誤檔案下載`))
    // ).subscribe();
  }

  public downloadXLSXExample(): void {
    this.exampleDownLoading.set(!0);
    this.http.get(`${apiUrl}/TLS0000/TLS2000/downloadTLS26080Template`, { responseType: 'blob' }).pipe(
      take(1),
      tap(res => {
        // 建立下載連結
        const url = window.URL.createObjectURL(res);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'TLS26080_範例檔案.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.logger.debug(`範例下載`);
      }),
      finalize(() => this.exampleDownLoading.set(!1))
    ).subscribe();
  }

  public getTLTTalentOptions(): void {
    this.dropdown.queryTltTalent().pipe(
      take(1),
      tap(options => {
        this.tltTalentOptions.set(options?.map(d => ({
          label: d['Name'],
          value: d['No'],
          templateLabel: `${d['No']} - ${d['Name']}`,
        })) ?? []);
        this.logger.debug(`getTLTTalentOptions:`, [options]);
      })
    ).subscribe();
  }

  public getTLTTalentChargeOptions(talent_id: string): void {
    this.dropdown.queryTltTalentCharge({ talent_id: Number(talent_id) }).pipe(
      take(1),
      tap(options => {
        this.tltTalentChargeMap.set(talent_id, options?.map(d => ({
          label: d.tlt_id_desc,
          value: d.tlt_id,
          templateLabel: `${d.tlt_id} - ${d.tlt_id_desc}`,
        })) ?? []);
        this.logger.debug(`getTLTTalentChargeOptions:`, [options]);
      })
    ).subscribe();
  }

  public keyInTLS26080(data: TLS26080Detail): void {
    this.http.post<TLS26080UploadResponse>(`${apiUrl}/TLS0000/TLS2000/keyInTLS26080`, {
      queryTLS26080_DetailResponses: this.TLS26080Detail(),
      keyInTLS26080: data,
    }).pipe(
      take(1),
      tap(res => {
        const d = res.Data;
        if (!d.Success) {
          this.dealErrorFilePath(d);
          this.TLS26080Detail.update(v => v.filter(i => i.id !== data.id)); // 更新參照
          this.logger.debug(`keyInTLS26080 fail:`, [res, this.TLS26080Detail()]);
          this.messageService.errorBox(res.Message || '鍵入失敗');
        } else {
          this.TLS26080Detail.update(val => [data, ...val.filter(i => i.id !== data.id)]);
          this.logger.debug(`keyInTLS26080 success:`, [res, this.TLS26080Detail()]);
        }
      }),
      finalize(() => this.logger.debug(`單筆鍵入檢查:`, [data]))
    ).subscribe();
  }
}
