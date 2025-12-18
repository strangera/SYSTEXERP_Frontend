import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN52010DataResponse, FIN52010UpdatePayload, FIN52010UpdateResult, GLS1005Option } from '@pages/fin/fin52010/fin52010.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52010Service {

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

  public loadFIN52010(CompNo: string = ''): Observable<FIN52010DataResponse> {
    return this.http.post<FIN52010DataResponse>(`${apiUrl}/queryFIN52010`, { CompNo }).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN52010結果:', [res])),
    );
  }

  public updateFIN52010Data(payload: FIN52010UpdatePayload): Observable<FIN52010UpdateResult> {
    return this.http.post<FIN52010UpdateResult>(`${apiUrl}/updateFIN52010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN52010結果:', [res])),
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
      map(res => (res ?? []).map(item => ({ value: item['Org_ID'], label: `${item['Org_ID']} - ${item['Org_Name']}` }))),
      tap(res => this.orgUsrOptions.set(res)),
      finalize(() => {
        this.orgUsrLoading.set(!1);
        this.logger.debug('查詢TblUsrOrgOptions結果:', [this.orgUsrOptions()]);
      }),
    ).subscribe();
  }
}
