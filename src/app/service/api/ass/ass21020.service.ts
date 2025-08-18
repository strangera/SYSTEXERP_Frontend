import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { IPOS2002LocationItem } from '@service/utility/dropDownList.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { catchError, finalize, of, Subject, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { engMeterNoMock, EngType, engTypeMock } from './ass21010.service';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21020Service implements OnDestroy {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  // 儲存資料
  public readonly ASS21020Data = signal<unknown[]>([]);
  public readonly ASS21020Detail = signal<unknown[]>([]);
  public readonly queryByMeterNoData = signal<unknown[]>([]);
  public readonly queryByTltNoData = signal<unknown[]>([]);
  public readonly engTypeSignal = signal<DropdownOption[]>([]);
  public readonly engMeterNoSignal = signal<DropdownOption[]>([]);
  public readonly locationSignal = signal<IPOS2002LocationItem[]>([]);
  public readonly tltNoSignal = signal<DropdownOption[]>([]);
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
    // this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/ASS0000/ASS2000/loadEngMeterNo`, { types }).pipe(
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
  public loadASS21020(query: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/ASS0000/ASS2000/queryASS21020`, query).pipe(
      take(1),
      tap(response => this.ASS21020Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢ASS21020結果:', [this.ASS21020Data()]);
      })
    ).subscribe();
  };

  public queryByMeterNo(eng_meterNo: string): void {
    this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/ASS0000/ASS2000/queryByMeterNo`, { eng_meterNo }).pipe(
      take(1),
      tap(response => this.queryByMeterNoData.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.queryByMeterNoLoading = !1;
        console.log('查詢queryByMeterNo結果:', [this.queryByMeterNoData()]);
      })
    ).subscribe();
  }

  public queryByTltNo(tlt_no: string): void {
    this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/ASS0000/ASS2000/queryByTltNo`, { tlt_no }).pipe(
      take(1),
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
