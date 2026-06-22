import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { POS2013, TLS21020Data, TLS21020Query, TLS21020UpdateQuery } from '@pages/tls/tls21020/tls21020.model';
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
  private readonly http = inject(HttpClient);
  private readonly logger = inject(NGXLogger);
  private readonly sysb400 = inject(Sysb400Service);
  private readonly dropdownApi = inject(DropdownApiService);

  public readonly SYS3100Options = signal<Option[]>([]);
  public readonly GLS1005Options = signal<Option[]>([]);
  public readonly POS2013Options = signal<Option[]>([]);
  public readonly entryTypeOptions = signal<Option[]>([]);

  public readonly SYS3100Map = computed(() =>
    new Map<string, Option>(this.SYS3100Options().map(item => [item.value, item]))
  );
  public readonly GLS1005Map = computed(() =>
    new Map<string, Option>(this.GLS1005Options().map(item => [item.value, item]))
  );

  public readonly gls1005Loading = signal<boolean>(false);
  public readonly pos2013Loading = signal<boolean>(false);
  public readonly orgIdLoading = signal<boolean>(false);

  public readonly getYNOptions: Option[] = [
    { value: 'Y', label: '是' },
    { value: 'N', label: '否' },
  ];

  public getEntryTypes(): void {
    this.dropdownApi.queryGls1010().pipe(
      take(1),
      map(res => res ?? []),
      tap(res => this.entryTypeOptions.set(res)),
    ).subscribe();
  }

  public queryTLS21020(query: TLS21020Query): Observable<BaseQueryResponse<TLS21020Data>> {
    return this.http.post<BaseQueryResponse<TLS21020Data>>(`${apiUrl}/queryTLS21020`, query).pipe(
      take(1),
      tap(res => this.logger.debug('query TLS21020:', [res])),
    );
  }

  public updateTLS21020(query: TLS21020UpdateQuery[]): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/updateTLS21020`, { GLS1020Datas: query }).pipe(
      take(1),
      tap(res => this.logger.debug('update tls21020:', [res])),
    );
  }

  public getOrgIDs(): void {
    this.orgIdLoading.set(true);
    this.sysb400.querySYS3100_DropDownList().pipe(
      take(1),
      map(res => res.Data?.map(item => ({ label: `${item.No} - ${item.Name || ''}`, value: item.No })) ?? []),
      tap(res => {
        this.SYS3100Options.set(res);
        this.logger.debug('orgIDs:', [res]);
      }),
      finalize(() => this.orgIdLoading.set(false)),
    ).subscribe();
  }

  public getGLS1005s(): void {
    this.gls1005Loading.set(true);
    this.dropdownApi.queryGls1005_ledgerMD().pipe(
      take(1),
      map(res => res ?? []),
      tap(res => {
        this.GLS1005Options.set(res);
        this.logger.debug('gls1005s:', [res]);
      }),
      finalize(() => this.gls1005Loading.set(false)),
    ).subscribe();
  }

  // VEN_Flag = 廠商別：1 廠商統一編號 2 身分證字號 3 自編編號
  public getPOS2013s(VEN_Flag: '1' | '2' | '3'): void {
    this.pos2013Loading.set(true);
    this.dropdownApi.queryPos2013({ VEN_Flag }).pipe(
      take(1),
      map(res => (res ?? []) as POS2013[]),
      tap(res => {
        this.POS2013Options.set(res.map(item => ({ value: item.VEN_No, label: `${item.VEN_No} - ${item.Name}` })));
        this.logger.debug('POS2013s:', [res]);
      }),
      finalize(() => this.pos2013Loading.set(false)),
    ).subscribe();
  }
}
