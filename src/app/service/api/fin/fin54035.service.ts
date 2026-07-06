import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN54035Payload, FIN54035Response } from '@pages/fin/fin54035/fin54035.model';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN54035Service {

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

  public loadFIN54035(): Observable<FIN54035Response> {
    return this.http.post<FIN54035Response>(`${apiUrl}/queryFIN54035`, {}).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN54035結果:', [res])),
    );
  }

  public closeFIN54035(CloseYM: string, CloseType: 1 | 2): Observable<FIN54035Response> {
    this.closeLoading.set(!0);
    const payload: FIN54035Payload = { CloseYM, CloseType };
    return this.http.post<FIN54035Response>(`${apiUrl}/CloseFIN54035`, payload).pipe(
      take(1),
      finalize(() => this.closeLoading.set(!1))
    );
  }
}
