import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN52010Data, FIN52010DataResponse, FIN52010UpdatePayload, FIN52010UpdateResult, GLS1005Option } from '@pages/fin/fin52010/fin52010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52010Service {


  public readonly FIN52010Data = signal<FIN52010Data>(Object.create(null));

  public readonly dataLoading = signal<boolean>(!1);
  public readonly orgUsrLoading = signal<boolean>(!1);
  public readonly gls1005Loading = signal<boolean>(!1);

  public readonly orgUsrOptions = signal<Option[]>([]);
  public readonly orgOptions = signal<Option[]>([]);
  public readonly usrOptions = signal<Option[]>([]);
  public readonly gls1005Options = signal<GLS1005Option[]>([]);

  public readonly billTransferConOptions = signal<Option[]>([
    { value: 'N', label: '否' },
    { value: 'Y', label: '是' },
  ]);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN52010(CompNo: string = ''): void {
    this.dataLoading.set(!0);
    this.http.post<FIN52010DataResponse>(`${apiUrl}/queryFIN52010`, { CompNo }).pipe(
      take(1),
      tap(res => this.FIN52010Data.set(res.Data)),
      finalize(() => {
        this.dataLoading.set(!1);
        this.logger.debug('查詢FIN52010結果:', [this.FIN52010Data()]);
      })
    ).subscribe();
  }

  public updateFIN52010Data(payload: FIN52010UpdatePayload): Observable<BaseQueryResponse<FIN52010UpdateResult>> {
    this.dataLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN52010UpdateResult>>(`${apiUrl}/updateFIN52010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN52010結果:', [res])),
      finalize(() => this.dataLoading.set(!1))
    );
  }

  public getGLS1005DropDownOptions(): void {
    this.gls1005Loading.set(!0);
    this.dropdownApi.queryGls1005().pipe(
      take(1),
      map(res => res as GLS1005Option[] ?? []),
      tap(res => this.gls1005Options.set(res)),
      finalize(() => {
        this.gls1005Loading.set(!1);
        this.logger.debug('查詢GLS1005結果:', [this.gls1005Options()]);
      }),
    ).subscribe();
  }

  public getTblUsrOrgOptions(): void {
    this.orgUsrLoading.set(!0);
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      map(res => res ?? []),
      tap(res => this.orgUsrOptions.set(res)),
      finalize(() => {
        this.orgUsrLoading.set(!1);
        this.logger.debug('查詢TblUsrOrgOptions結果:', [this.orgUsrOptions()]);
      }),
    ).subscribe();
  }
}
