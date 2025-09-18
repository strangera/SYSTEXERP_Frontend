import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { testDorm } from '@pages/fin/fin52080/fin52080.model';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { apiOption } from '@shared/models/sys/sysb000.model';
import { SharedDropdownService } from '@shared/services/shared-dropdown.service';
import { NGXLogger } from 'ngx-logger';
import { catchError, EMPTY, finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class FIN52080Service {

  public readonly test = !0;

  public readonly FIN52080Data = signal<testDorm[]>([]);
  public readonly FIN52080DetailData = signal<Record<string, any>[]>([]);
  public readonly accountCodes = signal<DropdownOption[]>([]);

  private readonly tableCancel$ = new Subject<void>();
  private readonly accountCodeCancel$ = new Subject<void>();

  public tableLoading = !1;
  public accountCodeLoading = !1;

  /** 中類代碼 */
  public readonly classNoOption: apiOption[] = Array.from({ length: 1000 }).map((_, i) =>
    ({ No: String(i + 1), Name: String(i + 1) }));

  /** 借/貸 */
  public readonly accDCOption: apiOption[] = [
    { No: '0', Name: '借' },
    { No: '1', Name: '貸' }
  ];

  /** 統制/明細 */
  public readonly ledgerMDOption: apiOption[] = [
    { No: '0', Name: '統制' },
    { No: '1', Name: '明細' }
  ];

  /** 是否 */
  public readonly whetherOption: apiOption[] = [
    { No: 'Y', Name: '是' },
    { No: 'N', Name: '否' }
  ];

  /** 傳票格式 */
  public readonly voucherTypeOption: apiOption[] = [
    { No: '0', Name: '無特定' },
    { No: '1', Name: '應付票據' },
    { No: '2', Name: '應收票據' },
    { No: '3', Name: '應付帳款' },

    { No: '4', Name: '應收帳款' },
    { No: '5', Name: '進項稅額' },
    { No: '6', Name: '銷項稅額' },
    { No: '7', Name: '銀行存款' },

    { No: 'A', Name: '應付費用' },
    { No: 'B', Name: '代收稅款' },
    { No: 'C', Name: '固定資產' },
    { No: 'D', Name: '現金' },
    { No: 'E', Name: '應收保證票據' }
  ];

  private readonly dummyData = computed(() =>
    Array.from({ length: 100 }).map(() => (<testDorm>{
      AccNo: String(Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000),
      AccCname: '庫存現金' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      AccEname: Array.from({ length: 8 }).map(() => String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65)).join(''),
      AccDC: this.accDCOption[Math.floor(Math.random() * this.accDCOption.length)].No,
      Ledger_MD: this.ledgerMDOption[Math.floor(Math.random() * this.ledgerMDOption.length)].No,
      ClassNo: String(Math.floor(Math.random() * (999 - 100 + 1)) + 100),
      ABAT_YN: this.whetherOption[Math.floor(Math.random() * this.whetherOption.length)].No,
      Voucher_Type: this.voucherTypeOption[Math.floor(Math.random() * this.voucherTypeOption.length)].No,
      Budget_YN: this.whetherOption[Math.floor(Math.random() * this.whetherOption.length)].No,
      Org_YN: this.whetherOption[Math.floor(Math.random() * this.whetherOption.length)].No,
      rest_value: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
      rest_value2: Math.floor(Math.random() * (100 - 1 + 1)) + 1,
      Input_YN: this.whetherOption[Math.floor(Math.random() * this.whetherOption.length)].No,
    }))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public loadFIN52080(payload: unknown): Observable<BaseQueryResponse<testDorm>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<testDorm>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52080`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52080Data.set(res.Data)),
      catchError(() => { this.test && this.FIN52080Data.set(this.dummyData()); return EMPTY; }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52080結果:', [this.FIN52080Data()]);
      })
    );
  };

  public loadFIN52080Detail(payload: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52080_detail`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52080DetailData.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52080 Detail結果:', [this.FIN52080DetailData()]);
      })
    ).subscribe();
  };

  public updateFIN52080Data(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/updateFIN52080`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('更新FIN52080結果:', []);
      })
    );
  };

  /** 預留給科目api */
  public loadxxxx(payload?: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/xxxx`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52080DetailData.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52080 Detail結果:', [this.FIN52080DetailData()]);
      })
    ).subscribe();
  };

  public loadAccountCodes(): void {
    this.accountCodeCancel$.next();
    this.accountCodeLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52080_Creaters`, {}).pipe(
      take(1),
      takeUntil(this.accountCodeCancel$),
      tap(res => this.accountCodes.set(res.Data)),
      finalize(() => {
        this.accountCodeLoading = !1;
        this.logger.debug('查詢AccountCodes結果:', [this.accountCodes()]);
      })
    ).subscribe();
  };
}
