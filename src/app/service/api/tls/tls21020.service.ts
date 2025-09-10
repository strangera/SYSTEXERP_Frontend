import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { POS2013, TLS21020Data, TLS21020GLS1005Data, TLS21020GLS1005Query, TLS21020Query, TLS21020UpdateQuery } from '@pages/tls/tls21020/tls21020.model';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl: string = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class TLS21020Service {

  public readonly TLS21020Data = signal<TLS21020Data[]>([]);
  public readonly TLS21020GLS1005Data = signal<TLS21020GLS1005Data[]>([]);
  public readonly SYS3100Data = signal<any[]>([]);
  public readonly GLS1005Data = signal<DropdownOption[]>([]);
  public readonly POS2013Data = signal<POS2013[]>([]);

  private readonly GLS1005QuerySignal = signal<TLS21020GLS1005Query | null>(null);

  public dataLoading = !1;

  public readonly totalRecords = signal<number>(0);

  constructor(
    private http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public getEntryTypes(): DropdownOption[] {
    return [
      { No: 'SD', Name: '銷售日傳票' },
      { No: 'MR', Name: '租金傳票' },
      { No: 'MD', Name: '代扣傳票' },
      { No: 'PR', Name: '抽成傳票' },
      { No: 'PN', Name: '進貨帳款-暫估應付' },
      { No: 'PNC', Name: '進貨帳款-成本結轉' },
      { No: 'PT', Name: '進貨請款' },
    ];
  }

  public queryTLS21020(query: TLS21020Query): void {
    if (this.dataLoading) return void (this.dataLoading = !1);
    this.dataLoading = !0;
    this.http.post<BaseQueryResponse<TLS21020Data>>(apiUrl + '/TLS0000/TLS2000/queryTLS21020', query)
      .pipe(
        take(1),
        map(res => {
          res.Data = res.Data?.map(item => ({
            ...item,
            ObjectNo: item.ObjectNo || 'N',
          }));
          return res;
        }),
        tap(res => this.TLS21020Data.set(res.Data ?? [])),
        tap(res => this.totalRecords.set(res.Data?.length)),
        finalize(() => this.logger.debug(`TLS21020 Data:`, [this.TLS21020Data()])),
        finalize(() => this.dataLoading = !1),
      ).subscribe();
  }

  public queryTLS21020_GLS1005(query: TLS21020GLS1005Query): void {
    const lastQuery = this.GLS1005QuerySignal();
    if (lastQuery && lastQuery.AccDC === query.AccDC) return;

    this.GLS1005QuerySignal.set({ ...query });

    this.http.post<BaseQueryResponse<TLS21020GLS1005Data>>(apiUrl + '/TLS0000/TLS2000/queryTLS21020_GLS1005', query)
      .pipe(
        take(1),
        tap(res => this.TLS21020GLS1005Data.set(res.Data ?? [])),
        finalize(() => this.logger.debug(`TLS21020GLS1005 Data:`, [this.TLS21020GLS1005Data()])),
      ).subscribe();
  }

  public updateTLS21020(query: TLS21020UpdateQuery[]): void {
    this.http.post<BaseQueryResponse<unknown>>(apiUrl + '/TLS0000/TLS2000/updateTLS21020', { GLS1020Datas: query })
      .pipe(
        take(1),
        tap(res => { }),
        finalize(() => this.logger.debug(`updateTLS21020`, [])),
      ).subscribe();
  }

  public getOrgIDs(): void {
    this.http.post<BaseQueryResponse<DropdownOption>>(apiUrl + '/querySYS3100_DropDownList', {})
      .pipe(
        take(1),
        tap(res => this.SYS3100Data.set(res.Data ?? [])),
        finalize(() => this.logger.debug(`SYS3100 Data:`, [this.SYS3100Data()])),
      ).subscribe();
  }

  public getGLS1005s(): void {
    this.http.post<BaseQueryResponse<DropdownOption>>(apiUrl + '/queryGLS1005_DropDownList', {})
      .pipe(
        take(1),
        tap(res => this.GLS1005Data.set(res.Data ?? [])),
        finalize(() => this.logger.debug(`GLS1005 Data:`, [this.GLS1005Data()])),
      ).subscribe();
  }

  public getPOS2013s(): void {
    this.http.post<BaseQueryResponse<POS2013>>(apiUrl + '/queryPOS2013_DropDownList', {})
      .pipe(
        take(1),
        tap(res => this.POS2013Data.set(res.Data ?? [])),
        finalize(() => this.logger.debug(`POS2013 Data:`, [this.POS2013Data()])),
      ).subscribe();
  }
}
