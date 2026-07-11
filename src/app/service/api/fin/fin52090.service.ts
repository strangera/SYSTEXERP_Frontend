import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import {
  AccNoDropdown,
  FIN52090Data,
  FIN52090DeleteRequest,
  FIN52090DeleteResponse,
  FIN52090Insert,
  FIN52090InsertResponse,
  FIN52090Query,
  FIN52090UpdateRequest,
  FIN52090UpdateResponse,
} from '@pages/fin/fin52090/fin52090.model';
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

  public loadFIN52090(payload: FIN52090Query): Observable<ApiResponse<FIN52090Data[]>> {
    return this.http.post<ApiResponse<FIN52090Data[]>>(`${apiUrl}/queryFIN52090`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN52090結果:', [res])),
    );
  };

  public saveFIN52090Data(payload: FIN52090Insert): Observable<ApiResponse<FIN52090InsertResponse[]>> {
    return this.http.post<ApiResponse<FIN52090InsertResponse[]>>(`${apiUrl}/insertFIN52090`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('新增FIN52090結果:', [res])),
    );
  };

  public updateFIN52090(data: FIN52090UpdateRequest): Observable<ApiResponse<FIN52090UpdateResponse[]>> {
    return this.http.post<ApiResponse<FIN52090UpdateResponse[]>>(`${apiUrl}/updateFIN52090`, data).pipe(
      take(1),
      tap(res => this.logger.debug('更新FIN52090結果:', [res])),
    );
  }

  public deleteFIN52090(data: FIN52090DeleteRequest): Observable<ApiResponse<FIN52090DeleteResponse[]>> {
    return this.http.post<ApiResponse<FIN52090DeleteResponse[]>>(`${apiUrl}/deleteFIN52090`, data).pipe(
      take(1),
      tap(res => this.logger.debug('刪除FIN52090結果:', [res])),
    );
  }

  public getAccNo(): void {
    this.accNoLoading.set(!0);
    this.http.post<ApiResponse<AccNoDropdown[]>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      tap(res => this.accNo.set(res.Data)),
      tap(() => this.accNoMap = new Map(this.accNo().map(item => [item.AccNo, item.AccCName]))),
      tap(() => this.logger.debug('查詢AccNo結果:', [this.accNo()])),
      finalize(() => this.accNoLoading.set(!1))
    ).subscribe();
  };
}
