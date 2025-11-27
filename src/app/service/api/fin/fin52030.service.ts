import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { AccDescOption, AccNoList, FIN52030Data, FIN52030DetailDataResponse, FIN52030InsertPayload, FIN52030Payload, FIN52030UpdatePayload, NoteDescResponse, VendorList } from '@pages/fin/fin52030/fin52030.model';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { BaseQueryResponse } from '@shared/models/api/base-api.interface';
import { NGXLogger } from 'ngx-logger';
import { finalize, map, Observable, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

const apiUrl = environment.ApiUrl + '/FIN0000/GLS1000';

@Injectable({ providedIn: 'root' })
export class FIN52030Service {

  public readonly accLoading = signal<boolean>(!1);
  public readonly venLoading = signal<boolean>(!1);
  public readonly usrLoading = signal<boolean>(!1);
  public readonly RefNameLoading = signal<boolean>(!1);
  public readonly noteDescLoading = signal<boolean>(!1);

  public readonly accNoOptions = signal<Option[]>([]);
  public readonly vendorOptions = signal<Option[]>([]);
  public readonly usrOptions = signal<Option[]>([]);
  public readonly orgNoOptions = signal<Option[]>([]);
  public readonly refNameOptions = signal<Option[]>([]);
  public readonly noteDescOptions = signal<AccDescOption[]>([]);

  /** 傳票種類 */
  public readonly vouTypeOptions = signal<Option[]>([
    { value: '1', label: '現金收入傳票' },
    { value: '2', label: '現金支出傳票' },
    { value: '3', label: '轉帳傳票' },
  ]);

  public readonly accNoMap = computed(() =>
    new Map(this.accNoOptions().map(item => [item.value, item]))
  );
  public readonly vendorMap = computed(() =>
    new Map(this.vendorOptions().map(item => [item.value, item]))
  );
  public readonly usrMap = computed(() =>
    new Map(this.usrOptions().map(item => [item.value, item]))
  );
  public readonly noteDescMap = computed(() =>
    new Map(this.noteDescOptions().map(item => [item.value, item]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
  ) { }

  public loadFIN52030(payload: FIN52030Payload): Observable<BaseQueryResponse<FIN52030Data>> {
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/queryFIN52030`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN52030結果:', [res]))
    );
  }

  public loadFIN52030Detail(id: number): Observable<FIN52030DetailDataResponse> {
    return this.http.post<FIN52030DetailDataResponse>(`${apiUrl}/queryFIN52030Detail`, { id }).pipe(
      take(1),
      tap(res => this.logger.debug('查詢FIN52030 Detail結果:', [res])),
    );
  }

  public updateFIN52030Data(payload: FIN52030UpdatePayload): Observable<BaseQueryResponse<FIN52030Data>> {
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/updateFIN52030`, payload).pipe(
      take(1),
      tap(res => { }),
      finalize(() => this.logger.debug('更新FIN52030結果:', []))
    );
  }

  public insertFIN52030Data(payload: FIN52030InsertPayload): Observable<BaseQueryResponse<FIN52030Data>> {
    return this.http.post<BaseQueryResponse<FIN52030Data>>(`${apiUrl}/insertFIN52030`, payload).pipe(
      take(1),
      tap(res => { }),
      finalize(() => this.logger.debug('插入FIN52030結果:', []))
    );
  }

  public deleteFIN52030Data(payload: number[]): Observable<BaseQueryResponse<Record<string, any>>> {
    return this.http.post<BaseQueryResponse<Record<string, any>>>(`${apiUrl}/deleteFIN52030`, { ids: payload }).pipe(
      take(1),
      tap(res => { }),
      finalize(() => this.logger.debug('刪除FIN52030結果:', []))
    );
  }

  public getRefNameOptions(): void {
    this.http.post<BaseQueryResponse<VendorList>>(`${apiUrl}/queryVendorList`, {}).pipe(
      take(1),
      map(res => res.Data?.map(item => ({ value: item.VEN_No, label: item.VEN_Name } as Option)) ?? []),
      tap(res => this.refNameOptions.set(res)),
      finalize(() => this.logger.debug('查詢RefNameOptions結果:', [this.refNameOptions()])),
    ).subscribe();
  }

  public getAccDescOptions(AccNo: string[]): void {
    this.noteDescLoading.set(!0);
    this.http.post<NoteDescResponse>(`${apiUrl}/queryAccNoNoteDescDropdown`, { AccNo: Array.from(new Set(AccNo)) }).pipe(
      take(1),
      tap(res => this.noteDescOptions.set(Object.entries(res.Data.AccNoNoteDesc).map(([key, value]) =>
        ({ value: key, label: (value as string[])[0], data: (value as string[]).map((v: string, i: number) => ({ value: String(i), label: v })) } as AccDescOption)))),
      finalize(() => {
        this.noteDescLoading.set(!1);
        this.logger.debug('查詢NoteDescOptions結果:', [this.noteDescOptions()]);
      }),
    ).subscribe();
  }

  public getOrgNoOptions(): void {
    this.dropdownApi.querySys3100().pipe(
      take(1),
      tap(res => this.orgNoOptions.set(res ?? [])),
      finalize(() => this.logger.debug('查詢OrgNoOptions結果:', [this.orgNoOptions()])),
    ).subscribe();
  }

  public getAccNoOptions(): void {
    this.accLoading.set(!0);
    this.http.post<BaseQueryResponse<AccNoList>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      tap(res => this.accNoOptions.set(res.Data.map(item => ({ value: item.AccNo, label: item.AccCName, templateLabel: `${item.AccNo} - ${item.AccCName}` } as Option)))),
      finalize(() => {
        this.accLoading.set(!1);
        this.logger.debug('查詢AccNoOptions結果:', [this.accNoOptions()]);
      }),
    ).subscribe();
  }

  public getVendorOptions(): void {
    this.venLoading.set(!0);
    this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
      take(1),
      tap(res => this.vendorOptions.set(res?.map(item => ({ value: item['VEN_No'], label: item['Name'], short: item['ShortName'] } as Option)) ?? [])),
      finalize(() => {
        this.venLoading.set(!1);
        this.logger.debug('查詢VendorOptions結果:', [this.vendorOptions()]);
      }),
    ).subscribe();
  }

  public getUsrOptions(): void {
    this.dropdownApi.queryTblUserOrgid().pipe(
      take(1),
      tap(res => this.usrOptions.set(res?.map(item => ({ value: item['Org_ID'], label: item['Org_Name'] } as Option)) ?? [])),
      finalize(() => this.logger.debug('查詢TblUserOrgidOptions結果:', [this.usrOptions()])),
    ).subscribe();
  }
}
