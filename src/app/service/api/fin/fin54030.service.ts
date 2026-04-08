import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN54030Response } from '@pages/fin/fin54030/fin54030.model';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN54030Service {

  public readonly closeLoading = signal<boolean>(!1);

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  /** 傳票狀態 */
  public readonly postFlagOptions = [
    { value: '0', label: '作廢' },
    { value: '1', label: '建立' },
    // { value: '2', label: '確認' },
    { value: '3', label: '過帳' },
  ];

  public loadFIN54030(): Observable<FIN54030Response> {
    return this.http.post<FIN54030Response>(`${apiUrl}/queryFIN54030`, {}).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN54030結果:', [res])),
    );
  }

  public closeFIN54030(CloseYM: string, CloseType: 1 | 2): Observable<FIN54030Response> {
    this.closeLoading.set(!0);
    return this.http.post<FIN54030Response>(`${apiUrl}/closeFIN54030`, { CloseYM, CloseType }).pipe(
      take(1),
      finalize(() => this.closeLoading.set(!1))
    );
  }
}
