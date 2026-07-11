import { ApiResponse } from '@shared/utils/rxjs-operators/validate-api-response';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FIN73040Data, FIN73040Option, FIN73040Query } from '@pages/fin/fin73040/fin73040.model';
import { DropdownApiService } from '@service/utility/dropdown-api.service';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FIN73040Service {
  private readonly apiUrl = `${environment.ApiUrl}/FIN0000/FIN70000`;

  constructor(
    private http: HttpClient,
    private dropdownApiService: DropdownApiService,
  ) { }

  public queryFIN73040(query: FIN73040Query): Observable<ApiResponse<FIN73040Data[]>> {
    return this.http.post<ApiResponse<FIN73040Data[]>>(`${this.apiUrl}/queryFIN73040`, query);
  }

  public exportPDFFIN73040(body: FIN73040Query): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportPDFFIN73040`, this.stripPaging(body), {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  public exportExcelFIN73040(body: FIN73040Query): Observable<HttpResponse<Blob>> {
    return this.http.post(`${this.apiUrl}/exportExcelFIN73040`, this.stripPaging(body), {
      observe: 'response',
      responseType: 'blob' as 'json',
    }) as Observable<HttpResponse<Blob>>;
  }

  public getPaymentRequestNoOptions(): Observable<FIN73040Option[]> {
    return this.dropdownApiService.queryPOS2064MPCS_NoDropDownList().pipe(
      map((items) => (items ?? []).map((item) => ({
        label: String(item.label ?? ''),
        value: String(item.value ?? ''),
      }))),
    );
  }

  private stripPaging(query: FIN73040Query): FIN73040Query {
    const {
      PageIndex,
      PageSize,
      Offset,
      OrderBy,
      ...rest
    } = query;
    return rest;
  }
}
