import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, signal } from '@angular/core';
import { ASS2100ENGMeterType } from '@pages/ass/ass21010/ass21010.model';
import { ASS21020Data, ASS21020Delete, ASS21020Query, ASS21020Update, ASS21020UpdateStatus, TLTByFlag } from '@pages/ass/ass21020/ass21020.model';
import { EngType } from '@service/api/ass/ass21010.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21020Service implements OnDestroy {

  private static arrShallowEqual<T>(a: readonly T[], b: readonly T[]): boolean {
    if (a === b) return !0;
    if (a.length !== b.length) return !1;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return !1;
    return !0;
  }

  // 儲存資料
  public readonly ASS21020Data = signal<ASS21020Data[]>([], { equal: ASS21020Service.arrShallowEqual });
  public readonly engTypeSignal = signal<DropdownOption[]>([], { equal: ASS21020Service.arrShallowEqual });
  public readonly engMeterNoSignal = signal<ASS2100ENGMeterType[]>([], { equal: ASS21020Service.arrShallowEqual });
  public readonly tltNoSignal = signal<TLTByFlag[]>([], { equal: ASS21020Service.arrShallowEqual });

  public readonly engTypeMap = new Map<string, EngType>([
    ['水錶', EngType.水],
    ['電錶', EngType.電],
    ['瓦斯錶', EngType.瓦斯]
  ]);
  public readonly engMeterNoMap = new Map<string, ASS2100ENGMeterType>();
  public readonly tltByFlagMap = new Map<string, TLTByFlag>();

  public readonly engMeterNoLoading = signal<boolean>(!1);
  public readonly tableLoading = signal<boolean>(!1);
  public readonly queryTltByFlagLoading = signal<boolean>(!1);

  private readonly engMeterNoCancel$ = new Subject<void>();
  private readonly tableCancel$ = new Subject<void>();
  private readonly queryTltByFlagCancel$ = new Subject<void>();

  public readonly totalRecords = signal<number>(0);

  constructor(
    private http: HttpClient,
    private logger: NGXLogger,
  ) { }

  public loadEngType(): void {
    this.engTypeSignal.set([
      { No: EngType.水, Name: '水錶' },
      { No: EngType.電, Name: '電錶' },
      { No: EngType.瓦斯, Name: '瓦斯錶' },
    ]);
  };

  public loadEngMeterNo(): void {
    this.engMeterNoCancel$.next();
    this.engMeterNoLoading.set(!0);
    this.http.post<BaseQueryResponse<ASS2100ENGMeterType>>(`${apiUrl}/Share/queryENG1001_ENG_MeterNo_DropDownList`, {}).pipe(
      take(1),
      takeUntil(this.engMeterNoCancel$),
      tap(({ Data }) => {
        this.engMeterNoSignal.set(Data);
        for (const item of Data) this.engMeterNoMap.set(item.ENG_MeterNo, item);
      }),
      finalize(() => {
        this.engMeterNoLoading.set(!1);
        this.logger.debug('查詢EngMeterNo結果:', [this.engMeterNoSignal()]);
      })
    ).subscribe();
  };

  /** 取資料 */
  public loadASS21020(query: ASS21020Query): void {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    this.http.post<BaseQueryResponse<ASS21020Data>>(`${apiUrl}/ASS0000/ASS2000/queryASS21020`, query).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(({ TotalCount, Data }) => this.totalRecords.set(TotalCount || 0)),
      tap(({ Data }) => this.ASS21020Data.set(Data.map((item, index) => ({ ...item, Id: index + 1 })))),
      finalize(() => {
        this.tableLoading.set(!1);
        this.logger.debug('查詢ASS21020結果:', [this.ASS21020Data()]);
      })
    ).subscribe();
  };

  public queryTltByFlag(ENG_MeterNo: string): void {
    this.queryTltByFlagCancel$.next();
    this.queryTltByFlagLoading.set(!0);
    this.http.post<BaseQueryResponse<TLTByFlag>>(`${apiUrl}/Share/queryTLTTALENTByFlag_DropDownList`, { MID: 0, ENG_MeterNo }).pipe(
      take(1),
      takeUntil(this.queryTltByFlagCancel$),
      tap(({ Data }) => {
        this.tltNoSignal.set(Data);
        for (const item of Data) this.tltByFlagMap.set(item.TLT_No, item);
      }),
      finalize(() => {
        this.queryTltByFlagLoading.set(!1);
        this.logger.debug('查詢queryTltByFlag結果:', [this.tltByFlagMap, this.tltNoSignal()]);
      })
    ).subscribe();
  }

  public updateASS21020(payload: ASS21020Update[]): Observable<ASS21020UpdateStatus['Data']> {
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/updateASS21020`, { UpdateASS21020Datas: payload }).pipe(
      take(1),
      map(({ Data }) => Data),
    );
  }

  public deleteASS21020(payload: ASS21020Delete): Observable<ASS21020UpdateStatus['Data']> {
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/ASS0000/ASS2000/deleteASS21020`, payload).pipe(
      take(1),
      map(({ Data }) => Data),
    );
  }

  ngOnDestroy(): void {
    this.engMeterNoCancel$.next();
    this.tableCancel$.next();
  }
}
