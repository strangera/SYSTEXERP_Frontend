import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { POS2013, TLS21020Data, TLS21020GLS1005Data, TLS21020GLS1005Query, TLS21020Query, TLS21020UpdateQuery } from '@pages/tls/tls21020/tls21020.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Sysb400Service } from '../sys/sysb400.service';

const apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({ providedIn: 'root' })
export class TLS21020Service {

  public readonly TLS21020Data = signal<TLS21020Data[]>([]);
  public readonly TLS21020GLS1005Data = signal<TLS21020GLS1005Data[]>([]);
  public readonly SYS3100Data = signal<Option[]>([]);
  public readonly GLS1005Data = signal<Option[]>([]);
  public readonly POS2013Data = signal<POS2013[]>([]);

  public readonly entryTypeMap = new Map<string, string>([
    ['SD', '銷售日傳票'],
    ['MR', '租金傳票'],
    ['MD', '代扣傳票'],
    ['PR', '抽成傳票'],
    ['PN', '進貨帳款-暫估應付'],
    ['PNC', '進貨帳款-成本結轉'],
    ['PT', '進貨請款'],
  ]);

  private readonly tableCancel$ = new Subject<void>();
  private readonly gls1005Cancel$ = new Subject<void>();
  private readonly pos2013Cancel$ = new Subject<void>();
  private readonly orgIdCancel$ = new Subject<void>();

  public readonly tableLoading = signal<boolean>(!1);
  public readonly gls1005Loading = signal<boolean>(!1);
  public readonly pos2013Loading = signal<boolean>(!1);
  public readonly orgIdLoading = signal<boolean>(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly sysb400: Sysb400Service,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public getEntryTypes(): Option[] {
    return [
      { value: 'SD', label: '銷售日傳票' },
      { value: 'MR', label: '租金傳票' },
      { value: 'MD', label: '代扣傳票' },
      { value: 'PR', label: '抽成傳票' },
      { value: 'PN', label: '進貨帳款-暫估應付' },
      { value: 'PNC', label: '進貨帳款-成本結轉' },
      { value: 'PT', label: '進貨請款' },
    ];
  }

  public getYNOptions(): Option[] {
    return [
      { value: 'Y', label: '是' },
      { value: 'N', label: '否' },
    ];
  }

  public queryTLS21020(query: TLS21020Query): Observable<BaseQueryResponse<TLS21020Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<TLS21020Data>>(`${apiUrl}/queryTLS21020`, query)
      .pipe(
        take(1),
        takeUntil(this.tableCancel$),
        map(res => {
          res.Data = res.Data?.map(item => ({
            ...item,
            ObjectNo: item.ObjectNo || 'N',
          }));
          return res;
        }),
        tap(res => this.TLS21020Data.set(res.Data ?? [])),
        finalize(() => this.tableLoading.set(!1)),
      );
  }

  public queryTLS21020_GLS1005(query: TLS21020GLS1005Query): void {
    this.gls1005Cancel$.next();
    this.gls1005Loading.set(!0);
    this.http.post<BaseQueryResponse<TLS21020GLS1005Data>>(`${apiUrl}/queryTLS21020_GLS1005`, query)
      .pipe(
        take(1),
        takeUntil(this.gls1005Cancel$),
        tap(res => this.TLS21020GLS1005Data.set(res.Data ?? [])),
        finalize(() => {
          this.gls1005Loading.set(!1);
          this.logger.debug(`TLS21020GLS1005 Data:`, [this.TLS21020GLS1005Data()]);
        }),
      ).subscribe();
  }

  public updateTLS21020(query: TLS21020UpdateQuery[]): Observable<BaseQueryResponse<unknown>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/updateTLS21020`, { GLS1020Datas: query })
      .pipe(
        take(1),
        takeUntil(this.tableCancel$),
        tap(res => { }),
        finalize(() => {
          this.logger.debug(`updateTLS21020`, []);
          this.tableLoading.set(!1);
        }),
      );
  }

  public getOrgIDs(): void {
    this.orgIdCancel$.next();
    this.orgIdLoading.set(!0);
    this.sysb400.querySYS3100_DropDownList()
      .pipe(
        take(1),
        takeUntil(this.orgIdCancel$),
        map(res => res.Data?.map(item => ({ label: `${item.No} - ${item.Name || ''}`, value: item.No })) ?? []),
        tap(res => this.SYS3100Data.set(res)),
        finalize(() => {
          this.orgIdLoading.set(!1);
          this.logger.debug(`SYS3100 Data:`, [this.SYS3100Data()]);
        }),
      ).subscribe();
  }

  public getGLS1005s(): void {
    this.gls1005Cancel$.next();
    this.gls1005Loading.set(!0);
    this.dropdownApi.queryGls1005()
      .pipe(
        take(1),
        tap(res => res && this.GLS1005Data.set(res)),
        finalize(() => {
          this.gls1005Loading.set(!1);
          this.logger.debug(`GLS1005 Data:`, [this.GLS1005Data()]);
        }),
      ).subscribe();
  }

  // VEN_Flag = 廠商別：1 廠商統一編號 2 身分證字號 3 自編編號
  public getPOS2013s(VEN_Flag: '1' | '2' | '3'): void {
    this.pos2013Cancel$.next();
    this.pos2013Loading.set(!0);
    this.dropdownApi.queryPos2013({ VEN_Flag })
      .pipe(
        take(1),
        takeUntil(this.pos2013Cancel$),
        tap(res => res && this.POS2013Data.set(res)),
        finalize(() => {
          this.pos2013Loading.set(!1);
          this.logger.debug(`POS2013 Data:`, [this.POS2013Data()]);
        }),
      ).subscribe();
  }
}
