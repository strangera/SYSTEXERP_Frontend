import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from '../../system/error-handler.service';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NegotiatorOptionsService {
  private apiUrl = environment.ApiUrl;

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) { }

  // 洽談者
  getNegotiatorOptions(): Observable<any[]> {
    return this.http
      .post<any>(`${this.apiUrl}/queryTBLUSER_DropDownList`, {}) // 傳空物件
      .pipe(
        map((res) => res?.Data?.map((x: any) => ({
          label: `${x.No} - ${x.Name}`,
          value: x.No
        })) ?? [])
      );
  }
}
