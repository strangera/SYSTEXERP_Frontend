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

/** 錶號位置資訊 */
export interface ENG1001Location {
  Mid: number;
  SYS_StoreNo: string;
  ENG_Type: string;
  ENG_MeterNo: string;
  Location_No: string;
  Building_No: string;
  Building_Desc: string;
  Floor_No: string;
  Floor_Desc: string;
  Draw_X: number | null;
  Draw_Y: number | null;
  NET_SPACE: number | null;
}

/** 未設定專櫃清單 */
export interface TLTUnset {
  TLT_No: string;
  TLT_Name: string;
  TLT_bdate: string | null;
  TLT_edate: string | null;
  Water_Flag: string;
  Electric_Flag: string;
  Gas_Flag: string;
  Apply_No: string;
}

@Injectable({ providedIn: 'root' })
export class ASS21020Service {

  /** 能源類型下拉選單 */
  public readonly engTypeOptions: Option[] = [
    { value: EngType.水, label: '水錶' },
    { value: EngType.電, label: '電錶' },
    { value: EngType.瓦斯, label: '瓦斯錶' },
  ];
  public readonly engMeterNoOptions = signal<ASS2100ENGMeterType[]>([]);
  public readonly tltNoOptions = signal<TLTByFlag[]>([]);

  /** 未設定專櫃清單  */
  public readonly tltUnsetOptions = signal<TLTUnset[]>([]);

  /** 當前錶號的位置資訊*/
  public readonly currentLocationInfo = signal<ENG1001Location | null>(null);

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

  /** 專櫃編號應表 */
  public readonly tltByFlagMap = computed(() =>
    new Map(this.tltNoOptions().map(item => [item.TLT_No, item]))
  );

  /** 未設定專櫃編號應表  */
  public readonly tltUnsetMap = computed(() =>
    new Map(this.tltUnsetOptions().map(item => [item.TLT_No, item]))
  );

  public readonly tableLoading = signal<boolean>(!1);
  public readonly engMeterNoLoading = signal<boolean>(!1);
  public readonly tltByFlagLoading = signal<boolean>(!1);
  public readonly locationLoading = signal<boolean>(!1);
  public readonly tltUnsetLoading = signal<boolean>(!1);

  constructor(
    private http: HttpClient,
    private logger: NGXLogger,
  ) { }

  public loadASS21020(query: ASS21020Query): Observable<BaseQueryResponse<ASS21020Data>> {
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<ASS21020Data>>(`${apiUrl}/queryASS21020`, query).pipe(
      take(1),
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
      tap(res => this.engMeterNoOptions.set(res.Data)),
      tap(res => this.logger.debug(`查詢EngMeterNo結果:`, [res])),
      finalize(() => this.engMeterNoLoading.set(!1))
    ).subscribe();
  };

  public getTltByFlags(ENG_MeterNo: string, MID: number, ENG_Types: string[]): void {
    this.tltByFlagLoading.set(!0);
    this.http.post<BaseQueryResponse<TLTByFlag>>(
      `${environment.ApiUrl}/Share/queryTLTTALENTByFlag_DropDownList`,
      { MID, ENG_MeterNo, ENG_Types }
    ).pipe(
      take(1),
      tap(res => this.tltNoOptions.set(res.Data)),
      tap(res => this.logger.debug(`查詢TltByFlag參數:`, [res])),
      finalize(() => this.tltByFlagLoading.set(!1))
    ).subscribe();
  }

  /**
   * 取得錶號位置資訊
   * 當選擇錶號後，帶出位置、建築、樓層等資訊
   */
  public getENG1001Location(ENG_MeterNo: string, MID: number, ENG_Type: string): Observable<BaseQueryResponse<ENG1001Location>> {
    this.locationLoading.set(!0);
    return this.http.post<BaseQueryResponse<ENG1001Location>>(
      `${environment.ApiUrl}/Share/queryENG1001Location_DropDownList`,
      { MID, ENG_MeterNo, ENG_Type }
    ).pipe(
      take(1),
      tap(res => {
        // 儲存位置資訊供表格使用
        if (res.Data && res.Data.length > 0) {
          this.currentLocationInfo.set(res.Data[0]);
        }
      }),
      tap(res => this.logger.debug(`查詢錶號位置資訊:`, [res])),
      finalize(() => this.locationLoading.set(!1))
    );
  }

  /**
   * 取得未設定抄表的專櫃清單
   * 當選擇錶號後，取得可以分配給該錶號的專櫃清單
   */
  public getTLTUnset(ENG_MeterNo: string, MID: number, ENG_Type: string): void {
    this.tltUnsetLoading.set(!0);
    this.http.post<BaseQueryResponse<TLTUnset>>(
      `${environment.ApiUrl}/Share/queryTLTTALENTUnset_DropDownList`,
      { MID, ENG_MeterNo, ENG_Type }
    ).pipe(
      take(1),
      tap(res => this.tltUnsetOptions.set(res.Data)),
      tap(res => this.logger.debug(`查詢未設定專櫃清單:`, [res])),
      finalize(() => this.tltUnsetLoading.set(!1))
    ).subscribe();
  }
}
