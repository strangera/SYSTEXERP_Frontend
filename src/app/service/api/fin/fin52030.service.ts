import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { catchError, EMPTY, finalize, Observable, Subject, take, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl;

@Injectable({ providedIn: 'root' })
export class FIN52030Service {

  public readonly test = !0;

  public readonly FIN52030Data = signal<Record<string, any>[]>([]);
  public readonly FIN52030DetailData = signal<Record<string, any>[]>([]);
  public readonly subpoenaTypes = signal<DropdownOption[]>([]);
  public readonly creators = signal<DropdownOption[]>([]);
  public readonly modifiers = signal<DropdownOption[]>([]);

  /** 預留給科目api */
  public readonly FIN52030xxxxData = signal<Record<string, any>[]>([]);

  private readonly tableCancel$ = new Subject<void>();
  private readonly creatorCancel$ = new Subject<void>();
  private readonly modifierCancel$ = new Subject<void>();

  public tableLoading = !1;
  public creatorLoading = !1;
  public modifierLoading = !1;

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
  ) { }

  public getSubpoenaTypes(): void {
    this.subpoenaTypes.set([
      { No: '1', Name: '現金收入傳票' },
      { No: '2', Name: '現金支出傳票' },
      { No: '3', Name: '轉帳傳票' },
    ]);
  }

  public loadFIN52030(payload: unknown): void {
    this.tableCancel$.next();
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52030Data.set(res.Data)),
      catchError(() => { this.test && this.FIN52030Data.set(dummyData); return EMPTY; }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52030結果:', [this.FIN52030Data()]);
      })
    ).subscribe();
  };

  public loadFIN52030Detail(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52030_detail`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => this.FIN52030DetailData.set(res.Data)),
      catchError(() => { this.test && this.FIN52030DetailData.set(dummyDetailData); return EMPTY; }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52030 Detail結果:', [this.FIN52030DetailData()]);
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
      tap(res => this.FIN52030DetailData.set(res.Data)),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('查詢FIN52030 Detail結果:', [this.FIN52030DetailData()]);
      })
    ).subscribe();
  };

  public updateFIN52030Data(payload: unknown): Observable<BaseQueryResponse<Record<string, any>>> {
    this.tableCancel$.next();
    this.tableLoading = !0;
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/FIN0000/FIN2000/updateFIN52030`, payload).pipe(
      take(1),
      takeUntil(this.tableCancel$),
      tap(res => { }),
      finalize(() => {
        this.tableLoading = !1;
        this.logger.debug('更新FIN52030結果:', []);
      })
    );
  }

  public loadCreators(): void {
    this.creatorCancel$.next();
    this.creatorLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52030_Creaters`, {}).pipe(
      take(1),
      takeUntil(this.creatorCancel$),
      tap(res => this.creators.set(res.Data)),
      catchError(() => { this.test && this.creators.set(dummyCreators); return EMPTY; }),
      finalize(() => {
        this.creatorLoading = !1;
        this.logger.debug('查詢Creaters結果:', [this.creators()]);
      })
    ).subscribe();
  };

  public loadModifiers(): void {
    this.modifierCancel$.next();
    this.modifierLoading = !0;
    this.http.post<BaseQueryResponse<DropdownOption>>(`${apiUrl}/FIN0000/FIN2000/queryFIN52030_Modifiers`, {}).pipe(
      take(1),
      takeUntil(this.modifierCancel$),
      tap(res => this.modifiers.set(res.Data)),
      catchError(() => { this.test && this.modifiers.set(dummyModifiers); return EMPTY; }),
      finalize(() => {
        this.modifierLoading = !1;
        this.logger.debug('查詢Modifiers結果:', [this.modifiers()]);
      })
    ).subscribe();
  };
}


const dummyCreators = Array.from({ length: 50 }, (_, i) => ({
  No: `U${(i + 1).toString().padStart(3, '0')}`,
  Name: `User ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  createDate: new Date(new Date().getFullYear(), 0, 1 + Math.floor(Math.random() * 365)),
}));

const dummyModifiers = Array.from({ length: 50 }, (_, i) => ({
  No: `U${(i + 11).toString().padStart(3, '0')}`,
  Name: `User ${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  modifyDate: new Date(new Date().getFullYear(), 0, 1 + Math.floor(Math.random() * 365)),
}));

const dummyData = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  isDeleted: i % 2 === 0 ? 'Y' : 'N',
  subpoenaCode: `CODE${i + 1}`,
  subpoenaNumber: `NUM${i + 1}`,
  subpoenaName: `Subpoena Name ${i + 1}`,
  detailCount: Math.floor(Math.random() * 1e5) + 1,
  typeCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
  subpoenaType: ((i % 3) + 1).toString(),
  creator: dummyCreators[i % dummyCreators.length].Name,
  createDate: dummyCreators[i % dummyCreators.length].createDate,
}));

const dummyId = Array.from({ length: 100 }, (_, i) => ({ No: i + 3, Name: `Item ${i + 3}` }));

const vendorEmployeeTable = Array.from({ length: 100 }, (_, i) => ({
  id: `V00${i + 3}`,
  name: `Vendor ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
}));

const dummyDetailData = Array.from({ length: 100 }, (_, i) => ({
  id: dummyId[i % dummyId.length].No,
  subjectCode: `00${i + 3}`,
  subjectName: `Subject ${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
  vendorEmployeeCode: vendorEmployeeTable[i % vendorEmployeeTable.length].id,
  vendorEmployeeName: vendorEmployeeTable[i % vendorEmployeeTable.length].name,
  summary: `Generated summary ${i + 3}`,
  debitAmount: Math.floor(Math.random() * 1e6) + 1e4,
  creditAmount: Math.floor(Math.random() * 1e6) + 1e4,
  organizationCode: `ORG00${i + 3}`,
  objectCode: `OBJ00${i + 3}`,
  reconciliationKey: `KEY00${i + 3}`,
}));
