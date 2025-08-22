import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ASS2100ENGMeterType } from '@pages/ass/ass21010/ass21010.model';
import { ASS21020Data, ASS21020Payload, TLTByFlag } from '@pages/ass/ass21020/ass21020.model';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { IPOS2002LocationItem } from '@service/utility/dropDownList.service';
import { BaseQueryRequest, BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { catchError, finalize, of, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { EngType } from './ass21010.service';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21020Service implements OnDestroy {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  // 儲存資料
  public readonly ASS21020Data = signal<ASS21020Data[]>([]);
  public readonly ASS21020Detail = signal<unknown[]>([]);
  public readonly queryByTltNoData = signal<unknown[]>([]);
  public readonly engTypeSignal = signal<DropdownOption[]>([]);
  public readonly engMeterNoSignal = signal<ASS2100ENGMeterType[]>([]);
  public readonly locationSignal = signal<IPOS2002LocationItem[]>([]);
  public readonly tltNoSignal = signal<TLTByFlag[]>([]);
  public readonly engRateSignal = signal<number>(0);

  public engTypeLoading = !1;
  public engMeterNoLoading = !1;
  public locationLoading = !1;
  public tltNoLoading = !1;
  public tableLoading = !1;
  public queryByMeterNoLoading = !1;
  public queryByTltNoLoading = !1;

  private readonly engTypeCancel$ = new Subject<void>();
  private readonly engMeterNoCancel$ = new Subject<void>();
  private readonly locationCancel$ = new Subject<void>();
  private readonly tableCancel$ = new Subject<void>();
  private readonly queryByMeterNoCancel$ = new Subject<void>();
  private readonly queryByTltNoCancel$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
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

  /** 取資料 */
  public loadASS21020(query: BaseQueryRequest & ASS21020Payload): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<ASS21020Data>>(`${apiUrl}/ASS0000/ASS2000/queryASS21020`, query).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(response => this.ASS21020Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢ASS21020結果:', [this.ASS21020Data()]);
      })
    ).subscribe();
  };

  public loadASS21020Detail(query: BaseQueryRequest & ASS21020Payload): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<ASS21020Data>>(`${apiUrl}/ASS0000/ASS2000/queryASS21020Detail`, query).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(response => this.ASS21020Detail.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢ASS21020Detail結果:', [this.ASS21020Detail()]);
      })
    ).subscribe();
  };

  public queryByMeterNo(ENG_MeterNo: string): void {
    this.queryByMeterNoCancel$.next();
    this.queryByMeterNoLoading = !0;
    this.http.post<BaseQueryResponse<TLTByFlag>>(`${apiUrl}/Share/queryTLTTALENTByFlag_DropDownList`, { ENG_MeterNo }).pipe(
      take(1),
      takeUntil(this.queryByMeterNoCancel$),
      tap(response => this.tltNoSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.queryByMeterNoLoading = !1;
        console.log('查詢queryByMeterNo結果:', [this.tltNoSignal()]);
      })
    ).subscribe();
  }

  public queryByTltNo(tlt_no: string): void {
    this.queryByTltNoCancel$.next();
    this.queryByTltNoLoading = !0;
    this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/ASS0000/ASS2000/queryByTltNo`, { tlt_no }).pipe(
      take(1),
      takeUntil(this.queryByTltNoCancel$),
      tap(response => this.queryByTltNoData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.queryByTltNoLoading = !1;
        console.log('查詢queryByTltNo結果:', [this.queryByTltNoData()]);
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.engTypeCancel$.next();
    this.engMeterNoCancel$.next();
    this.locationCancel$.next();
    this.tableCancel$.next();
  }
}
