import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { EntryType, POS2013, TLS21020Data, TLS21020GLS1005Data, TLS21020GLS1005Query, TLS21020Query, TLS21020UpdateQuery } from '@pages/tls/tls21020/tls21020.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Sysb400Service } from '../sys/sysb400.service';

const apiUrl: string = environment.ApiUrl + '/TLS0000/TLS2000';

@Injectable({ providedIn: 'root' })
export class TLS21020Service {

  public readonly TLS21020GLS1005Options = signal<TLS21020GLS1005Data[]>([]);
  public readonly SYS3100Options = signal<Option[]>([]);
  public readonly GLS1005Options = signal<Option[]>([]);
  public readonly POS2013Options = signal<Option[]>([]);

  public readonly SYS3100Map = computed(() =>
    new Map<string, Option>(this.SYS3100Options().map(item => [item.value, item]))
  );
  public readonly GLS1005Map = computed(() =>
    new Map<string, Option>(this.GLS1005Options().map(item => [item.value, item]))
  );
  public readonly POS2013Map = computed(() =>
    new Map<string, Option>(this.POS2013Options().map(item => [item.value, item]))
  );

  public readonly entryTypeMap = new Map<string, string>([
    [EntryType['SD銷售日傳票'], EntryType.SD],
    [EntryType['WD自營日結傳票'], EntryType.WD],
    [EntryType['MR租金傳票'], EntryType.MR],
    [EntryType['MD代扣傳票'], EntryType.MD],
    [EntryType['PR抽成傳票'], EntryType.PR],
    [EntryType['PN進貨帳款-暫估應付'], EntryType.PN],
    [EntryType['PNC進貨帳款-成本結轉'], EntryType.PNC],
    [EntryType['PT進貨請款'], EntryType.PT],
  ]);

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
      { value: EntryType['SD銷售日傳票'], label: EntryType.SD },
      // { value: EntryType['WD自營日結傳票'], label: EntryType.WD },
      { value: EntryType['MR租金傳票'], label: EntryType.MR },
      { value: EntryType['MD代扣傳票'], label: EntryType.MD },
      { value: EntryType['PR抽成傳票'], label: EntryType.PR },
      { value: EntryType['PN進貨帳款-暫估應付'], label: EntryType.PN },
      { value: EntryType['PNC進貨帳款-成本結轉'], label: EntryType.PNC },
      { value: EntryType['PT進貨請款'], label: EntryType.PT },
    ];
  }

  public getYNOptions(): Option[] {
    return [
      { value: 'Y', label: '是' },
      { value: 'N', label: '否' },
    ];
  }

  public queryTLS21020(query: TLS21020Query): Observable<BaseQueryResponse<TLS21020Data>> {
    return this.http.post<BaseQueryResponse<TLS21020Data>>(`${apiUrl}/queryTLS21020`, Object.freeze(query)).pipe(
      take(1),
      tap(res => this.logger.debug(`query TLS21020:`, [res])),
    );
  }

  public queryTLS21020_GLS1005(query: TLS21020GLS1005Query): void {
    this.gls1005Loading.set(!0);
    this.http.post<BaseQueryResponse<TLS21020GLS1005Data>>(`${apiUrl}/GLS1005_ledgerMD_DropDownList`, query).pipe(
      take(1),
      tap(res => {
        this.TLS21020GLS1005Options.set(res.Data ?? []);
        this.logger.debug(`query TLS21020GLS1005:`, [res]);
      }),
      finalize(() => this.gls1005Loading.set(!1)),
    ).subscribe();
  }

  public updateTLS21020(query: TLS21020UpdateQuery[]): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/updateTLS21020`, { GLS1020Datas: query }).pipe(
      take(1),
      tap(res => this.logger.debug(`update tls21020:`, [res])),
    );
  }

  public getOrgIDs(): void {
    this.orgIdLoading.set(!0);
    this.sysb400.querySYS3100_DropDownList().pipe(
      take(1),
      map(res => res.Data?.map(item => ({ label: `${item.No} - ${item.Name || ''}`, value: item.No })) ?? []),
      tap(res => {
        this.SYS3100Options.set(res);
        this.logger.debug(`orgIDs:`, [res]);
      }),
      finalize(() => this.orgIdLoading.set(!1)),
    ).subscribe();
  }

  public getGLS1005s(): void {
    this.gls1005Loading.set(!0);
    this.dropdownApi.queryGls1005_ledgerMD().pipe(
      take(1),
      map(res => res ?? []),
      tap(res => {
        this.GLS1005Options.set(res);
        this.logger.debug(`gls1005s:`, [res]);
      }),
      finalize(() => this.gls1005Loading.set(!1)),
    ).subscribe();
  }

  // VEN_Flag = 廠商別：1 廠商統一編號 2 身分證字號 3 自編編號
  public getPOS2013s(VEN_Flag: '1' | '2' | '3'): void {
    this.pos2013Loading.set(!0);
    this.dropdownApi.queryPos2013({ VEN_Flag }).pipe(
      take(1),
      map(res => (res ?? []) as POS2013[]),
      tap(res => {
        this.POS2013Options.set(res.map(item => ({ value: item.VEN_No!, label: `${item.VEN_No} - ${item.Name}` } as Option)));
        this.logger.debug(`POS2013s:`, [res]);
      }),
      finalize(() => this.pos2013Loading.set(!1)),
    ).subscribe();
  }
}
