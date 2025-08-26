
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ASS2100ENGMeterType, ASS21010Payload, ASS21010UpdateStatus } from '@pages/ass/ass21010/ass21010.model';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { Subject, catchError, finalize, of, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21010Service implements OnDestroy {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  public readonly ASS21010Detail = signal<unknown[]>([]);
  public readonly engTypeSignal = signal<DropdownOption[]>([]);
  public readonly engMeterNoSignal = signal<ASS2100ENGMeterType[]>([]);
  public readonly locationSignal = signal<DropdownOption[]>([]);

  public engMeterNoLoading = !1;
  public locationLoading = !1;
  public tableLoading = !1;

  private readonly engTypeCancel$ = new Subject<void>();
  private readonly engMeterNoCancel$ = new Subject<void>();
  private readonly locationCancel$ = new Subject<void>();
  private readonly tableCancel$ = new Subject<void>();

  constructor(
    private readonly http: HttpClient,
    private readonly errorHandler: ErrorHandlerService,
    private readonly messageService: NotificationService,
  ) { }

  public loadEngType(): void {
    this.engTypeCancel$.next();
    this.engTypeSignal.set([
      { No: EngType.水, Name: '水錶' },
      { No: EngType.電, Name: '電錶' },
      { No: EngType.瓦斯, Name: '瓦斯錶' },
    ]);
  };

  public loadEngMeterNo(type?: EngType): void {
    this.engMeterNoCancel$.next();
    this.engMeterNoLoading = !0;
    this.http.post<BaseQueryResponse<ASS2100ENGMeterType>>(`${apiUrl}/Share/queryENG1001_ENG_MeterNo_DropDownList`, { type }).pipe(
      take(1),
      takeUntil(this.engMeterNoCancel$),
      tap(response => this.engMeterNoSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.engMeterNoLoading = !1;
        console.log('查詢EngMeterNo結果:', [this.engMeterNoSignal()]);
      })
    ).subscribe();
  };

  public loadLocationNo(): void {
    this.locationCancel$.next();
    this.locationLoading = !0;
    this.http.post<any>(`${apiUrl}/queryPOS2002_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.locationCancel$),
      tap(response => this.locationSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.locationLoading = !1;
        console.log('查詢Location結果:', [this.locationSignal()]);
      })
    ).subscribe();
  };

  public updateASS21010(payload: ASS21010Payload): void {
    this.http.post<ASS21010UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/updateASS21010`, payload).pipe(
      take(1),
      tap(response => {
        if (response.Data.IsUpdateSuccess) this.messageService.successBubble('更新成功');
        else this.messageService.errorBox('更新失敗\n' + response.Data.ErrorMsg);
      }),
      catchError(error => this.errorHandler.handleError(error))
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.engTypeCancel$.next();
    this.engMeterNoCancel$.next();
    this.locationCancel$.next();
    this.tableCancel$.next();
  }
}

export enum EngType {
  水 = 'G01',
  電 = 'G02',
  瓦斯 = 'G03',
}
