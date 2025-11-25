import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { AccNoDropdown, FIN52090Data, FIN52090Insert, FIN52090Query } from '@pages/fin/fin52090/fin52090.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52090Service {

  public readonly test = !0;

  public readonly accNo = signal<AccNoDropdown[]>([]);

  public accNoMap: Map<string, string> = new Map<string, string>();

  public readonly accNoLoading = signal<boolean>(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN52090(payload: FIN52090Query): Observable<BaseQueryResponse<FIN52090Data>> {
    return this.http.post<BaseQueryResponse<FIN52090Data>>(`${apiUrl}/queryFIN52090`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN52090結果:', [res])),
    );
  };

  public saveFIN52090Data(payload: FIN52090Insert): Observable<BaseQueryResponse<FIN52090Data>> {
    return this.http.post<BaseQueryResponse<FIN52090Data>>(`${apiUrl}/insertFIN52090`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN52090結果:', [res])),
    );
  };

  public getAccNo(): void {
    this.accNoLoading.set(!0);
    this.http.post<BaseQueryResponse<AccNoDropdown>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      tap(res => this.accNo.set(res.Data)),
      tap(() => this.accNoMap = new Map(this.accNo().map(item => [item.AccNo, item.AccCName]))),
      tap(() => this.logger.debug('查詢AccNo結果:', [this.accNo()])),
      finalize(() => this.accNoLoading.set(!1))
    ).subscribe();
  };
}
