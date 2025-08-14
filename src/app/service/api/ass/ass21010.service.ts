import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { IPOS2002LocationItem } from '@service/utility/dropDownList.service';
import { BaseQueryResponse, DropdownOption } from '@shared/models/api/base-api.interface';
import { catchError, finalize, of, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../../system/error-handler.service';

const apiUrl: string = `${environment.ApiUrl}`;

@Injectable({ providedIn: 'root' })
export class ASS21010Service {

  public readonly engTypeSignal = signal<DropdownOption[]>([]);
  public readonly engMeterNoSignal = signal<DropdownOption[]>([]);
  public readonly locationSignal = signal<IPOS2002LocationItem[]>([]);
  public readonly ASS21010Data = signal<unknown[]>([]);

  public engTypeLoading = !1;
  public engMeterNoLoading = !1;
  public locationLoading = !1;
  public tableLoading = !1;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  public loadEngType(): void {
    if (this.engTypeLoading) return void (this.engTypeLoading = !1);
    this.engTypeLoading = !0;
    of(engTypeMock).pipe(
      take(1),
      tap(response => this.engTypeSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.engTypeLoading = !1;
        console.log('查詢EngType結果:', [this.engTypeSignal()]);
      })
    ).subscribe();
  };

  public loadEngMeterNo(): void {
    if (this.engMeterNoLoading) return void (this.engMeterNoLoading = !1);
    this.engMeterNoLoading = !0;
    of(engMeterNoMock).pipe(
      take(1),
      tap(response => this.engMeterNoSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.engMeterNoLoading = !1;
        console.log('查詢EngMeterNo結果:', [this.engMeterNoSignal()]);
      })
    ).subscribe();
  };

  public loadLocationNo(): void {
    if (this.locationLoading) return void (this.locationLoading = !1);
    this.locationLoading = !0;
    this.http.post<any>(`${apiUrl}/queryPOS2002_DropDownList`, {}).pipe(
      take(1),
      tap(response => this.locationSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.locationLoading = !1;
        console.log('查詢Location結果:', [this.locationSignal()]);
      })
    ).subscribe();
  };

  /** 取資料 */
  public loadASS21010(query: unknown): void {
    if (this.tableLoading) return void (this.tableLoading = !1);
    this.tableLoading = !0;
    this.http.post<BaseQueryResponse<unknown>>(`${apiUrl}/ASS0000/ASS2000/queryASS21010`, query).pipe(
      take(1),
      tap(response => this.ASS21010Data.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.tableLoading = !1;
        console.log('查詢結果:', [this.ASS21010Data()]);
      })
    ).subscribe();
  };
}


const engTypeMock: BaseQueryResponse<DropdownOption> = {
  Status: 'success',
  Data: [
    { No: 'G01', Name: '水' },
    { No: 'G02', Name: '電' },
    { No: 'G03', Name: '瓦斯' },
  ],
  Error: undefined,
  Meta: undefined,
  Message: '查詢成功',
  TotalCount: 3,
  TotalPage: 1,
};
const engMeterNoMock: BaseQueryResponse<DropdownOption> = {
  Status: 'success',
  Data: [
    { No: 'AB001', Name: 'AB001' },
    { No: 'AB002', Name: 'AB002' },
    { No: 'AB003', Name: 'AB003' },
  ],
  Error: undefined,
  Meta: undefined,
  Message: '查詢成功',
  TotalCount: 3,
  TotalPage: 1,
};
