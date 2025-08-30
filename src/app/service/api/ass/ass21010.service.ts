import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ASS2100ENGMeterType, ASS21010Data, ASS21010Delete, ASS21010Payload, ASS21010UpdateStatus } from '@pages/ass/ass21010/ass21010.model';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { NotificationService } from '@shared/component/notification-message/notification.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { Observable, Subject, catchError, finalize, map, of, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21010Service implements OnDestroy {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  public readonly ASS21010Data = signal<ASS21010Data[]>([]);
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

  public loadASS21010(payload: ASS21010Payload): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<Omit<BaseQueryResponse<unknown>, 'Data'> & { Data: { Data: ASS21010Data[]; TotalCount: number; }; }>(`${apiUrl}/ASS0000/ASS2000/QueryASS21010`, payload).pipe(
      take(1),
      tap(response => this.ASS21010Data.set(response.Data.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => this.tableLoading = !1),
    ).subscribe();
  }

  public updateASS21010(payload: ASS21010Payload): Observable<ASS21010UpdateStatus['Data']> {
    return this.http.post<ASS21010UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/updateASS21010`, payload).pipe(
      take(1),
      map(res => res.Data),
      catchError(error => this.errorHandler.handleError(error))
    );
  }

  public deleteASS21010(payload: ASS21010Delete): Observable<ASS21010UpdateStatus['Data']> {
    return this.http.post<ASS21010UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/deleteASS21010`, payload).pipe(
      take(1),
      map(res => res.Data),
      catchError(error => this.errorHandler.handleError(error))
    );
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
