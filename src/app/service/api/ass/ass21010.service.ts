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
  public readonly devNoSignal = signal<DropdownOption[]>([]);
  public readonly pos2002Signal = signal<IPOS2002LocationItem[]>([]);
  public readonly ASS21010Data = signal<unknown[]>([]);

  public engTypeLoading = !1;
  public devNoLoading = !1;
  public pos2002Loading = !1;
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

  public loadDevNo(): void {
    if (this.devNoLoading) return void (this.devNoLoading = !1);
    this.devNoLoading = !0;
    of(devNoMock).pipe(
      take(1),
      tap(response => this.devNoSignal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.devNoLoading = !1;
        console.log('查詢DevNo結果:', [this.devNoSignal()]);
      })
    ).subscribe();
  };

  public loadPosNo(): void {
    if (this.pos2002Loading) return void (this.pos2002Loading = !1);
    this.pos2002Loading = !0;
    this.http.post<any>(`${apiUrl}/queryPOS2002_DropDownList`, {}).pipe(
      take(1),
      tap(response => this.pos2002Signal.set(response.Data)),
      catchError(error => this.errorHandler.handleError(error)),
      finalize(() => {
        this.pos2002Loading = !1;
        console.log('查詢Pos2002結果:', [this.pos2002Signal()]);
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
const devNoMock: BaseQueryResponse<DropdownOption> = {
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
