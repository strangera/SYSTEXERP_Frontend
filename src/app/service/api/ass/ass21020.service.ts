import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { ASS2100ENGMeterType, EngType } from '@pages/ass/ass21010/ass21010.model';
import { ASS21020Data, ASS21020Delete, ASS21020Query, ASS21020Update, ASS21020UpdateStatus, TLTByFlag } from '@pages/ass/ass21020/ass21020.model';
import { Option } from '@service/utility/dropdown-api.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl + '/ASS0000/ASS2000';

@Injectable({ providedIn: 'root' })
export class ASS21020Service {

  public readonly ASS21020Data = signal<ASS21020Data[]>([]);
  public readonly engMeterNoData = signal<ASS2100ENGMeterType[]>([]);
  public readonly tltNoData = signal<TLTByFlag[]>([]);

  /** 能源類型下拉選單 */
  public readonly engTypeOptions: Option[] = [
    { value: EngType.水, label: '水錶' },
    { value: EngType.電, label: '電錶' },
    { value: EngType.瓦斯, label: '瓦斯錶' },
  ];

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
    new Map(this.engMeterNoData().map(item => [item.ENG_MeterNo, item]))
  );
  /** 專櫃編號應表 */
  public readonly tltByFlagMap = computed(() =>
    new Map(this.tltNoData().map(item => [item.TLT_No, item]))
  );

  public readonly tableLoading = signal<boolean>(!1);
  public readonly engMeterNoLoading = signal<boolean>(!1);
  public readonly tltByFlagLoading = signal<boolean>(!1);


  public readonly totalRecords = signal<number>(0);

  constructor(
    private http: HttpClient,
    private logger: NGXLogger,
  ) { }

  public loadASS21020(query: ASS21020Query): Observable<BaseQueryResponse<ASS21020Data>> {
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<ASS21020Data>>(`${apiUrl}/queryASS21020`, query).pipe(
      take(1),
      tap(({ TotalCount }) => this.totalRecords.set(TotalCount || 0)),
      tap(({ Data }) => this.ASS21020Data.set(Data.map((item, index) => ({ ...item, Id: index + 1 })))),
      tap(res => this.logger.debug(`查詢ASS21020結果:`, [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  };

  public updateASS21020(payload: ASS21020Update[]): Observable<ASS21020UpdateStatus> {
    this.tableLoading.set(!0);
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/updateASS21020`, { UpdateASS21020Datas: payload }).pipe(
      take(1),
      tap(res => this.logger.debug(`更新ASS21020結果:`, [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public deleteASS21020(payload: ASS21020Delete): Observable<ASS21020UpdateStatus> {
    this.tableLoading.set(!0);
    return this.http.post<ASS21020UpdateStatus>(`${apiUrl}/deleteASS21020`, payload).pipe(
      take(1),
      tap(() => this.logger.debug(`刪除ASS21020結果:`, [payload])),
      finalize(() => this.tableLoading.set(!1))
    );
  }

  public getEngMeterNos(): void {
    this.engMeterNoLoading.set(!0);
    this.http.post<BaseQueryResponse<ASS2100ENGMeterType>>(`${environment.ApiUrl}/Share/queryENG1001_ENG_MeterNo_DropDownList`, {}).pipe(
      take(1),
      tap(res => this.engMeterNoData.set(res.Data)),
      tap(res => this.logger.debug(`查詢EngMeterNo結果:`, [res])),
      finalize(() => this.engMeterNoLoading.set(!1))
    ).subscribe();
  };

  public getTltByFlags(ENG_MeterNo: string, MID: number): void {
    this.tltByFlagLoading.set(!0);
    this.http.post<BaseQueryResponse<TLTByFlag>>(`${environment.ApiUrl}/Share/queryTLTTALENTByFlag_DropDownList`, { MID, ENG_MeterNo }).pipe(
      take(1),
      tap(res => this.tltNoData.set(res.Data)),
      tap(res => this.logger.debug(`查詢TltByFlag參數:`, [res])),
      finalize(() => this.tltByFlagLoading.set(!1))
    ).subscribe();
  }
}
