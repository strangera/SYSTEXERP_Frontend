import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../../shared/service/error-handler.service';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BankOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  //銀行
  getBankOptions(searchKeyword?: string): Observable<any[]> {
    const requestBody = {
      SearchKeyword: searchKeyword || ""
    };

    return this.http
      .post<any>(`${this.apiUrl}/queryBank_DropDownList`, requestBody)
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({ label: x.Name, value: x.No })) ?? [])
      );
  }
}
