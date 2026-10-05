import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { AccDescOption, AccNoList, FIN52030Data, FIN52030DetailDataResponse, FIN52030InsertPayload, FIN52030Payload, FIN52030UpdatePayload, NoteDescResponse } from '@pages/fin/fin52030/fin52030.model';
import { FavoriteService } from '@service/system/favorite.service';
import { Option } from '@service/utility/dropdown-api.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
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
  public readonly orgNoOptions = signal<Option[]>([]);
  public readonly refNameOptions = signal<Option[]>([]);
  public readonly noteDescOptions = signal<AccDescOption[]>([]);

  // TODO: 三種 usr 列表 (全部 | 建立人 | 更新人) 看之後要用哪格
  public readonly usrOptions = signal<Option[]>([]);
  public readonly crtUsrOptions = signal<Option[]>([]);
  public readonly updUsrOptions = signal<Option[]>([]);

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
  public readonly crtUsrMap = computed(() =>
    new Map(this.crtUsrOptions().map(item => [item.value, item]))
  );
  public readonly updUsrMap = computed(() =>
    new Map(this.updUsrOptions().map(item => [item.value, item]))
  );
  public readonly noteDescMap = computed(() =>
    new Map(this.noteDescOptions().map(item => [item.value, item]))
  );

  constructor(
    private readonly http: HttpClient,
    private readonly logger: NGXLogger,
    private readonly dropdownApi: DropdownApiService,
    private readonly fav: FavoriteService,
  ) { }

  public loadFIN52030(payload: FIN52030Payload): Observable<ApiResponse<FIN52030Data[]>> {
    return this.http.post<ApiResponse<FIN52030Data[]>>(`${apiUrl}/queryFIN52030`, payload).pipe(
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

  public updateFIN52030Data(payload: FIN52030UpdatePayload): Observable<ApiResponse<FIN52030Data[]>> {
    return this.http.post<ApiResponse<FIN52030Data[]>>(`${apiUrl}/updateFIN52030`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('updateFIN52030Data:', [res])),
    );
  }

  public insertFIN52030Data(payload: FIN52030InsertPayload): Observable<ApiResponse<FIN52030Data[]>> {
    return this.http.post<ApiResponse<FIN52030Data[]>>(`${apiUrl}/insertFIN52030`, payload).pipe(
      take(1),
      tap(res => this.logger.debug('insertFIN52030Data:', [res])),
    );
  }

  public deleteFIN52030Data(payload: number[]): Observable<ApiResponse<{ ids: number[]; }[]>> {
    return this.http.post<ApiResponse<{ ids: number[]; }[]>>(`${apiUrl}/deleteFIN52030`, { ids: payload }).pipe(
      take(1),
      tap(res => this.logger.debug('deleteFIN52030Data:', [res])),
    );
  }

  public getRefNameOptions(): void {
    this.RefNameLoading.set(!0);
    this.dropdownApi.queryGLS1016().pipe(
      take(1),
      map(res => res ?? []),
      tap(res => this.refNameOptions.set(res)),
      finalize(() => this.RefNameLoading.set(!1)),
    ).subscribe();
  }

  public getAccDescOptions(AccNo: string[]): void {
    this.noteDescLoading.set(!0);
    this.http.post<NoteDescResponse>(`${apiUrl}/queryAccNoNoteDescDropdown`, { AccNo: Array.from(new Set(AccNo)) }).pipe(
      take(1),
      tap(res => this.logger.debug('AccDescOptions:', [res.Data.AccNoNoteDesc])),
      tap(res => this.noteDescOptions.set(Object.entries(res.Data.AccNoNoteDesc).map(([key, value]) =>
        ({ value: key, label: (value as string[])[0], data: (value as string[]).map((v: string, i: number) => ({ value: String(i), label: v })) } as AccDescOption)))),
      finalize(() => this.noteDescLoading.set(!1)),
    ).subscribe();
  }

  public getOrgNoOptions(): void {
    this.dropdownApi.querySys3100().pipe(
      take(1),
      tap(res => this.logger.debug('getOrgNoOptions:', [res])),
      tap(res => this.orgNoOptions.set(res ?? [])),
    ).subscribe();
  }

  public getAccNoOptions(): void {
    this.accLoading.set(!0);
    this.http.post<ApiResponse<AccNoList[]>>(`${apiUrl}/queryAccNoDropdown`, {}).pipe(
      take(1),
      tap(res => this.logger.debug('getAccNoOptions:', [res])),
      tap(res => this.accNoOptions.set(res.Data.map(item => ({ value: item.AccNo, label: `${item.AccNo} - ${item.AccCName}` } as Option)))),
      finalize(() => this.accLoading.set(!1)),
    ).subscribe();
  }

  public getVendorOptions(): void {
    this.venLoading.set(!0);
    this.dropdownApi.queryPos2013({ VEN_Flag: '' }).pipe(
      take(1),
      tap(res => this.logger.debug('getVendorOptions:', [res])),
      tap(res => this.vendorOptions.set(res?.map(item => ({ value: item['VEN_No'], label: item['Name'], short: item['ShortName'], No: item['No'] } as Option)) ?? [])),
      finalize(() => this.venLoading.set(!1)),
    ).subscribe();
  }

  public getUsrOptions(): void {
    this.usrLoading.set(!0);
    this.fav.getFavorites().pipe(
      take(1),
      tap(res => this.logger.debug('getUsrOptions:', [res])),
      tap(res => {
        const data = <UserFavorite[]>res.Data;
        const set = new Set<string>();
        // 去重
        const dedup = (options: Option[]) => options.filter(option => {
          if (set.has(option.value)) return !1;
          set.add(option.value);
          return !0;
        });
        this.usrOptions.set(dedup(data.map(item => ({ value: item.USER_No, label: item.CRT_USR_Name } as Option))));
        this.crtUsrOptions.set(dedup(data.map(item => ({ value: item.CRT_USR_No, label: item.CRT_USR_Name } as Option)) ?? []));
        this.updUsrOptions.set(dedup(data.map(item => ({ value: item.UPD_USR_No, label: item.UPD_USR_Name } as Option)) ?? []));
      }),
      finalize(() => this.usrLoading.set(!1)),
    ).subscribe();

    // 保留原本的 API
    // this.dropdownApi.queryTblUserOrgid().pipe(
    //   take(1),
    //   tap(res => this.usrOptions.set(res?.map(item => ({ value: item['Org_ID'], label: item['Org_Name'] } as Option)) ?? [])),
    //   finalize(() => this.logger.debug('查詢TblUserOrgidOptions結果:', [this.usrOptions()])),
    // ).subscribe();
  }

  // ---共用下拉---
  // 建立/變更 人員 下拉選單
  public queryTBLUSER_DropDownList(data: any): Observable<any> {
    return this.http.post<any>(`${environment.ApiUrl}/queryTBLUSER_DropDownList`, data);
  }
}

type UserFavorite = {
  CRT_Date: string;
  CRT_USR_Name: string;
  CRT_USR_No: string;
  FVT_SeqNo: number;
  ID: number;
  PROG_No: string;
  UPD_Date: string | null;
  UPD_USR_Name: string | null;
  UPD_USR_No: string | null;
  USER_No: string;
};



/**
 * @Date 2025/12/24
 * GetUserFavorite
 * 需求: 查詢條件：【建立者】、【修改者】串接錯api，需調整為 GetUserFavorite
 * 當時狀況如下 UPD_USR_No、UPD_USR_Name 皆為 null
 */
// [
//     {
//         "ID": 18174,
//         "USER_No": "admin",
//         "PROG_No": "CPM12020",
//         "FVT_SeqNo": 1,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18175,
//         "USER_No": "admin",
//         "PROG_No": "CPM12030",
//         "FVT_SeqNo": 2,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18176,
//         "USER_No": "admin",
//         "PROG_No": "CPM12070",
//         "FVT_SeqNo": 3,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18177,
//         "USER_No": "admin",
//         "PROG_No": "ASS11040",
//         "FVT_SeqNo": 4,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18178,
//         "USER_No": "admin",
//         "PROG_No": "FIN61020",
//         "FVT_SeqNo": 5,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18179,
//         "USER_No": "admin",
//         "PROG_No": "FIN55110",
//         "FVT_SeqNo": 6,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18180,
//         "USER_No": "admin",
//         "PROG_No": "TLS26080",
//         "FVT_SeqNo": 7,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18181,
//         "USER_No": "admin",
//         "PROG_No": "TLS24010",
//         "FVT_SeqNo": 8,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18182,
//         "USER_No": "admin",
//         "PROG_No": "FIN24010",
//         "FVT_SeqNo": 9,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18183,
//         "USER_No": "admin",
//         "PROG_No": "TLS41010",
//         "FVT_SeqNo": 10,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18184,
//         "USER_No": "admin",
//         "PROG_No": "TLS2J030",
//         "FVT_SeqNo": 11,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18185,
//         "USER_No": "admin",
//         "PROG_No": "FIN29060",
//         "FVT_SeqNo": 12,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18186,
//         "USER_No": "admin",
//         "PROG_No": "TLS32030",
//         "FVT_SeqNo": 13,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18187,
//         "USER_No": "admin",
//         "PROG_No": "TLS57040",
//         "FVT_SeqNo": 14,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18188,
//         "USER_No": "admin",
//         "PROG_No": "TLS56020",
//         "FVT_SeqNo": 15,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18189,
//         "USER_No": "admin",
//         "PROG_No": "TLS26010",
//         "FVT_SeqNo": 16,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18190,
//         "USER_No": "admin",
//         "PROG_No": "FIN35010",
//         "FVT_SeqNo": 17,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18191,
//         "USER_No": "admin",
//         "PROG_No": "CPM11080",
//         "FVT_SeqNo": 18,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18192,
//         "USER_No": "admin",
//         "PROG_No": "TLS21020",
//         "FVT_SeqNo": 19,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18193,
//         "USER_No": "admin",
//         "PROG_No": "FIN28010",
//         "FVT_SeqNo": 20,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18194,
//         "USER_No": "admin",
//         "PROG_No": "FIN21030",
//         "FVT_SeqNo": 21,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18195,
//         "USER_No": "admin",
//         "PROG_No": "CPM11070",
//         "FVT_SeqNo": 22,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18196,
//         "USER_No": "admin",
//         "PROG_No": "FIN55010",
//         "FVT_SeqNo": 23,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18197,
//         "USER_No": "admin",
//         "PROG_No": "TLS12020",
//         "FVT_SeqNo": 24,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     },
//     {
//         "ID": 18198,
//         "USER_No": "admin",
//         "PROG_No": "FIN55120",
//         "FVT_SeqNo": 25,
//         "CRT_Date": "2025-12-23T17:17:15.093",
//         "CRT_USR_No": "admin",
//         "CRT_USR_Name": "管理員",
//         "UPD_Date": null,
//         "UPD_USR_No": null,
//         "UPD_USR_Name": null
//     }
// ]
