import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FIN71010Data, FIN71010DropdownItem, FIN71010Update } from '@pages/fin/fin71010/fin71010.model';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

// Controller 位於 TSRDERP_Main.Controllers.FIN70000，依命名空間慣例路由為 Controllers/FIN70000
// 若路由不符，請確認後端 Controller 的命名空間是否需調整為四層（如 FIN70000.ECR1000）
const apiUrl = environment.ApiUrl + '/Controllers/FIN70000';

@Injectable({ providedIn: 'root' })
export class FIN71010Service {

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public queryFIN71010(payload: unknown): Observable<BaseQueryResponse<FIN71010Data>> {
    return this.http.post<BaseQueryResponse<FIN71010Data>>(`${apiUrl}/queryFIN71010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN71010結果:', [res.Data])),
    );
  }

  public queryFIN71010Dropdown(argNo: string): Observable<BaseQueryResponse<FIN71010DropdownItem>> {
    return this.http.post<BaseQueryResponse<FIN71010DropdownItem>>(`${apiUrl}/queryFIN71010Dropdown`, { ARG_NO: argNo }).pipe(
      take(1),
      tap(res => this.logger.debug(`查詢FIN71010下拉選單(${argNo})結果:`, [res.Data])),
    );
  }

  public updateFIN71010(payload: FIN71010Update): Observable<BaseQueryResponse<unknown>> {
    return this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/updateFIN71010`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('修改FIN71010結果:', [res])),
    );
  }
}
