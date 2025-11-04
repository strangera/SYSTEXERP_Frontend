import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN54035Data, FIN54035Payload } from '@pages/fin/fin54035/fin54035.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN54035Service {

  private readonly tableCancel$ = new Subject<void>();

  public readonly FIN54035Data = signal<FIN54035Data[]>([]);

  public readonly totalRecords = signal<number>(0);

  public readonly tableLoading = signal<boolean>(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN54035(payload: FIN54035Payload): Observable<BaseQueryResponse<FIN54035Data>> {
    this.tableCancel$.next();
    this.tableLoading.set(!0);
    return this.http.post<BaseQueryResponse<FIN54035Data>>(`${apiUrl}/queryFIN54035`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.totalRecords.set(res.TotalCount || 0)),
      tap(res => this.FIN54035Data.set(res.Data)),
      tap(res => this.logger.debug('查詢FIN54035結果:', [res])),
      finalize(() => this.tableLoading.set(!1))
    );
  }
}
