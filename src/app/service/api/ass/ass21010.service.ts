import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ASS2100ENGMeterType, ASS21010Data, ASS21010Delete, ASS21010Payload, ASS21010UpdateStatus, EngType } from '@pages/ass/ass21010/ass21010.model';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import saveAs from 'file-saver';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subject, finalize, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21010Service implements OnDestroy {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  public readonly ASS21010Data = signal<ASS21010Data[]>([]);
  public readonly totalRecords = signal<number>(0);

  public readonly engTypeSignal = signal<DropdownOption[]>([
    { No: EngType.水, Name: '水錶' },
    { No: EngType.電, Name: '電錶' },
    { No: EngType.瓦斯, Name: '瓦斯錶' },
  ]);
  public readonly engMeterNoSignal = signal<ASS2100ENGMeterType[]>([]);
  public readonly locationSignal = signal<DropdownOption[]>([]);

  public engMeterNoLoading = signal<boolean>(!1);
  public locationLoading = signal<boolean>(!1);
  public tableLoading = signal<boolean>(!1);
  public exportLoading = signal<boolean>(!1);

  private readonly engTypeCancel$ = new Subject<void>();
  private readonly engMeterNoCancel$ = new Subject<void>();
  private readonly locationCancel$ = new Subject<void>();
  private readonly tableCancel$ = new Subject<void>();

  constructor(
    private readonly http: HttpClient,
    // private readonly messageService: NotificationService,
    private readonly logger: NGXLogger,
  ) { }

  public loadEngMeterNo(type?: EngType): void {
    this.engMeterNoCancel$.next();
    this.engMeterNoLoading.set(!0);
    this.http.post<BaseQueryResponse<ASS2100ENGMeterType>>(`${apiUrl}/Share/queryENG1001_ENG_MeterNo_DropDownList`, { type }).pipe(
      take(1),
      takeUntil(this.engMeterNoCancel$),
      tap(response => this.engMeterNoSignal.set(response.Data)),
      finalize(() => {
        this.engMeterNoLoading.set(!1);
        this.logger.debug('查詢EngMeterNo結果:', [this.engMeterNoSignal()]);
      })
    ).subscribe();
  };

  public loadLocationNo(): void {
    this.locationCancel$.next();
    this.locationLoading.set(!0);
    this.http.post<any>(`${apiUrl}/queryPOS2002_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.locationCancel$),
      tap(response => this.locationSignal.set(response.Data)),
      finalize(() => {
        this.locationLoading.set(!1);
        this.logger.debug('查詢Location結果:', [this.locationSignal()]);
      })
    ).subscribe();
  };

  public loadASS21010(payload: ASS21010Payload): void {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    this.http.post<Omit<BaseQueryResponse<unknown>, 'Data'> & { Data: { Data: ASS21010Data[]; TotalCount: number; }; }>(`${apiUrl}/ASS0000/ASS2000/QueryASS21010`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(response => this.totalRecords.set(response.Data.TotalCount || 0)),
      tap(response => this.ASS21010Data.set(response.Data.Data)),
      finalize(() => this.tableLoading.set(!1)),
    ).subscribe();
  }

  public updateASS21010(payload: ASS21010Payload): Observable<ASS21010UpdateStatus> {
    return this.http.post<ASS21010UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/updateASS21010`, payload).pipe(
      take(1),
    );
  }

  public deleteASS21010(payload: ASS21010Delete): Observable<ASS21010UpdateStatus> {
    return this.http.post<ASS21010UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/deleteASS21010`, payload).pipe(
      take(1),
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
      tap(response => {
        this.logger.debug(`onExport ${type} response:`, [response]);
        if (response.body && response.body.size > 0) {
          const contentDisposition = response.headers.get('content-disposition');
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

          const blob = new Blob([response.body], { type: contentType });
          saveAs(blob, filename);
          // this.messageService.successBubble(`${type} Export successful`);
        } else {
          // this.messageService.errorBubble(`Response body is empty!`, `${type} Export Fail`);
        }
      }),
      finalize(() => this.exportLoading.set(!1))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.engTypeCancel$.next();
    this.engMeterNoCancel$.next();
    this.locationCancel$.next();
    this.tableCancel$.next();
  }
}
