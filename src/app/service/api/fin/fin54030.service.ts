import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { FIN54030Data, FIN54030Response } from '@pages/fin/fin54030/fin54030.model';
import { NGXLogger } from 'ngx-logger';
import { finalize, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN54030Service {


  public readonly FIN54030Data = signal<FIN54030Data>(Object.create(null));

  public readonly totalRecords = signal<number>(0);

  public readonly tableLoading = signal<boolean>(!1);
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

  public loadFIN54030(): void {
    this.tableLoading.set(!0);
    this.http.post<FIN54030Response>(`${apiUrl}/queryFIN54030`, {}).pipe(
      take(1),
      tap(res => {
        this.totalRecords.set(res.TotalCount || 0);
        this.FIN54030Data.set(res.Data);
        this.logger.debug('查詢FIN54030結果:', [res]);
      }),
      finalize(() => this.tableLoading.set(!1))
    ).subscribe();
  }

  public closeFIN54030(CloseYM: string, CloseType: '1' | '2'): void {
    this.closeLoading.set(!0);
    this.http.post<FIN54030Response>(`${apiUrl}/closeFIN54030`, { CloseYM, CloseType }).pipe(
      take(1),
      finalize(() => this.closeLoading.set(!1))
    ).subscribe();
  }
}
