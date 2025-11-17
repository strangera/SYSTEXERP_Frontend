import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { ASS2100ENGMeterType, ASS21010Data, ASS21010Delete, ASS21010Payload, ASS21010UpdateStatus, EngType } from '@pages/ass/ass21010/ass21010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import saveAs from 'file-saver';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.ApiUrl}`;

export interface ENG1002DropdownOption {
  LOCATION_No: string;
  LOCATION_Name: string;
  NET_SPACE: number;
}

@Injectable({ providedIn: 'root' })
export class ASS21010Service {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  public readonly engTypeOptions: Option[] = [
    { value: EngType.水, label: '水錶' },
    { value: EngType.電, label: '電錶' },
    { value: EngType.瓦斯, label: '瓦斯錶' },
  ];
  public readonly engMeterNoOptions = signal<ASS2100ENGMeterType[]>([]);
  public readonly locationOptions = signal<ENG1002DropdownOption[]>([]);

  /** 能源類型對應表 */
  public readonly engTypeMap = new Map<string, EngType>([
    ['水錶', EngType.水],
    ['電錶', EngType.電],
    ['瓦斯錶', EngType.瓦斯],
    ['G01', EngType.水],
    ['G02', EngType.電],
    ['G03', EngType.瓦斯],
  ]);
  /** 錶號應表 */
  public readonly engMeterNoMap = computed(() =>
    new Map(this.engMeterNoOptions().map(item => [item.ENG_MeterNo, item]))
  );

  public engMeterNoLoading = signal<boolean>(!1);
  public locationLoading = signal<boolean>(!1);
  public tableLoading = signal<boolean>(!1);
  public exportLoading = signal<boolean>(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly notification: NotificationService,
    private readonly logger: NGXLogger,
  ) { }

  public loadEngMeterNo(type?: EngType): void {
    this.engMeterNoLoading.set(!0);
    this.http.post<BaseQueryResponse<ASS2100ENGMeterType>>(`${apiUrl}/Share/queryENG1001_ENG_MeterNo_DropDownList`, { type }).pipe(
      take(1),
      tap(res => {
        this.engMeterNoOptions.set(res.Data);
        this.logger.debug('查詢EngMeterNo結果:', [res]);
      }),
      finalize(() => this.engMeterNoLoading.set(!1))
    ).subscribe();
  };

  public loadLocationNo(): void {
    this.locationLoading.set(true);
    this.http.post<any>(`${apiUrl}/Share/queryENG1002_DropDownList`, {}).pipe(
      take(1),
      tap(res => {
        this.logger.debug('查詢Location原始回應:', res);
        // 根據實際回傳結構調整
        const data = res.Data || res || [];
        this.locationOptions.set(data);
        this.logger.debug('查詢Location結果:', [this.locationOptions()]);
      }),
      finalize(() => {
        this.logger.debug('loadLocationNo finalize');
        this.locationLoading.set(false);
      })
    ).subscribe({
      error: (err) => {
        this.logger.error('查詢Location失敗:', err);
        this.notification.errorBubble('查詢設備位置失敗');
      }
    });
  }

  public loadASS21010(payload: ASS21010Payload): Observable<Omit<BaseQueryResponse<unknown>, 'Data'> & { Data: { Data: ASS21010Data[]; TotalCount: number; }; }> {
    this.tableLoading.set(!0);
    return this.http.post<Omit<BaseQueryResponse<unknown>, 'Data'> & { Data: { Data: ASS21010Data[]; TotalCount: number; }; }>(`${apiUrl}/ASS0000/ASS2000/QueryASS21010`, payload).pipe(
      take(1),
      tap(response => this.logger.debug('查詢ASS21010結果:', [response])),
      finalize(() => this.tableLoading.set(!1)),
    );
  }

  public updateASS21010(payload: ASS21010Payload): Observable<ASS21010UpdateStatus> {
    this.tableLoading.set(!0);
    return this.http.post<ASS21010UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/updateASS21010`, payload).pipe(
      take(1),
      tap(res => {
        if (res.Status === '0000') this.notification.successBubble('更新成功');
        this.logger.debug('更新ASS21010結果:', [res]);
      }),
      finalize(() => this.tableLoading.set(!1)),
    );
  }

  public deleteASS21010(payload: ASS21010Delete): Observable<ASS21010UpdateStatus> {
    this.tableLoading.set(!0);
    return this.http.post<ASS21010UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/deleteASS21010`, payload).pipe(
      take(1),
      tap(res => {
        if (res.Status === '0000') this.notification.successBubble('刪除成功');
        this.logger.debug('刪除ASS21010結果:', [res]);
      }),
      finalize(() => this.tableLoading.set(!1)),
    );
  }

  public export(type: 'PDF' | 'Excel', payload: any): void {
    this.exportLoading.set(!0);

    const contentType = 'PDF' === type ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = 'PDF' === type ? 'pdf' : 'xlsx';
    const endpoint = 'PDF' === type ? 'exportPDF' : 'exportExcel';

    const httpOptions = {
      responseType: 'blob' as 'blob',
      observe: 'response' as 'response',
    };

    this.http.post(`${apiUrl}/${endpoint}`, payload, httpOptions).pipe(
      take(1),
      tap(res => {
        this.logger.debug(`onExport ${type} response:`, [res]);
        if (res.body && res.body.size > 0) {
          const contentDisposition = res.headers.get('content-disposition');
          let filename = `${payload.file_name}.${fileExtension}`;

          if (contentDisposition) {
            const filenameRegex = /filename\*=UTF-8''([^;]+)|filename="([^"]+)"|filename=([^;]+)/;
            const matches = contentDisposition.match(filenameRegex);
            if (matches) {
              filename = matches[1] || matches[2] || matches[3] || filename;
              if (matches[1]) {
                filename = decodeURIComponent(filename);
              }
              filename = filename.replace(/["']/g, '');
            }
          }

          const blob = new Blob([res.body], { type: contentType });
          saveAs(blob, filename);
          this.notification.successBubble(type, '檔案下載完成');
        } else {
          this.notification.errorBubble(type, '檔案下載失敗，無資料');
        }
      }),
      finalize(() => this.exportLoading.set(!1))
    ).subscribe();
  }
}
