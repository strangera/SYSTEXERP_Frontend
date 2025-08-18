import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { IPOS2002LocationItem } from '@service/utility/dropDownList.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { catchError, finalize, of, Subject, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21010Service implements OnDestroy {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  public readonly ASS21010Data = signal<unknown[]>([]);
  public readonly ASS21010Detail = signal<unknown[]>([]);
  public readonly engTypeSignal = signal<DropdownOption[]>([]);
  public readonly engMeterNoSignal = signal<DropdownOption[]>([]);
  public readonly locationSignal = signal<IPOS2002LocationItem[]>([]);

  public engTypeLoading = !1;
  public engMeterNoLoading = !1;
  public locationLoading = !1;
  public tableLoading = !1;

  private readonly engTypeCancel$ = new Subject<void>();
  private readonly engMeterNoCancel$ = new Subject<void>();
  private readonly locationCancel$ = new Subject<void>();
  private readonly tableCancel$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  public loadEngType(): void {
    this.engTypeCancel$.next();
    this.engTypeLoading = !0;
    of(engTypeMock).pipe(
      take(1),
      tap(response => this.engTypeSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.engTypeLoading = !1;
        console.log('查詢EngType結果:', [this.engTypeSignal()]);
      })
    ).subscribe();
  };

  public loadEngMeterNo(types: EngType[]): void {
    this.engMeterNoCancel$.next();
    this.engMeterNoLoading = !0;
    of(engMeterNoMock).pipe(
      take(1),
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
      tap(response => this.locationSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.locationLoading = !1;
        console.log('查詢Location結果:', [this.locationSignal()]);
      })
    ).subscribe();
  };

  /** 取資料 */
  public loadASS21010(query: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/ASS0000/ASS2000/queryASS21010`, query).pipe(
      take(1),
      tap(response => this.ASS21010Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢結果:', [this.ASS21010Data()]);
      })
    ).subscribe();
  };

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

export const engTypeMock: BaseQueryResponse<DropdownOption> = {
  Status: 'success',
  Data: [
    { No: EngType.水, Name: '水' },
    { No: EngType.電, Name: '電' },
    { No: EngType.瓦斯, Name: '瓦斯' },
  ],
  Error: undefined,
  Meta: undefined,
  Message: '查詢成功',
  TotalCount: 3,
  TotalPage: 1,
};
export const engMeterNoMock: BaseQueryResponse<DropdownOption> = {
  Status: 'success',
  Data: [
    { No: 'AB001', Name: 'AB001' },
    { No: 'AB002', Name: 'AB002' },
    { No: 'AB003', Name: 'AB003' },
  ],
  Error: undefined,
  Meta: undefined,
  Message: '查詢成功',
  TotalCount: 3,
  TotalPage: 1,
};
