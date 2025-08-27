import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ASS2100ENGMeterType } from '@pages/ass/ass21010/ass21010.model';
import { ASS21020Data, ASS21020Payload, QueryTLTPayload, TLTByFlag } from '@pages/ass/ass21020/ass21020.model';
import { EngType } from '@service/api/ass/ass21010.service';
import { ErrorHandlerService } from '@service/system/error-handler.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { catchError, finalize, of, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21020Service implements OnDestroy {

  public readonly isRowSelectable = (rowData: unknown) =>
    !!rowData;
  // (Reflect.has(rowData, 'CanDelete') && rowData.CanDelete == '1') || rowData.pod_status === ApprovalStatus.未核准;

  // 儲存資料
  public readonly ASS21020Data = signal<ASS21020Data[]>([]);
  public readonly engTypeSignal = signal<DropdownOption[]>([]);
  public readonly engMeterNoSignal = signal<ASS2100ENGMeterType[]>([]);
  public readonly locationSignal = signal<string>('');
  public readonly engMeterNoDropdownSignal = signal<DropdownOption[]>([]);
  public readonly tltDropdownSignal = signal<DropdownOption[]>([]);

  public readonly engMeterNoMap = new Map<string, ASS2100ENGMeterType>();
  public readonly tltByFlagMap = new Map<string, TLTByFlag>();

  public engMeterNoLoading = !1;
  public locationLoading = !1;
  public tableLoading = !1;
  public queryTltByFlagLoading = !1;

  private readonly engTypeCancel$ = new Subject<void>();
  private readonly engMeterNoCancel$ = new Subject<void>();
  private readonly locationCancel$ = new Subject<void>();
  private readonly tableCancel$ = new Subject<void>();
  private readonly queryTltByFlagCancel$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService,
  ) { }

  public loadEngType(): void {
    this.engTypeCancel$.next();
    this.engTypeSignal.set([
      { No: EngType.水, Name: '水錶' },
      { No: EngType.電, Name: '電錶' },
      { No: EngType.瓦斯, Name: '瓦斯錶' },
    ]);
  };

  public loadEngMeterNo(): void {
    this.engMeterNoCancel$.next();
    this.engMeterNoLoading = !0;
    this.http.post<BaseQueryResponse<ASS2100ENGMeterType>>(`${apiUrl}/Share/queryENG1001_ENG_MeterNo_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.engMeterNoCancel$),
      tap(response => {
        this.engMeterNoSignal.set(response.Data);
        !this.tltByFlagMap.size && this.queryTltByFlag(response.Data[0]?.ENG_MeterNo);
        this.engMeterNoDropdownSignal.set(response.Data.map(v => ({ No: String(v.Id), Name: v.ENG_MeterNo + ' - ' + v.Location_No })));
        response.Data.forEach(item => this.engMeterNoMap.set(String(item.Id), item));
      }),
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
  public loadASS21020(query: ASS21020Payload): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<ASS21020Data>>(`${apiUrl}/ASS0000/ASS2000/queryASS21020`, query).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(response => this.ASS21020Data.set(response.Data
        .map(v => ({ ...v, EngType: EngType[v.ENG_Type as keyof typeof EngType], }))
      )),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢ASS21020結果:', [this.ASS21020Data()]);
      })
    ).subscribe();
  };

  public queryTltByFlag(ENG_MeterNo: string): void {
    this.queryTltByFlagCancel$.next();
    this.queryTltByFlagLoading = !0;
    this.http.post<BaseQueryResponse<TLTByFlag>>(`${apiUrl}/Share/queryTLTTALENTByFlag_DropDownList`, { MID: 0, ENG_MeterNo }).pipe(
      take(1),
      takeUntil(this.queryTltByFlagCancel$),
      tap(response => {
        response.Data.forEach(item => this.tltByFlagMap.set(item.TLT_No, item));
        this.tltDropdownSignal.set(response.Data.map(v => ({ Name: v.TLT_No + ' - ' + v.TLT_Name, No: v.TLT_No })));
      }),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.queryTltByFlagLoading = !1;
        console.log('查詢queryTltByFlag結果:', [this.tltByFlagMap, this.tltDropdownSignal()]);
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
